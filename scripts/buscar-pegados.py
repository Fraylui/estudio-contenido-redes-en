"""Temas que ya pegaron: en cada canal de referencia, los videos con muchas más vistas que lo normal del canal.

Uso: python3 scripts/buscar-pegados.py [shorts|videos] [veces]   (por defecto: shorts 3)
Lee la página pública de cada canal (sin clave). Un video "pegó" si tiene al menos `veces` × la mediana del canal.
De ahí se toma el TEMA, nunca el guion ni las escenas (ver docs/como-narran-los-grandes.md).
"""
import re
import statistics
import sys
import urllib.request

# Canales en español de nuestras categorías; agregar aquí los que pase el usuario
CANALES = {
    "historia y curiosidades": ["CuriosaMente", "AcademiaPlay", "MolaSaber", "ElRobotdePlaton"],
    "cuerpo y ciencia": ["LaHiperactina", "QuantumFracture", "DateunVlog", "Kurzgesagt_ES"],
    "dinero y mente": ["CasiCreativo", "Infonimados", "AprendizFinanciero"],
}
PESTANA = sys.argv[1] if len(sys.argv) > 1 else "shorts"
VECES = float(sys.argv[2]) if len(sys.argv) > 2 else 3


def numero(texto: str) -> float:
    m = re.match(r"([\d.,]+)[\s\u00a0]*(mil|millones|millón)?", texto)
    n = float(m.group(1).replace(".", "").replace(",", "."))
    return n * {"mil": 1e3, "millones": 1e6, "millón": 1e6}.get(m.group(2), 1)


def videos(canal: str) -> list[tuple[str, float]]:
    pedido = urllib.request.Request(f"https://www.youtube.com/@{canal}/{PESTANA}",
                                    headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "es"})
    html = urllib.request.urlopen(pedido, timeout=30).read().decode()
    patron = (r'"accessibilityText":"([^"]{5,200}), ([\d.,]+[\s\u00a0]*(?:mil|millones|millón)?)[\s\u00a0]*(?:de )?visualizaciones'
              if PESTANA == "shorts" else
              r'"title":\{"runs":\[\{"text":"([^"]{5,200})"\}\][^{]{0,50}.{0,600}?"viewCountText":\{"simpleText":"([\d.,]+) (?:vistas|visualizaciones)')
    vistos = {}
    for titulo, vistas in re.findall(patron, html):
        vistos.setdefault(titulo, numero(vistas))
    return list(vistos.items())


for categoria, canales in CANALES.items():
    print(f"\n## {categoria}")
    for canal in canales:
        try:
            lista = videos(canal)
        except Exception as e:
            print(f"- {canal}: no se pudo leer ({e})")
            continue
        if len(lista) < 5:
            continue
        mediana = statistics.median(v for _, v in lista)
        pegados = [(t, v) for t, v in sorted(lista, key=lambda x: -x[1]) if v >= VECES * mediana]
        print(f"- {canal} ({len(lista)} videos, lo normal: {mediana:,.0f} vistas)")
        for titulo, v in pegados:
            print(f"  - «{titulo}» {v:,.0f} vistas ({v / mediana:.1f}× lo normal)")
