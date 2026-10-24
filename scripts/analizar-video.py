"""Analiza un video a detalle, como lo haría un editor: ritmo de cortes, duración de cada plano, palabras por minuto,
silencios, volumen y una hoja con los primeros 10 s (el gancho) y el resto del video.

Uso: voz/.venv/bin/python scripts/analizar-video.py <video.mp4> [carpeta-de-salida]
Sirve para nuestros videos (antes de publicar y para comparar los que funcionaron con los que no) y para grabaciones
de pantalla de videos de referencia. Escribe <carpeta>/<nombre>-informe.md y <nombre>-hoja.jpg.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

video = Path(sys.argv[1])
salida = Path(sys.argv[2]) if len(sys.argv) > 2 else video.parent
salida.mkdir(parents=True, exist_ok=True)
base = salida / video.stem


def ff(*args):
    return subprocess.run(["ffmpeg", "-hide_banner", *args], capture_output=True, text=True).stderr


info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(video)],
                                 capture_output=True, text=True).stdout)
dur = float(info["format"]["duration"])
v = next(s for s in info["streams"] if s["codec_type"] == "video")
ancho, alto = int(v["width"]), int(v["height"])

# Cortes de plano: cambios de escena con más del 12 % de diferencia (las transiciones suaves también cuentan)
cortes = [float(t) for t in re.findall(r"pts_time:([\d.]+)", ff("-i", str(video), "-vf", "select='gt(scene,0.12)',showinfo", "-f", "null", "-"))]
planos = [b - a for a, b in zip([0.0] + cortes, cortes + [dur])]
# Volumen y silencios
r128 = ff("-i", str(video), "-af", "ebur128", "-f", "null", "-")
lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", r128)
silencios = re.findall(r"silence_duration: ([\d.]+)", ff("-i", str(video), "-af", "silencedetect=n=-40dB:d=0.35", "-f", "null", "-"))

# Palabras por minuto y la primera frase (el gancho verbal), con Whisper
texto, primera = "", ""
try:
    from faster_whisper import WhisperModel
    segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(str(video), language="es")
    segs = list(segs)
    texto = " ".join(s.text.strip() for s in segs)
    primera = " ".join(s.text.strip() for s in segs if s.start < 6)
except Exception as e:  # sin Whisper, el informe sale igual sin esta parte
    texto = f"(sin transcripción: {e})"
palabras = len(texto.split()) if not texto.startswith("(") else 0

# Hoja: 10 cuadros del gancho (uno por segundo) + 10 repartidos en el resto
tiempos = [min(i, dur - 0.1) for i in range(10)] + [10 + (dur - 10) * k / 10 for k in range(10)] if dur > 12 else [dur * k / 20 for k in range(20)]
for k, t in enumerate(tiempos):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(video), "-frames:v", "1", "-vf", "scale=-2:270", f"{base}-c{k:02d}.jpg"])
cuadros = sorted(salida.glob(f"{video.stem}-c*.jpg"))
subprocess.run(["ffmpeg", "-v", "error", "-y", *sum([["-i", str(c)] for c in cuadros], []), "-filter_complex",
                "".join(f"[{i}]" for i in range(len(cuadros))) + f"xstack=inputs={len(cuadros)}:grid=10x2", f"{base}-hoja.jpg"])
for c in cuadros:
    c.unlink()

informe = f"""# Análisis de {video.name}

| Medida | Valor | Referencia de los canales grandes |
|---|---|---|
| Duración | {dur:.1f} s ({'vertical' if alto > ancho else 'horizontal'}) | Shorts de 20–40 s; largos de 6–10 min |
| Cortes de plano | {len(cortes)} ({len(cortes) / dur * 60:.0f} por minuto) | Shorts: 20–40 por minuto; largos: 10–20 |
| Plano más largo | {max(planos):.1f} s | Nada quieto más de 4–5 s |
| Plano promedio | {sum(planos) / len(planos):.1f} s | 1,5–3 s |
| Primer corte | {cortes[0] if cortes else dur:.1f} s | Algo cambia antes de los 2 s |
| Palabras por minuto | {palabras / dur * 60:.0f} | 150–190 |
| Silencios (más de 0,35 s) | {len(silencios)} | Pocos; solo antes de una revelación |
| Volumen integrado | {lufs[-1] if lufs else '?'} LUFS | −14 LUFS |

**Gancho verbal (primeros 6 s):** {primera or '(no se pudo transcribir)'}

**Planos más largos (dónde puede caer la atención):** {', '.join(f'{t:.1f} s en {s:.0f} s' for t, s in sorted(((p, s) for p, s in zip(planos, [0.0] + cortes)), reverse=True)[:3])}

Hoja de cuadros: `{base.name}-hoja.jpg` (fila 1: los primeros 10 s, uno por segundo; fila 2: el resto del video).
"""
Path(f"{base}-informe.md").write_text(informe)
print(informe)
