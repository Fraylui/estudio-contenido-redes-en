"""Escucha una grabación de voz a detalle, frase por frase, para elegir los mejores tramos de referencia al clonar.

Por cada frase (Whisper) mide: volumen, picos recortados, ruido (voz contra pausas cercanas), brillo (energía 2-8 kHz),
eco (cuánto tarda en apagarse el sonido al final de la frase) y confianza de Whisper. Da una nota de 0 a 100.
Uso: voz/.venv/bin/python scripts/analizar-voz.py <grabación> [informe.md]
"""
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

SR = 24000
ruta = sys.argv[1]
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", ruta, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                                 capture_output=True, check=True).stdout, dtype=np.float32)
db = lambda v: 20 * np.log10(v + 1e-9)
rms = lambda v: np.sqrt(np.mean(v ** 2)) if len(v) else 0.0
crudo = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", ruta, "-ac", "1", "-f", "s16le", "-"],
                                     capture_output=True, check=True).stdout, dtype=np.int16)
escala = len(crudo) / len(x)

segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(ruta, language="es", word_timestamps=True)
filas = []
for s in segs:
    a, b = int(s.start * SR), int(s.end * SR)
    voz = x[a:b]
    if len(voz) < SR:
        continue
    # ruido: el 10 % más bajo de ventanas de 30 ms dentro y alrededor de la frase
    v = x[max(0, a - SR):b + SR]
    ventanas = np.array([rms(v[i:i + 720]) for i in range(0, len(v) - 720, 720)])
    ruido = np.percentile(ventanas, 10)
    snr = db(rms(voz)) - db(ruido)
    recortes = int(np.sum(np.abs(crudo[int(a * escala):int(b * escala)]) >= 32700))
    esp = np.abs(np.fft.rfft(voz * np.hanning(len(voz)))) ** 2
    f = np.fft.rfftfreq(len(voz), 1 / SR)
    brillo = 10 * np.log10(esp[(f > 2000) & (f < 8000)].sum() / (esp[(f > 100) & (f < 1000)].sum() + 1e-9))
    # eco: caída de energía en los 150 ms después del final de la última palabra (más caída = menos eco)
    fin = int(s.words[-1].end * SR) if s.words else b
    cola = [rms(x[fin + i:fin + i + 360]) for i in range(0, 3600, 360)]
    caida = db(rms(x[fin - 2400:fin])) - db(min(cola) if cola else 1e-9)
    conf = float(np.exp(s.avg_logprob))
    nota = (min(snr, 40) / 40 * 35 + max(0, 1 - recortes / 50) * 20 + np.clip((brillo + 25) / 15, 0, 1) * 15
            + np.clip(caida / 35, 0, 1) * 15 + conf * 15)
    filas.append((s.start, s.end, db(rms(voz)), snr, recortes, brillo, caida, conf, nota, s.text.strip()))

filas.sort(key=lambda r: -r[8])
texto = "# Análisis de voz frase por frase\n\n| Inicio | Dur | Volumen dB | Voz/ruido dB | Recortes | Brillo dB | Caída cola dB | Whisper | Nota | Texto |\n|---|---|---|---|---|---|---|---|---|---|\n"
texto += "".join(f"| {a:.1f} | {b - a:.1f} | {v:.1f} | {s:.1f} | {r} | {br:.1f} | {c:.1f} | {w:.2f} | {n:.0f} | {t[:60]} |\n"
                 for a, b, v, s, r, br, c, w, n, t in filas)
med = np.median([f[3] for f in filas]), np.median([f[5] for f in filas]), sum(f[4] for f in filas)
texto += f"\nMediana voz/ruido {med[0]:.1f} dB, brillo {med[1]:.1f} dB, recortes totales {med[2]}.\n"
(open(sys.argv[2], "w").write(texto) if len(sys.argv) > 2 else None)
print(texto)
