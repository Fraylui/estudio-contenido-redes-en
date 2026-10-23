"""Genera imágenes con SD-Turbo (Stability AI) en el procesador, sin tarjeta gráfica ni créditos.

Uso:
  imagen/.venv/bin/python imagen/generar.py "a cute cat reading a book" salida.png
  imagen/.venv/bin/python imagen/generar.py "alarm clock" reloj.png --estilo pizarra --sin-fondo --variantes 4

  --estilo pizarra   dibujo a mano con tinta negra y colores planos, para que combine con los videos de pizarra
  --sin-fondo        quita el fondo (toma el color de las esquinas) y guarda PNG transparente
  --variantes N      genera N versiones (salida-1.png, salida-2.png…) para elegir la mejor
  --semilla S        repite exactamente la misma imagen
  --ancho/--alto     múltiplos de 64; el modelo rinde mejor cerca de 512x512

Los prompts van en inglés: el modelo los entiende mucho mejor.
Licencia: Stability AI Community License (ver imagen/instalar.sh).
"""
import argparse
import time
from pathlib import Path

import numpy as np
import torch
from diffusers import AutoPipelineForText2Image
from PIL import Image

ESTILOS = {
    "pizarra": ("{p}, hand-drawn doodle illustration, thick black ink outlines, flat pastel colors, simple, "
                "cute, centered, isolated on plain white background, no text"),
    "foto": "{p}, photo, natural light, high detail",
    "ninguno": "{p}",
}


def quitar_fondo(img: Image.Image, tolerancia: int = 38) -> Image.Image:
    """Vuelve transparente el color del fondo (el promedio de las 4 esquinas) con un borde suave."""
    a = np.asarray(img.convert("RGB")).astype(np.int16)
    esquinas = np.array([a[0, 0], a[0, -1], a[-1, 0], a[-1, -1]]).mean(0)
    dist = np.sqrt(((a - esquinas) ** 2).sum(-1))
    alfa = np.clip((dist - tolerancia) / tolerancia, 0, 1) * 255
    rgba = np.dstack([a.astype(np.uint8), alfa.astype(np.uint8)])
    return Image.fromarray(rgba, "RGBA")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt")
    ap.add_argument("salida")
    ap.add_argument("--estilo", choices=ESTILOS, default="ninguno")
    ap.add_argument("--sin-fondo", action="store_true")
    ap.add_argument("--variantes", type=int, default=1)
    ap.add_argument("--semilla", type=int, default=0)
    ap.add_argument("--pasos", type=int, default=2)
    ap.add_argument("--ancho", type=int, default=512)
    ap.add_argument("--alto", type=int, default=512)
    args = ap.parse_args()

    torch.set_num_threads(torch.get_num_threads())
    pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sd-turbo", torch_dtype=torch.float32)
    prompt = ESTILOS[args.estilo].format(p=args.prompt)
    salida = Path(args.salida)
    for i in range(args.variantes):
        t0 = time.time()
        img = pipe(prompt=prompt, num_inference_steps=args.pasos, guidance_scale=0.0, width=args.ancho,
                   height=args.alto, generator=torch.Generator().manual_seed(args.semilla + i)).images[0]
        if args.sin_fondo:
            img = quitar_fondo(img)
        destino = salida if args.variantes == 1 else salida.with_name(f"{salida.stem}-{i + 1}{salida.suffix}")
        destino.parent.mkdir(parents=True, exist_ok=True)
        img.save(destino)
        print(f"{destino} ({time.time() - t0:.0f} s)", flush=True)


if __name__ == "__main__":
    main()
