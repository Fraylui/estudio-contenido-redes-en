"""Narra la "narracion" de un archivo de contenido con una voz clonada (Chatterbox) en español latino.

Uso:  voz/.venv/bin/python voz/narrar.py contenido/mi-video.json public/voz/mi-video.wav

En el JSON, dentro de "props":
  "narracion": [
    "Texto simple",
    {"texto": "Con estilo y momento exacto", "estilo": "emocion", "en": 7.5}
  ]
Opcional, junto a "props":  "voz": {"referencia": "voz/referencias/xiomi.wav",
                                    "pronunciacion": {"Pichari": "Pichári"}, "seseo": true}

Estilos: normal, emocion, rapido, contando, pregunta (si no se indica: "?" al final = pregunta).
Cada frase se transcribe con Whisper y se vuelve a generar si no coincide con el texto.
"""
import difflib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

os.environ.setdefault("HF_ENDPOINT", os.environ.get("HF_ENDPOINT", "https://huggingface.co"))
import numpy as np
import soundfile as sf
import torch
import torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

SR = 48000
INICIO, PAUSA, FINAL = 0.3, 0.35, 0.5
ESTILOS = {
    "normal":   {"exageracion": 0.40, "cfg": 0.30, "tempo": 1.00},
    "emocion":  {"exageracion": 0.65, "cfg": 0.30, "tempo": 1.00},
    "rapido":   {"exageracion": 0.50, "cfg": 0.40, "tempo": 1.10},
    "contando": {"exageracion": 0.35, "cfg": 0.30, "tempo": 0.97},
    "pregunta": {"exageracion": 0.50, "cfg": 0.30, "tempo": 1.00},
}
# Nombres que el modelo acentúa mal: se le dan escritos como se pronuncian (el texto en pantalla no cambia).
PRONUNCIACION = {"kimbiri": "Kimbíri", "huamanga": "Huamánga", "vraem": "Vráem", "pnp": "pe ene pe",
                 "ugel": "úguel", "essalud": "es salúd", "sis": "ese i ese"}


def seseo(texto):
    """Español latino: c (ante e, i) y z suenan como s (policía -> polisía)."""
    t = re.sub(r"z", "s", re.sub(r"Z", "S", texto))
    return re.sub(r"C(?=[eiéíEIÉÍ])", "S", re.sub(r"c(?=[eiéí])", "s", t))


def para_voz(texto, cfg):
    reemplazos = {**PRONUNCIACION, **{k.lower(): v for k, v in cfg.get("pronunciacion", {}).items()}}
    for palabra, como in reemplazos.items():
        texto = re.sub(rf"\b{re.escape(palabra)}\b", como, texto, flags=re.IGNORECASE)
    return seseo(texto) if cfg.get("seseo", True) else texto


def normalizar_texto(x):
    return re.sub(r"[^a-záéíóúñü0-9 ]", "", x.lower()).split()


def a_48k(origen, destino, tempo=1.0):
    filtro = ["-af", f"atempo={tempo}"] if abs(tempo - 1) > 0.005 else []
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(origen), *filtro, "-ac", "1", "-ar", str(SR),
                    str(destino)], check=True)
    a, _ = sf.read(str(destino), dtype="float32")
    voz = np.nonzero(np.abs(a) > 0.02)[0]
    return a[max(voz[0] - 480, 0): voz[-1] + 480] if len(voz) else a


def main():
    entrada, salida = Path(sys.argv[1]), Path(sys.argv[2])
    datos = json.loads(entrada.read_text(encoding="utf-8"))
    cfg = datos.get("voz", {})
    frases = [{"texto": f} if isinstance(f, str) else f for f in datos["props"]["narracion"]]
    referencia = Path(cfg.get("referencia", "voz/referencias/xiomi.wav"))
    if not referencia.exists():
        sys.exit(f"Falta la voz de referencia {referencia}. Lee voz/referencias/LEEME.md")

    torch.set_num_threads(os.cpu_count())
    modelo = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
    from faster_whisper import WhisperModel
    revisor = WhisperModel("deepdml/faster-whisper-large-v3-turbo-ct2", device="cpu", compute_type="int8")

    tmp = Path(tempfile.mkdtemp())
    partes, tiempos, t = [np.zeros(int(INICIO * SR), np.float32)], [], INICIO
    for n, f in enumerate(frases, start=1):
        estilo = f.get("estilo") or ("pregunta" if f["texto"].strip().endswith("?") else "normal")
        e = ESTILOS[estilo]
        mejor, mejor_nota = None, -1
        for intento in range(1, 4):
            torch.manual_seed(intento * 100 + n)
            wav = modelo.generate(para_voz(f["texto"], cfg), language_id="es", audio_prompt_path=str(referencia),
                                  exaggeration=e["exageracion"], cfg_weight=e["cfg"])
            crudo = tmp / f"{n}-{intento}.wav"
            ta.save(str(crudo), wav, modelo.sr)
            a16 = tmp / "rev.wav"
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(crudo), "-ac", "1", "-ar", "16000", str(a16)],
                           check=True)
            oido = " ".join(s.text for s in revisor.transcribe(sf.read(str(a16), dtype="float32")[0], language="es")[0])
            nota = difflib.SequenceMatcher(None, normalizar_texto(f["texto"]), normalizar_texto(oido)).ratio()
            if nota > mejor_nota:
                mejor, mejor_nota = crudo, nota
            if nota >= 0.85:
                break
        print(f"[{n}/{len(frases)}] {estilo:8s} coincide {mejor_nota * 100:3.0f}%  {f['texto'][:50]}", flush=True)
        audio = a_48k(mejor, tmp / f"{n}.wav", e["tempo"])
        if "en" in f and f["en"] > t:
            partes.append(np.zeros(int((f["en"] - t) * SR), np.float32))
            t = f["en"]
        tiempos.append({"texto": f["texto"], "inicio": round(t, 3), "fin": round(t + len(audio) / SR, 3)})
        partes += [audio, np.zeros(int(f.get("pausa", PAUSA) * SR), np.float32)]
        t += len(audio) / SR + f.get("pausa", PAUSA)

    total = np.concatenate(partes + [np.zeros(int(FINAL * SR), np.float32)])
    total = total / (np.abs(total).max() or 1) * 0.89
    salida.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(salida), total, SR)
    salida.with_suffix(".json").write_text(json.dumps({"duracion": round(len(total) / SR, 3), "frases": tiempos},
                                                      ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Voz lista: {salida} ({len(total) / SR:.1f} s)")


if __name__ == "__main__":
    main()
