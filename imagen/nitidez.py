"""Agranda y da nitidez a las imágenes hechas con IA (Real-ESRGAN x4plus, BSD-3; pesos de Comfy-Org en safetensors).

SD-Turbo da 512–768 px y en un video de 1080x1920 se ve borroso: esto lo lleva a 4x y luego se reduce a lo necesario.
Uso: imagen/.venv/bin/python imagen/nitidez.py <entrada.(png|jpg)> <salida> [ancho-final]
"""
import sys

import numpy as np
import torch
from huggingface_hub import hf_hub_download
from PIL import Image
from spandrel import ModelLoader

entrada, salida = sys.argv[1], sys.argv[2]
ancho = int(sys.argv[3]) if len(sys.argv) > 3 else 0
modelo = ModelLoader().load_from_file(hf_hub_download("Comfy-Org/Real-ESRGAN", "RealESRGAN_x4plus.safetensors")).eval()
img = Image.open(entrada)
alfa = img.getchannel("A") if img.mode == "RGBA" else None
x = torch.from_numpy(np.array(img.convert("RGB"), dtype=np.float32) / 255).permute(2, 0, 1)[None]
with torch.no_grad():
    y = modelo(x)[0].clamp(0, 1).permute(1, 2, 0).numpy()
grande = Image.fromarray((y * 255).round().astype(np.uint8))
if alfa is not None:
    grande.putalpha(alfa.resize(grande.size, Image.LANCZOS))
if ancho:
    grande = grande.resize((ancho, round(grande.height * ancho / grande.width)), Image.LANCZOS)
grande.save(salida, quality=92) if salida.endswith(".jpg") else grande.save(salida)
print("listo", salida, grande.size)
