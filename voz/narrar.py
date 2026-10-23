"""Narra la "narracion" de un archivo de contenido con una voz clonada (Chatterbox) en español latino.

Uso:  voz/.venv/bin/python voz/narrar.py contenido/mi-video.json public/voz/mi-video.wav [huella]
(npm run lote pasa la huella del texto narrado para no volver a narrar si no cambió.)

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
UMBRAL_SILENCIO = 0.006  # ~ -45 dBFS: no se come las "s", "f" y "h" suaves al recortar
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


UNIDADES = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce",
            "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte"]
DECENAS = {30: "treinta", 40: "cuarenta", 50: "cincuenta", 60: "sesenta", 70: "setenta", 80: "ochenta", 90: "noventa"}


def en_letras(n):
    """Números hasta 100 en palabras, para comparar "5" con "cinco" al revisar la voz."""
    if n <= 20:
        return UNIDADES[n]
    if n < 30:
        return "veinti" + UNIDADES[n - 20]
    if n < 100:
        d, u = divmod(n, 10)
        return DECENAS[d * 10] + ("" if u == 0 else " y " + UNIDADES[u])
    return str(n)


def normalizar_texto(x):
    x = re.sub(r"\d+", lambda m: en_letras(int(m.group())) if int(m.group()) <= 100 else m.group(), x.lower())
    return re.sub(r"[^a-záéíóúñü0-9 ]", "", x).split()


def recortar_cola(ruta, fin, margen=0.2):
    """Corta lo que el modelo genera después de la última palabra (respiraciones y ruido) y desvanece el final."""
    audio, sr = sf.read(str(ruta), dtype="float32")
    audio = audio[: min(len(audio), int((fin + margen) * sr))].copy()
    desv = min(int(0.08 * sr), len(audio))
    audio[-desv:] *= np.linspace(1, 0, desv)
    sf.write(str(ruta), audio, sr)


def a_48k(origen, destino, tempo=1.0):
    filtro = ["-af", f"atempo={tempo}"] if abs(tempo - 1) > 0.005 else []
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(origen), *filtro, "-ac", "1", "-ar", str(SR),
                    str(destino)], check=True)
    a, _ = sf.read(str(destino), dtype="float32")
    voz = np.nonzero(np.abs(a) > UMBRAL_SILENCIO)[0]
    margen = int(0.035 * SR)
    return a[max(voz[0] - margen, 0): voz[-1] + margen] if len(voz) else a


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
            segmentos = list(revisor.transcribe(sf.read(str(a16), dtype="float32")[0], language="es",
                                                word_timestamps=True)[0])
            oido = " ".join(s.text for s in segmentos)
            nota = difflib.SequenceMatcher(None, normalizar_texto(f["texto"]), normalizar_texto(oido)).ratio()
            palabras = [w for s in segmentos for w in (s.words or [])]
            if palabras:
                recortar_cola(crudo, palabras[-1].end)
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
    salida.parent.mkdir(parents=True, exist_ok=True)
    # Volumen parejo entre narraciones: sonoridad -16 LUFS (pico máximo -1.5 dB), no por pico.
    crudo = tmp / "narracion.wav"
    sf.write(str(crudo), total, SR)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(crudo), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                    "-ar", str(SR), "-ac", "1", str(salida)], check=True)
    huella = sys.argv[3] if len(sys.argv) > 3 else None
    salida.with_suffix(".json").write_text(json.dumps({"duracion": round(len(total) / SR, 3), "huella": huella,
                                                       "frases": tiempos}, ensure_ascii=False, indent=1),
                                           encoding="utf-8")
    print(f"Voz lista: {salida} ({len(total) / SR:.1f} s)")


if __name__ == "__main__":
    main()
