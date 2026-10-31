"""Investiga un tema en YouTube antes de escribir el guion: los videos más vistos que salen al buscarlo,
con su canal, vistas y duración, para ver qué títulos, ganchos y duraciones ya funcionan.

  python3 scripts/investigar-youtube.py "cómo despertar temprano"
  python3 scripts/investigar-youtube.py "método kakeibo" --n 15
"""
import argparse
import json
import re
import urllib.parse
import urllib.request


def recorrer(o, clave):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == clave:
                yield v
            yield from recorrer(v, clave)
    elif isinstance(o, list):
        for x in o:
            yield from recorrer(x, clave)


def a_numero(vistas):
    m = re.match(r"([\d.,]+)\s*(mil|k|M|mill)?", vistas.replace("\xa0", " "))
    if not m:
        return 0
    if not m.group(2):
        return float(re.sub(r"[.,]", "", m.group(1)) or 0)  # "5.647.493" sin multiplicador
    return float(m.group(1).replace(",", ".")) * {"mil": 1e3, "k": 1e3, "M": 1e6, "mill": 1e6}[m.group(2)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("busqueda")
    ap.add_argument("--n", type=int, default=20)
    args = ap.parse_args()
    # sp=CAM%3D ordena por cantidad de vistas
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(args.busqueda)}&sp=CAM%3D"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "es-419,es;q=0.9"})
    html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
    datos = json.loads(re.search(r"var ytInitialData = (\{.*?\});</script>", html).group(1))
    filas = []
    for v in recorrer(datos, "videoRenderer"):
        titulo = "".join(r.get("text", "") for r in v.get("title", {}).get("runs", []))
        canal = "".join(r.get("text", "") for r in v.get("ownerText", {}).get("runs", []))
        vistas = v.get("viewCountText", {}).get("simpleText", "")
        filas.append((a_numero(vistas), vistas, v.get("lengthText", {}).get("simpleText", ""),
                      v.get("publishedTimeText", {}).get("simpleText", ""), canal, titulo))
    for _, vistas, dur, fecha, canal, titulo in sorted(filas, reverse=True)[: args.n]:
        print(f"{vistas:>22} | {dur:>8} | {fecha:>12} | {canal[:22]:22} | {titulo}")


if __name__ == "__main__":
    main()
