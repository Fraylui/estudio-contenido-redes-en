"""Narra la "narracion" de un archivo de contenido con una voz clonada (Chatterbox) en español latino.

Uso:  voz/.venv/bin/python voz/narrar.py contenido/mi-video.json public/voz/mi-video.wav [huella]
(npm run lote pasa la huella del texto narrado para no volver a narrar si no cambió.)

En el JSON, dentro de "props":
  "narracion": [
    "Texto simple",
    {"texto": "Con estilo y momento exacto", "estilo": "emocion", "en": 7.5}
  ]
Opcional, junto a "props":  "voz": {"referencia": "voz/referencias/xiomi.wav", "velocidad": 1.1,
                                    "pronunciacion": {"Pichari": "Pichári"}, "seseo": true}

Estilos: normal, emocion, feliz, triste, serio, suspenso, urgente, calmado, vendedor, rapido, contando,
pregunta (si no se indica: "?" al final = pregunta). Los estilos alegres usan la referencia "<voz>-alegre.wav"
y los serios "<voz>.wav", si existen (por ejemplo xiomi-alegre.wav grabada leyendo un cuento).
Cada frase se transcribe con Whisper y se vuelve a generar si no coincide con el texto.
"""
import difflib
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path

os.environ.setdefault("HF_ENDPOINT", os.environ.get("HF_ENDPOINT", "https://huggingface.co"))
import numpy as np
import soundfile as sf
import torch
import torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

SR = 48000
INICIO, PAUSA, FINAL = 0.3, 0.35, 0.5
# exageracion: intensidad de la emoción · cfg: más alto = más pausado y fiel al texto · tempo: velocidad final
# tono: qué grabación de referencia usar ("alegre" o "seria")
ESTILOS = {
    "normal":   {"exageracion": 0.40, "cfg": 0.30, "tempo": 1.00, "tono": "seria"},
    "emocion":  {"exageracion": 0.65, "cfg": 0.30, "tempo": 1.00, "tono": "alegre"},
    "feliz":    {"exageracion": 0.70, "cfg": 0.30, "tempo": 1.03, "tono": "alegre"},
    "vendedor": {"exageracion": 0.60, "cfg": 0.35, "tempo": 1.05, "tono": "alegre"},
    "urgente":  {"exageracion": 0.75, "cfg": 0.25, "tempo": 1.08, "tono": "alegre"},
    "triste":   {"exageracion": 0.30, "cfg": 0.50, "tempo": 0.92, "tono": "seria"},
    "serio":    {"exageracion": 0.35, "cfg": 0.45, "tempo": 0.98, "tono": "seria"},
    "suspenso": {"exageracion": 0.45, "cfg": 0.55, "tempo": 0.90, "tono": "seria"},
    "calmado":  {"exageracion": 0.30, "cfg": 0.50, "tempo": 0.95, "tono": "seria"},
    "rapido":   {"exageracion": 0.50, "cfg": 0.40, "tempo": 1.10, "tono": "alegre"},
    "contando": {"exageracion": 0.35, "cfg": 0.30, "tempo": 0.97, "tono": "alegre"},
    "pregunta": {"exageracion": 0.50, "cfg": 0.30, "tempo": 1.00, "tono": "seria"},
}
# Nombres que el modelo acentúa mal: se le dan escritos como se pronuncian (el texto en pantalla no cambia).
PRONUNCIACION = {"kimbiri": "Kimbíri", "huamanga": "Huamánga", "vraem": "Vráem", "pnp": "pe ene pe",
                 "ugel": "úguel", "essalud": "es salúd", "sis": "ese i ese",
                 "pichari": "Pichári", "palmapampa": "Palmapámpa", "pichiwillca": "Pichiwílca",
                 "chirumpiari": "Chirumpiári", "tutumbaru": "Tutumbáru", "sirenachayocc": "Sirenachayók",
                 "quinuapata": "Kinuapáta", "sd": "ese de", "jr": "jirón", "av": "avenida"}
DIGITOS = "cero uno dos tres cuatro cinco seis siete ocho nueve".split()


def telefonos(texto):
    """Un celular (943 960 656 o 943960656) se dice cifra por cifra, de tres en tres."""
    def decir(m):
        cifras = re.sub(r"\D", "", m.group(0))
        return ", ".join(" ".join(DIGITOS[int(c)] for c in cifras[i:i + 3]) for i in range(0, len(cifras), 3))
    return re.sub(r"\b\d{3}[ .-]?\d{3}[ .-]?\d{3}\b", decir, texto)


