"""Genera imágenes con SD-Turbo (Stability AI) en el procesador, sin tarjeta gráfica ni créditos.

Uso:
  imagen/.venv/bin/python imagen/generar.py "a cute cat reading a book" salida.png
  imagen/.venv/bin/python imagen/generar.py "alarm clock" reloj.png --estilo pizarra --sin-fondo --variantes 4

  --estilo escena    fondo ilustrado detallado (lo mejor de este modelo): usar --ancho 768 --alto 448 --pasos 4
  --estilo objeto    un objeto suelto sobre blanco (usar con --sin-fondo)
  --estilo pizarra   dibujo a mano con tinta negra y colores planos, para que combine con los videos de pizarra
  --sin-fondo        quita el fondo (toma el color de las esquinas) y guarda PNG transparente
  --variantes N      genera N versiones (salida-1.png, salida-2.png…) para elegir la mejor
  --semilla S        repite exactamente la misma imagen
  --ancho/--alto     múltiplos de 64; el modelo rinde mejor cerca de 512x512

Los prompts van en inglés: el modelo los entiende mucho mejor.
Licencia: Stability AI Community License (ver imagen/instalar.sh).
"""
import argparse
import os
import time
from pathlib import Path

import numpy as np
import torch
from diffusers import AutoPipelineForText2Image
from PIL import Image

ESTILOS = {
    "pizarra": ("{p}, hand-drawn doodle illustration, thick black ink outlines, flat pastel colors, simple, "
                "cute, centered, isolated on plain white background, no text"),
    # Escenas de fondo (16:9, p. ej. --ancho 768 --alto 448 --pasos 4): este sufijo probado da ilustraciones detalladas
    "escena": ("{p}, flat vector illustration, kurzgesagt style, clean geometric shapes, smooth gradients, soft shadows, "
               "vibrant limited color palette, high detail, crisp edges, no text, no people"),
    # Un objeto suelto: centrado y sobre blanco para poder recortarlo con --sin-fondo
    "objeto": ("a single {p}, centered, isolated on plain white background, flat vector illustration, kurzgesagt style, "
               "clean geometric shapes, smooth gradients, soft shadows, vibrant limited color palette, crisp edges, no text"),
    # Objetos 3D tipo plastilina: el estilo que mejor sale con este modelo (usar con --sin-fondo --pasos 4 --variantes 3)
    "objeto3d": ("{p}, single object, centered, isolated on a pure white background, cute 3d clay render, soft rounded shapes, "
                 "glossy plastic material, soft studio lighting, gentle shadow under the object, pastel colors, high detail, "
                 "no text, no letters"),
    # Desde el 28 oct (el usuario pidió imágenes "al máximo", como los Shorts épicos de referencia):
    # objeto realista con materiales de verdad (no plastilina) y escenario cinematográfico tipo pintura mate
    "objeto-epico": ("{p}, single object, centered, isolated on a pure white background, highly detailed realistic 3d render, "
                     "physically based materials, rich textures, dramatic studio rim light, sharp focus, no text, no letters"),
    "epico": ("{p}, epic cinematic matte painting, dramatic volumetric lighting, god rays, atmospheric haze, highly detailed, "
              "realistic, rich warm colors, strong depth, no text, no letters, no watermark"),
    # 2D que "sube de nivel" (pedido del usuario el 29 oct; usar con FLUX, SD-Turbo los ensucia).
    # Sistema de 4 capas: {p} = personaje (rasgos fijos + ropa + pose) + objeto + lugar; aquí va el acabado.
    "manhwa": ("{p}, korean manhwa webtoon illustration, semi-realistic human proportions, clean closed lineart, "
               "soft cel shading, limited color palette, cinematic composition, one clear subject, no text"),
    "anime": ("{p}, modern japanese anime illustration, detailed expressive eyes, clean closed lineart, soft cel shading, "
              "vibrant colors, studio quality key visual, one clear subject, no text"),
    # 2D tradicional de cine (cel animation de los 90): plano, sin volumen. Nunca nombrar películas ni personajes con dueño.
    "2d-clasico": ("{p}, classic 1990s hand-drawn 2D cel animation still, flat colors, bold clean ink outlines, "
                   "painted watercolor background, expressive cartoon character, no 3d, no text"),
    # Ficha de personaje: solo, cuerpo entero, fondo liso magenta para recortarlo perfecto
    "ficha": ("{p}, full body character sheet, standing, front view, centered, isolated on a flat solid magenta background, "
              "clean closed lineart, soft cel shading, no shadows on background, no text"),
    # Fondo para el personaje fijo de Khipu (plan del 29 oct, estilo Axen/Ifverse): escenario 2D plano y sin nadie,
    # el personaje lo pone Remotion encima. Una sola variante: sin personas FLUX no falla.
    "fondo2d": ("{p}, flat 2D cartoon background illustration, clean bold outlines, bright saturated colors, simple shapes, "
                "wide empty scene, no people, no characters, no animals, no text"),
    "foto": "{p}, photo, natural light, high detail",
    "ninguno": "{p}",
}


