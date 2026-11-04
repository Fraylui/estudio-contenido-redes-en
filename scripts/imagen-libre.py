"""Busca y descarga imágenes reales con licencia libre para usarlas en los videos (con su crédito anotado).

Fuentes y licencias que se aceptan (todas permiten uso comercial):
  - Wikimedia Commons: solo dominio público, CC0 y CC BY (CC BY-SA no: obligaría a compartir el video con la misma licencia).
  - NASA: dominio público (salvo logos e imágenes con personas identificables en publicidad).
Uso:
  python3 scripts/imagen-libre.py buscar "Cuarto del Rescate Cajamarca" [--fuente commons|nasa] [--n 8]
  python3 scripts/imagen-libre.py bajar <url-de-la-imagen> <nombre>     → public/assets/ia/<nombre>.jpg + crédito
Cada descarga se anota en public/assets/ia/CREDITOS-LIBRES.md (autor, licencia y enlace): el crédito va en la descripción.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

UA = "KhipuEstudio/1.0 (canal educativo; contacto por GitHub Fraylui)"
CARPETA = Path("public/assets/ia")
CREDITOS = CARPETA / "CREDITOS-LIBRES.md"
ACEPTADAS = re.compile(r"^(public domain|pd|cc0|cc by \d|cc by$|cc-by-\d)", re.I)


def pedir(url, intentos=4):
    for k in range(intentos):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30) as r:
                return r.read()
        except Exception as e:  # Commons limita las consultas seguidas: se espera y se reintenta
            if k == intentos - 1:
                raise
            time.sleep(5 * (k + 1))


def commons(q, n):
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "generator": "search", "gsrsearch": f"filetype:bitmap {q}",
        "gsrnamespace": 6, "gsrlimit": n * 3, "prop": "imageinfo", "iiprop": "url|extmetadata|size", "iiurlwidth": 1920})
    datos = json.loads(pedir(url))
    for p in (datos.get("query", {}).get("pages", {}) or {}).values():
        info = p["imageinfo"][0]; meta = info.get("extmetadata", {})
        lic = meta.get("LicenseShortName", {}).get("value", "")
        if not ACEPTADAS.match(lic.strip()) or "SA" in lic.upper():
            continue
        autor = re.sub("<[^>]+>", "", meta.get("Artist", {}).get("value", "desconocido")).strip()
        yield {"titulo": p["title"], "url": info.get("thumburl") or info["url"], "pagina": info["descriptionurl"],
               "licencia": lic, "autor": autor, "tam": f'{info["width"]}x{info["height"]}'}


def nasa(q, n):
    datos = json.loads(pedir("https://images-api.nasa.gov/search?" + urllib.parse.urlencode({"q": q, "media_type": "image"})))
    for it in datos["collection"]["items"][: n]:
        d = it["data"][0]
        yield {"titulo": d.get("title", ""), "url": re.sub(r"~\w+\.jpg$", "~orig.jpg", it["links"][0]["href"]),
               "pagina": f'https://images.nasa.gov/details/{d["nasa_id"]}', "licencia": "Dominio público (NASA)",
               "autor": d.get("center", "NASA"), "tam": "?"}


if __name__ == "__main__":
    accion = sys.argv[1]
    if accion == "buscar":
        q = sys.argv[2]; fuente = "commons"; n = 8
        if "--fuente" in sys.argv: fuente = sys.argv[sys.argv.index("--fuente") + 1]
        if "--n" in sys.argv: n = int(sys.argv[sys.argv.index("--n") + 1])
        for r in list(commons(q, n) if fuente == "commons" else nasa(q, n))[:n]:
            print(f'{r["tam"]:>10}  {r["licencia"]:<24} {r["autor"][:30]:<30} {r["url"]}\n{"":>12}{r["titulo"]} | {r["pagina"]}')
    elif accion == "bajar":
        url, nombre = sys.argv[2], sys.argv[3]
        destino = CARPETA / f"{nombre}.jpg"
        destino.write_bytes(pedir(url))
        with CREDITOS.open("a") as f:
            f.write(f"- `{nombre}.jpg`: {url} — anotar autor y licencia de su página (ver la búsqueda)\n")
        print("listo", destino)
