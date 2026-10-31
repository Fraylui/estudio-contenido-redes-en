"""Quita el silencio del inicio de una voz ya grabada (la voz debe arrancar en el primer cuadro: el 58 % deslizaba antes).

Uso: python3 scripts/recortar-inicio-voz.py short-peor-suerte [short-otro…]
Recorta public/voz/<n>.wav para que la primera frase empiece en 0,05 s y corre todos los tiempos de public/voz/<n>.json.
"""
import json
import subprocess
import sys
from pathlib import Path

for n in sys.argv[1:]:
    wav, js = Path(f"public/voz/{n}.wav"), Path(f"public/voz/{n}.json")
    d = json.loads(js.read_text())
    corte = round(d["frases"][0]["inicio"] - 0.05, 3)
    if corte <= 0.02:
        print(f"{n}: ya empieza al inicio"); continue
    tmp = wav.with_suffix(".tmp.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-ss", str(corte), "-c:a", "pcm_s16le", str(tmp)], check=True)
    tmp.replace(wav)
    for f in d["frases"]:
        f["inicio"] = round(f["inicio"] - corte, 3); f["fin"] = round(f["fin"] - corte, 3)
    d["duracion"] = round(d["duracion"] - corte, 3)
    js.write_text(json.dumps(d, ensure_ascii=False, indent=1))
    print(f"{n}: recortados {corte} s")