def quitar_fondo(img: Image.Image, tolerancia: int = 38) -> Image.Image:
    """Recorta el objeto con la IA de rembg (isnet, gratis y local); si no está instalada, usa el color de las esquinas."""
    try:
        from rembg import new_session, remove
        recorte = remove(img, session=new_session("isnet-general-use"), post_process_mask=True)
        return recorte.crop(recorte.getbbox())
    except ImportError:
        pass
    a = np.asarray(img.convert("RGB")).astype(np.int16)
    esquinas = np.array([a[0, 0], a[0, -1], a[-1, 0], a[-1, -1]]).mean(0)
    dist = np.sqrt(((a - esquinas) ** 2).sum(-1))
    alfa = np.clip((dist - tolerancia) / tolerancia, 0, 1) * 255
    rgba = np.dstack([a.astype(np.uint8), alfa.astype(np.uint8)])
    return Image.fromarray(rgba, "RGBA")


def generar_flux(prompt: str, salida: Path, args) -> None:
    """FLUX devuelve 1024x1024: se recorta al formato pedido (vertical u horizontal) sin bajar la resolución."""
    import base64, io, json, urllib.request
    url = (f"https://api.cloudflare.com/client/v4/accounts/{os.environ['CLOUDFLARE_ACCOUNT_ID']}"
           "/ai/run/@cf/black-forest-labs/flux-1-schnell")
    proporcion = args.ancho / args.alto
    # Cuota gratis ≈ 80 imágenes/día: 2 variantes solo si hay personas o animales (donde FLUX falla);
    # objetos, paisajes y edificios salen bien a la primera → 1 sola, copiada como variante 2 para la hoja.
    import re, shutil
    vivos = re.search(r"\b(man|men|woman|women|people|person|crowd|child|children|boy|girl|face|faces|doctor|player|players|"
                      r"soldier|soldiers|worker|family|friends|commentators|fans|figure|rider|donkey|horse|baker|businessmen|"
                      r"grandmother|scholar|portrait|hands?)\b", prompt, re.I)
    n = args.variantes if vivos else 1
    for i in range(n):
        t0 = time.time()
        cuerpo = json.dumps({"prompt": prompt, "steps": 4, "seed": args.semilla * 1000 + i + 1}).encode()
        pedido = urllib.request.Request(url, data=cuerpo, headers={
            "Authorization": f"Bearer {os.environ['CLOUDFLARE_API_TOKEN']}", "Content-Type": "application/json"})
        with urllib.request.urlopen(pedido, timeout=120) as r:
            datos = json.load(r)
        img = Image.open(io.BytesIO(base64.b64decode(datos["result"]["image"]))).convert("RGB")
        w, h = img.size
        if proporcion < 1:
            nw = round(h * proporcion); img = img.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        elif proporcion > 1:
            nh = round(w / proporcion); img = img.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
        if args.estilo == "ficha":  # fondo magenta → transparente (recorte limpio del personaje)
            a = np.array(img.convert("RGBA"))
            magenta = (a[..., 0] > 170) & (a[..., 2] > 170) & (a[..., 1] < 110)
            a[magenta, 3] = 0
            img = Image.fromarray(a)
        elif args.sin_fondo:
            img = quitar_fondo(img)
        destino = salida if args.variantes == 1 else salida.with_name(f"{salida.stem}-{i + 1}{salida.suffix}")
        destino.parent.mkdir(parents=True, exist_ok=True)
        img.save(destino)
        print(f"{destino} ({time.time() - t0:.0f} s, FLUX)", flush=True)
    if n < args.variantes:
        primera = salida.with_name(f"{salida.stem}-1{salida.suffix}")
        for i in range(n, args.variantes):
            shutil.copy(primera, salida.with_name(f"{salida.stem}-{i + 1}{salida.suffix}"))


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

    prompt = ESTILOS[args.estilo].format(p=args.prompt)
    salida = Path(args.salida)
    # FLUX.1 [schnell] (Apache 2.0) en Cloudflare Workers AI: mucho mejor en manos, caras y cuerpos.
    # Se usa solo si están CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_API_TOKEN; KHIPU_MOTOR=sd fuerza SD-Turbo.
    if os.environ.get("CLOUDFLARE_API_TOKEN") and os.environ.get("KHIPU_MOTOR") != "sd":
        return generar_flux(prompt, salida, args)
    torch.set_num_threads(torch.get_num_threads())
    pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sd-turbo", torch_dtype=torch.float32)
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
