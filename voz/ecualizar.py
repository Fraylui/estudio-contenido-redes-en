"""Ecualizador automático de voz: mide cómo suena una voz y la corrige hacia el balance de una voz clara.

Sirve para cualquier voz (grave, aguda, de celular, de micrófono) porque no usa ajustes fijos:
mide la energía por bandas, compara con una voz clara de referencia y calcula cada corrección.

Uso:
  python voz/ecualizar.py entrada.m4a salida.wav                 voz final para videos (-14 LUFS)
  python voz/ecualizar.py entrada.m4a salida.wav --referencia    voz para clonar con Chatterbox (-18 LUFS, 24 kHz)
  python voz/ecualizar.py narracion.wav salida.wav --sintetica    voz de Chatterbox: sin reductor de ruido
  python voz/ecualizar.py entrada.m4a --medir                    solo muestra el análisis

Cadena: filtro de graves, reducción de ruido suave, compresión, ecualización calculada,
control de eses y volumen en dos pasadas. Necesita ffmpeg y numpy.
"""
import json
import subprocess
import sys

import numpy as np

# Bandas de una voz y el balance de una voz clara (dB respecto al total).
# Medido sobre voces de locución: cuerpo en 250-500 Hz, claridad en 2-4 kHz y poco silbido arriba.
BANDAS = [  # (desde, hasta, centro del filtro, objetivo dB, máximo que se puede subir)
    (100, 250, 175, -7.0, 3),
    (250, 500, 350, -5.0, 3),
    (500, 1000, 700, -6.5, 4),
    (1000, 2000, 1400, -9.0, 6),
    (2000, 4000, 2800, -12.0, 8),
    (4000, 8000, 5600, -17.0, 4),  # más arriba suena áspera y con siseo
    (8000, 16000, 11000, -30.0, 2),  # en la voz sintética aquí casi solo hay soplido del vocoder
]
CORTE_MAX = -8.0  # lo máximo que se baja una banda


def leer(ruta, filtros=None):
    args = ["ffmpeg", "-v", "error", "-i", ruta]
    if filtros:
        args += ["-af", filtros]
    args += ["-ac", "1", "-ar", "48000", "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, dtype=np.float32)


def medir(x):
    """Energía de cada banda en dB respecto al total (solo en tramos con voz)."""
    n = 4096
    espectro = np.zeros(n // 2 + 1)
    ventana = np.hanning(n)
    for i in range(0, len(x) - n, n // 2):
        trozo = x[i:i + n]
        if np.sqrt(np.mean(trozo ** 2)) < 0.003:  # silencio: no cuenta
            continue
        espectro += np.abs(np.fft.rfft(trozo * ventana)) ** 2
    f = np.fft.rfftfreq(n, 1 / 48000)
    total = espectro.sum() or 1
    return [10 * np.log10(espectro[(f >= a) & (f < b)].sum() / total + 1e-12) for a, b, *_ in BANDAS]


def ecualizacion(x, pasadas=3):
    """Calcula las ganancias por banda acercándose al objetivo en varias pasadas."""
    ganancias = [0.0] * len(BANDAS)
    for _ in range(pasadas):
        medido = medir(aplicar(x, ganancias))
        for i, (_, _, _, objetivo, sube_max) in enumerate(BANDAS):
            ganancias[i] = float(np.clip(ganancias[i] + 0.8 * (objetivo - medido[i]), CORTE_MAX, sube_max))
    return ganancias


def cadena_eq(ganancias):
    return ",".join(
        f"equalizer=f={c}:t=q:w=1.0:g={g:.1f}" for (_, _, c, *_), g in zip(BANDAS, ganancias) if abs(g) >= 0.5
    )


def aplicar(x, ganancias):
    eq = cadena_eq(ganancias)
    if not eq:
        return x
    r = subprocess.run(
        ["ffmpeg", "-v", "error", "-f", "f32le", "-ar", "48000", "-ac", "1", "-i", "-", "-af", eq,
         "-f", "f32le", "-"], input=x.tobytes(), capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    entrada = args[0]
    referencia = "--referencia" in sys.argv

    # Antes de ecualizar: graves que no son voz, ruido de fondo suave y compresión pareja
    # Voz sintética (Chatterbox): no tiene ruido que quitar, y el reductor de ruido la vuelve metálica y robótica
    # Chatterbox genera a 24 kHz: sobre 11 kHz no hay voz, solo el soplido del vocoder (suena a tele sin señal)
    ruido = "lowpass=f=11000:poles=2," if "--sintetica" in sys.argv else "afftdn=nr=8:nf=-50,"
    base = f"highpass=f=85:poles=2,{ruido}acompressor=threshold=-26dB:ratio=2.5:attack=10:release=120:knee=6:makeup=2"
    x = leer(entrada, base)
    antes = medir(leer(entrada))
    ganancias = ecualizacion(x)
    despues = medir(aplicar(x, ganancias))

    print("banda (Hz)     antes  objetivo  después  corrección")
    for (a, b, _, objetivo, _), m0, m1, g in zip(BANDAS, antes, despues, ganancias):
        print(f"{a:>5}-{b:<5}  {m0:7.1f}  {objetivo:7.1f}  {m1:7.1f}  {g:+6.1f} dB")
    if "--medir" in sys.argv:
        return

    salida = args[1]
    volumen = "-18" if referencia else "-14"
    cadena = f"{base},{cadena_eq(ganancias)},deesser=i=0.4"
    medicion = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", entrada, "-af", f"{cadena},loudnorm=I={volumen}:TP=-1.5:LRA=9:print_format=json",
         "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(medicion[medicion.rindex("{"): medicion.rindex("}") + 1])
    loud = (f"loudnorm=I={volumen}:TP=-1.5:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}"
            f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    tasa = "24000" if referencia else "48000"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", entrada, "-af", f"{cadena},{loud}", "-ac", "1", "-ar", tasa, salida],
                   check=True)
    print(f"Listo: {salida} ({volumen} LUFS)")


if __name__ == "__main__":
    main()
