"""Videos más vistos de canales grandes: título, miniatura y los primeros 30 s de lo que dicen (gancho verbal).

Uso: imagen/.venv/bin/python scripts/analizar-canales.py <carpeta>   (ver docs/patrones-creadores.md)
import json
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

SAL = Path(sys.argv[1])
SAL.mkdir(parents=True, exist_ok=True)
CANALES = ["MrBeast", "CasiCreativo", "Aprendiz Financiero", "Infonimados", "Academia Play", "Curiosamente",
           "Kurzgesagt – In a Nutshell", "Veritasium en español"]
# yt-dlp para los subtítulos (está en imagen/.venv); se puede pasar otra ruta como segundo argumento
YTDLP = sys.argv[2] if len(sys.argv) > 2 else "imagen/.venv/bin/yt-dlp"


def recorrer(o, clave):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == clave:
                yield v
            else:
                yield from recorrer(v, clave)
    elif isinstance(o, list):
        for v in o:
            yield from recorrer(v, clave)


def buscar(q):
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(q)}&sp=CAM%3D"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "es-419,es;q=0.9"})
    html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
    datos = json.loads(re.search(r"var ytInitialData = (\{.*?\});</script>", html).group(1))
    for v in recorrer(datos, "videoRenderer"):
        yield {
            "id": v["videoId"],
            "titulo": "".join(r.get("text", "") for r in v.get("title", {}).get("runs", [])),
            "canal": "".join(r.get("text", "") for r in v.get("ownerText", {}).get("runs", [])),
            "vistas": v.get("viewCountText", {}).get("simpleText", ""),
            "duracion": v.get("lengthText", {}).get("simpleText", ""),
        }


def gancho(vid):
    """Primeros ~30 s de subtítulos (automáticos si no hay manuales)."""
    base = SAL / vid
    subprocess.run([YTDLP, "-q", "--skip-download", "--write-subs", "--write-auto-subs", "--sub-langs", "es.*,en.*",
                    "--sub-format", "json3", "-o", str(base), f"https://www.youtube.com/watch?v={vid}"],
                   capture_output=True, timeout=120)
    for f in sorted(SAL.glob(f"{vid}*.json3")):
        ev = json.load(open(f)).get("events", [])
        txt = " ".join("".join(s.get("utf8", "") for s in e.get("segs", [])) for e in ev if e.get("tStartMs", 0) < 30000)
        return re.sub(r"\s+", " ", txt).strip()
    return ""


resultado = []
for canal in CANALES:
    vids = [v for v in buscar(canal) if canal.split()[0].lower() in v["canal"].lower()][:4]
    for v in vids:
        urllib.request.urlretrieve(f"https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg", SAL / f"{v['id']}.jpg")
        v["gancho"] = gancho(v["id"])
        resultado.append(v)
        print(f"[{v['canal']}] {v['vistas']} | {v['duracion']} | {v['titulo']}\n   GANCHO: {v['gancho'][:400]}\n", flush=True)
json.dump(resultado, open(SAL / "resultado.json", "w"), ensure_ascii=False, indent=1)
