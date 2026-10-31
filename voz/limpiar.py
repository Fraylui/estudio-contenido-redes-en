"""Limpia una grabación de celular (nota de voz de WhatsApp, audio con cuarto vacío) antes de ecualizarla.

Arregla lo que el ecualizador no puede:
  1. picos recortados (el celular subió demasiado el volumen): ffmpeg adeclip;
  2. eco del cuarto: WPE (nara_wpe), que resta la cola de reverberación de cada sonido;
  3. ruido de fondo que cambia (calle, ventilador, tele): reducción espectral suave (noisereduce).
Después hay que pasarla por voz/ecualizar.py, que le devuelve el brillo y deja el volumen.

Uso: python voz/limpiar.py entrada.(opus|m4a|wav) salida.wav
Necesita ffmpeg, numpy, soundfile, nara_wpe y noisereduce (voz/instalar.sh).
"""
import subprocess
import sys

import noisereduce
import numpy as np
import soundfile as sf
from nara_wpe.utils import istft, stft
from nara_wpe.wpe import wpe

SR = 48000
entrada, salida = sys.argv[1], sys.argv[2]

# 1. Picos recortados y graves que no son voz
crudo = subprocess.run(["ffmpeg", "-v", "error", "-i", entrada, "-af", "adeclip,highpass=f=80",
                        "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(crudo, dtype=np.float32).astype(np.float64)
x *= 0.5 / (np.abs(x).max() or 1)

# 2. Eco: WPE con ventana de 32 ms; delay 3 respeta la voz directa y 10 tomas cubren unos 90 ms de cola
X = stft(x, size=1536, shift=384).T[:, None, :]  # (frecuencias, canales, cuadros)
Y = wpe(X, taps=10, delay=3, iterations=3, statistics_mode="full")
y = istft(Y[:, 0, :].T, size=1536, shift=384)[:len(x)]

# 3. Ruido de fondo: solo el 75 % para no borrar consonantes ni dejar sonido de "agua"
y = noisereduce.reduce_noise(y=y, sr=SR, stationary=False, prop_decrease=0.75, time_constant_s=2.0)

y *= 0.7 / (np.abs(y).max() or 1)
sf.write(salida, y.astype(np.float32), SR, subtype="PCM_24")
print(f"listo: {salida} ({len(y) / SR:.1f} s)")