def seseo(texto):
    """Español latino: c (ante e, i) y z suenan como s (policía -> polisía)."""
    t = re.sub(r"z", "s", re.sub(r"Z", "S", texto))
    return re.sub(r"C(?=[eiéíEIÉÍ])", "S", re.sub(r"c(?=[eiéí])", "s", t))


UNIDADES = "cero uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete dieciocho diecinueve veinte veintiuno veintidós veintitrés veinticuatro veinticinco veintiséis veintisiete veintiocho veintinueve".split()
DECENAS = "_ _ _ treinta cuarenta cincuenta sesenta setenta ochenta noventa".split()
CENTENAS = "_ ciento doscientos trescientos cuatrocientos quinientos seiscientos setecientos ochocientos novecientos".split()


def en_palabras(n):
    """Números de 0 a 9999 en palabras: el modelo pronuncia mal las cifras (340 -> "treinta treinta")."""
    if n < 30:
        return UNIDADES[n]
    if n < 100:
        return DECENAS[n // 10] + ("" if n % 10 == 0 else " y " + UNIDADES[n % 10])
    if n == 100:
        return "cien"
    if n < 1000:
        return CENTENAS[n // 100] + ("" if n % 100 == 0 else " " + en_palabras(n % 100))
    miles = "mil" if n // 1000 == 1 else en_palabras(n // 1000) + " mil"
    return miles + ("" if n % 1000 == 0 else " " + en_palabras(n % 1000))


def numeros(texto):
    return re.sub(r"\b\d{1,4}\b", lambda m: en_palabras(int(m.group(0))), texto)


def para_voz(texto, cfg):
    texto = numeros(telefonos(texto))
    # Abreviaturas con punto: el punto no debe sonar como pausa
    texto = re.sub(r"\bJr\.\s*", "jirón ", texto, flags=re.IGNORECASE)
    texto = re.sub(r"\bAv\.\s*", "avenida ", texto, flags=re.IGNORECASE)
    reemplazos = {**PRONUNCIACION, **{k.lower(): v for k, v in cfg.get("pronunciacion", {}).items()}}
    for palabra, como in reemplazos.items():
        texto = re.sub(rf"\b{re.escape(palabra)}\b", como, texto, flags=re.IGNORECASE)
    return seseo(texto) if cfg.get("seseo", True) else texto


def normalizar_texto(x):
    # Cifras a palabras: "943" escrito y "nueve cuatro tres" oído cuentan como lo mismo al revisar la voz
    x = numeros(telefonos(x)).lower()
    # Sin tildes: Whisper a veces escribe "contactanos" por "contáctanos"
    x = "".join(c for c in unicodedata.normalize("NFD", x) if unicodedata.category(c) != "Mn" or c == "̃")
    return re.sub(r"[^a-zñ0-9 ]", "", unicodedata.normalize("NFC", x)).split()


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
    # Umbral bajo (-45 dBFS) y 35 ms de margen: no se come las "s", "f" o finales que se apagan
    voz = np.nonzero(np.abs(a) > 0.0056)[0]
    margen = int(0.035 * SR)
    return a[max(voz[0] - margen, 0): voz[-1] + margen] if len(voz) else a


def nivelar(audio, objetivo_db=-20.0):
    """Todas las frases al mismo volumen (RMS de las partes con voz), para que ninguna suene más fuerte."""
    voz = audio[np.abs(audio) > 0.01]
    if not len(voz):
        return audio
    rms = np.sqrt(np.mean(voz ** 2))
    return audio * (10 ** (objetivo_db / 20) / rms)


def agregar(partes, tiempos, t, f, audio):
    if "en" in f and f["en"] > t:
        partes.append(np.zeros(int((f["en"] - t) * SR), np.float32))
        t = f["en"]
    tiempos.append({"texto": f["texto"], "inicio": round(t, 3), "fin": round(t + len(audio) / SR, 3)})
    partes = partes + [audio.astype(np.float32), np.zeros(int(f.get("pausa", PAUSA) * SR), np.float32)]
    return partes, tiempos, t + len(audio) / SR + f.get("pausa", PAUSA)


def main():
    entrada, salida = Path(sys.argv[1]), Path(sys.argv[2])
    datos = json.loads(entrada.read_text(encoding="utf-8"))
    cfg = datos.get("voz", {})
    frases = [{"texto": f} if isinstance(f, str) else f for f in datos["props"]["narracion"]]
    referencia = Path(cfg.get("referencia", "voz/referencias/xiomi.wav"))
    if not referencia.exists():
        sys.exit(f"Falta la voz de referencia {referencia}. Lee voz/referencias/LEEME.md")

    torch.set_num_threads(os.cpu_count())
    modelos = {}

    def cargar():
        # Los modelos se cargan solo si alguna frase no está ya generada
        if not modelos:
            from faster_whisper import WhisperModel
            modelos["voz"] = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
            modelos["revisor"] = WhisperModel("deepdml/faster-whisper-large-v3-turbo-ct2", device="cpu",
                                              compute_type="int8")
        return modelos["voz"], modelos["revisor"]

    # Memoria de frases: una frase ya generada con el mismo texto, estilo y voz no se vuelve a generar.
    # Para repetir una que salió mal sin cambiar el texto, cámbiale la "semilla" en el JSON.
    memoria = salida.parent / ".frases"
    memoria.mkdir(parents=True, exist_ok=True)

    tmp = Path(tempfile.mkdtemp())
    partes, tiempos, t = [np.zeros(int(INICIO * SR), np.float32)], [], INICIO
    for n, f in enumerate(frases, start=1):
        estilo = f.get("estilo") or ("pregunta" if f["texto"].strip().endswith("?") else "normal")
        e = ESTILOS[estilo]
        alegre = referencia.with_name(f"{referencia.stem}-alegre{referencia.suffix}")
        ref = alegre if e["tono"] == "alegre" and alegre.exists() else referencia
        clave = hashlib.sha1(json.dumps([para_voz(f["texto"], cfg), estilo, ref.name, ref.stat().st_size,
                                         f.get("semilla", 0)]).encode()).hexdigest()[:16]
        guardada = memoria / f"{clave}.wav"
        if guardada.exists():
            audio, _ = sf.read(str(guardada), dtype="float32")
            print(f"[{n}/{len(frases)}] {estilo:8s} (ya generada)  {f['texto'][:50]}", flush=True)
            partes, tiempos, t = agregar(partes, tiempos, t, f, audio)
            continue
        modelo, revisor = cargar()
        mejor, mejor_nota = None, -1
        for intento in range(1, 4):
            torch.manual_seed(intento * 100 + n + 1000 * f.get("semilla", 0))
            wav = modelo.generate(para_voz(f["texto"], cfg), language_id="es", audio_prompt_path=str(ref),
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
        audio = nivelar(a_48k(mejor, tmp / f"{n}.wav", e["tempo"]))
        sf.write(str(guardada), audio, SR)
        partes, tiempos, t = agregar(partes, tiempos, t, f, audio)

    total = np.concatenate(partes + [np.zeros(int(FINAL * SR), np.float32)])
    total = total / (np.abs(total).max() or 1) * 0.89
    salida.parent.mkdir(parents=True, exist_ok=True)
    crudo = salida.with_name(salida.stem + "-crudo.wav")
    sf.write(str(crudo), total, SR)
    # "velocidad" junto a "voz" en el JSON: acelera o frena toda la narración sin cambiar el tono
    velocidad = float(cfg.get("velocidad", 1.0))
    if abs(velocidad - 1) > 0.005:
        rapido = crudo.with_name(crudo.stem + "-v.wav")
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(crudo), "-af", f"atempo={velocidad}",
                        str(rapido)], check=True)
        rapido.replace(crudo)
        for x in tiempos:
            x["inicio"], x["fin"] = round(x["inicio"] / velocidad, 3), round(x["fin"] / velocidad, 3)
        total = sf.read(str(crudo), dtype="float32")[0]
    # Acabado de locución: el ecualizador automático corrige el balance y deja el volumen a -14 LUFS
    subprocess.run([sys.executable, str(Path(__file__).with_name("ecualizar.py")), str(crudo), str(salida)], check=True)
    crudo.unlink()
    huella = sys.argv[3] if len(sys.argv) > 3 else None
    salida.with_suffix(".json").write_text(json.dumps({"duracion": round(len(total) / SR, 3), "huella": huella,
                                                       "frases": tiempos}, ensure_ascii=False, indent=1),
                                           encoding="utf-8")
    print(f"Voz lista: {salida} ({len(total) / SR:.1f} s)")


if __name__ == "__main__":
    main()
