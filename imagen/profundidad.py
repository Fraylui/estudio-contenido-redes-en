"""Mapa de profundidad de cada escenario (Depth Anything V2 Small, Apache 2.0) para mover la cámara en 2.5D.

Escribe public/assets/ia/<nombre>-prof.png (blanco = cerca, negro = lejos), que Pizarra.tsx usa para el paralaje.
Uso: imagen/.venv/bin/python imagen/profundidad.py [nombre ...]   (sin nombres: todos los que falten)
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from transformers import pipeline

carpeta = Path("public/assets/ia")
nombres = sys.argv[1:] or [p.stem for p in carpeta.glob("*.jpg") if not (carpeta / f"{p.stem}-prof.png").exists()]
profundidad = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device="cpu")
for n in nombres:
    img = Image.open(carpeta / f"{n}.jpg").convert("RGB")
    d = np.array(profundidad(img)["depth"].resize(img.size), dtype=np.float32)
    d = (d - d.min()) / (np.ptp(d) or 1) * 255
    # Suavizado: sin él, los bordes de los objetos se rompen al mover la cámara
    Image.fromarray(d.astype(np.uint8)).filter(ImageFilter.GaussianBlur(4)).save(carpeta / f"{n}-prof.png")
    print("listo", n)
