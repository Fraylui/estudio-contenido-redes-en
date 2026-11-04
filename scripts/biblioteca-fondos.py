"""Biblioteca de fondos ya creados: antes de pedir imágenes nuevas a FLUX, buscar si ya tenemos una que sirva.

Uso:
  python3 scripts/biblioteca-fondos.py                 → reescribe docs/biblioteca-fondos.md (todos los fondos con su descripción)
  python3 scripts/biblioteca-fondos.py desierto noche  → busca fondos cuya descripción tenga esas palabras (inglés o nombre)

Para reusar uno, en contenido/<video>.json basta con "fondo": "ia:<nombre>" (short-epico.sh acepta tomas de otros
videos si existen en public/assets/ia/). Regla: reusar lugares genéricos (cielo, mar, desierto, biblioteca), nunca la
misma secuencia de escenas de otro video (eso parecería contenido repetido).
"""
import json
import sys
from pathlib import Path

ia = Path("public/assets/ia")
fondos = {}
for t in sorted(Path("imagen/tomas").glob("*.json")):
    d = json.loads(t.read_text())
    estilo = d.get("_estilo", "epico")
    for k, v in d.items():
        if not k.startswith("_") and (ia / f"{k}.jpg").exists():
            fondos[k] = (estilo, t.stem, v)

palabras = [p.lower() for p in sys.argv[1:]]
if palabras:
    for k, (estilo, video, v) in fondos.items():
        texto = f"{k} {v}".lower()
        if all(p in texto for p in palabras):
            print(f"ia:{k}  [{estilo}, de {video}]  {v[:110]}")
else:
    filas = ["# Biblioteca de fondos (se regenera con `python3 scripts/biblioteca-fondos.py`)", "",
             "Desde el 30 oct solo se usan los de estilo **fondo2d** (todo 2D). Buscar: `python3 scripts/biblioteca-fondos.py <palabras>`.", "",
             "| Fondo | Estilo | Video | Descripción |", "|---|---|---|---|"]
    for k, (estilo, video, v) in sorted(fondos.items(), key=lambda x: (x[1][0] != "fondo2d", x[0])):
        filas.append(f"| `ia:{k}` | {estilo} | {video} | {v[:120]} |")
    Path("docs/biblioteca-fondos.md").write_text("\n".join(filas) + "\n")
    print(f"{len(fondos)} fondos ({sum(1 for f in fondos.values() if f[0] == 'fondo2d')} en 2D) → docs/biblioteca-fondos.md")
