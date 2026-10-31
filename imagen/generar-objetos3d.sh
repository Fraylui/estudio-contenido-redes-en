#!/usr/bin/env bash
# Genera los objetos 3D de imagen/objetos3d.json que faltan (2 variantes recortadas con rembg en <carpeta>; luego se elige la mejor
# y se copia a public/assets/objetos-ia/<nombre>.png). Uso: bash imagen/generar-objetos3d.sh <carpeta> [nombre ...]
set -euo pipefail
cd "$(dirname "$0")/.."
SAL="${1:-/tmp/objetos3d}"; shift || true; mkdir -p "$SAL"
lista=$( [ $# -gt 0 ] && printf '%s\n' "$@" || python3 -c "import json;[print(k) for k in json.load(open('imagen/objetos3d.json')) if not k.startswith('_')]" )
for nombre in $lista; do
  [ -f "public/assets/objetos-ia/$nombre.png" ] && continue
  [ -f "$SAL/$nombre-2.png" ] && continue  # ya generado en una corrida anterior
  prompt=$(python3 -c "import json,sys;print(json.load(open('imagen/objetos3d.json'))[sys.argv[1]])" "$nombre")
  nice -n 15 imagen/.venv/bin/python imagen/generar.py "$prompt" "$SAL/$nombre.png" --estilo objeto3d --sin-fondo --pasos 4 --variantes 2 2>&1 | grep -v -i "warn\|resource\|onnx" | tail -1
done
