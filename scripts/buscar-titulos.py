"""Qué busca la gente en YouTube: las sugerencias del buscador (autocompletado) para elegir títulos que aparezcan en búsquedas.

Uso: python3 scripts/buscar-titulos.py "soldado romano" "dia de muertos"
Para cada frase prueba también con "por qué", "cómo", "qué pasaría si" y "la verdad sobre" delante, y lista lo que
YouTube sugiere (lo más buscado sale primero). El título final usa esas palabras, pero con nuestro gancho.
"""
import json
import sys
import urllib.parse
import urllib.request

PREFIJOS = ["", "por que ", "como ", "que pasaria si ", "la verdad sobre ", "historia de "]


def sugerencias(q: str) -> list[str]:
    url = "https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=es&q=" + urllib.parse.quote(q)
    with urllib.request.urlopen(url, timeout=20) as r:
        return json.loads(r.read().decode("utf-8", "replace"))[1]


for frase in sys.argv[1:]:
    print(f"\n## {frase}")
    vistas = set()
    for pre in PREFIJOS:
        for s in sugerencias(pre + frase):
            if s not in vistas:
                vistas.add(s)
                print("-", s)
