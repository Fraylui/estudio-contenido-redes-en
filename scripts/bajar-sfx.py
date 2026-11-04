"""Baja una biblioteca de efectos de sonido gratis de Mixkit (Mixkit Sound Effects Free License: uso comercial,
también en YouTube, sin atribución; no se pueden redistribuir sueltos, por eso los MP3 no se suben al repositorio).

Uso: python3 scripts/bajar-sfx.py            (unos 250 efectos en public/sfx/biblioteca/<categoria>/)

Cada efecto queda nivelado (pico a −3 dBFS) y con su momento de impacto medido, y el catálogo
public/sfx/biblioteca/catalogo.json (que sí se sube) lo usa Pizarra.tsx: "sonido": "hooks/cinematic-whoosh-deep-impact".
"""
import html
import json
import re
import subprocess
import urllib.request
from pathlib import Path

CATEGORIAS = {
    "hooks": ["impact", "cinematic", "boom", "swell", "hit", "bass", "intro"],
    "transiciones": ["whoosh", "swoosh", "transition", "sweep", "swish", "zoom"],
    "historia": ["battle", "war", "medieval-battle", "sword", "horse", "crowd", "church-bell"],
    "naturaleza": ["ambience", "nature", "wind", "rain", "forest", "ocean", "city", "bird", "thunder", "fire"],
    "animacion": ["cartoon", "pop", "click", "cute", "funny", "jump", "sparkle", "magic"],
    "tension": ["suspense-music", "heartbeat", "clock", "drone", "horror", "gasp"],
    "tecnologia": ["high-tech", "technology", "interface", "glitch", "typewriter"],
    "dinero": ["money", "coin", "casino"],
    "reacciones": ["laugh", "applause", "wow", "crowd", "cheer"],
}
POR_ETIQUETA = 6
RAIZ = Path(__file__).resolve().parent.parent / "public/sfx/biblioteca"
UA = {"User-Agent": "Mozilla/5.0"}


def items(etiqueta):
    req = urllib.request.Request(f"https://mixkit.co/free-sound-effects/{etiqueta}/", headers=UA)
    t = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
    for m in re.finditer(r'preview-url-value="(https://assets\.mixkit\.co/active_storage/sfx/(\d+)/\d+-preview\.mp3)".*?item-grid-card__title">\s*([^<]+?)\s*</h2>', t, re.S):
        yield m.group(1), m.group(2), html.unescape(m.group(3))


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:48]


def impacto(archivo):
    """Segundo donde está el golpe más fuerte (para sincronizarlo con la imagen)."""
    import numpy as np
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(archivo), "-ac", "1", "-ar", "8000", "-f", "s16le", "-"],
                         capture_output=True).stdout
    a = np.abs(np.frombuffer(pcm, np.int16).astype(np.float32))
    if not len(a):
        return 0.0, 0.0
    v = np.convolve(a, np.ones(200) / 200, mode="same")
    return round(float(v.argmax()) / 8000, 3), round(len(a) / 8000, 2)


catalogo = {}
vistos = set()
for categoria, etiquetas in CATEGORIAS.items():
    (RAIZ / categoria).mkdir(parents=True, exist_ok=True)
    for etiqueta in etiquetas:
        n = 0
        for url, ident, titulo in items(etiqueta):
            if ident in vistos or n >= POR_ETIQUETA:
                continue
            vistos.add(ident)
            nombre = slug(titulo)
            destino = RAIZ / categoria / f"{nombre}.mp3"
            if not destino.exists():
                crudo = destino.with_suffix(".tmp.mp3")
                urllib.request.urlretrieve(url, crudo)
                # Todos al mismo pico, para que la ganancia sugerida valga igual para cualquiera
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(crudo), "-af", "loudnorm=I=-16:TP=-3", "-ar", "48000",
                                "-b:a", "192k", str(destino)], check=True)
                crudo.unlink()
            golpe, dur = impacto(destino)
            catalogo[f"{categoria}/{nombre}"] = {
                "archivo": f"biblioteca/{categoria}/{nombre}.mp3", "nombre": titulo, "etiqueta": etiqueta,
                "duracion_s": dur, "impacto_s": golpe, "ganancia_db_sugerida": -8, "fuente": f"https://mixkit.co/free-sound-effects/{etiqueta}/",
            }
            n += 1
        print(f"{categoria}/{etiqueta}: {n}", flush=True)

json.dump(catalogo, open(RAIZ / "catalogo.json", "w"), ensure_ascii=False, indent=1)
print(f"{len(catalogo)} efectos")
