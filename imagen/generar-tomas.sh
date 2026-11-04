#!/usr/bin/env bash
# Genera las tomas épicas verticales de un Short narrado (una imagen completa por momento de la historia).
# Uso: bash imagen/generar-tomas.sh <tomas.json> <carpeta>   (tomas.json: {"nombre": "prompt", ...}; 2 variantes por toma)
set -euo pipefail
cd "$(dirname "$0")/.."
SAL="$2"; mkdir -p "$SAL"
python3 -c "import json,sys;[print(k) for k in json.load(open(sys.argv[1])) if not k.startswith('_')]" "$1" | while read -r n; do
  [ -f "$SAL/$n-2.png" ] && continue
  p=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))[sys.argv[2]])" "$1" "$n")
  nice -n 5 imagen/.venv/bin/python imagen/generar.py "$p" "$SAL/$n.png" --estilo epico --ancho 448 --alto 768 --pasos 4 --variantes 2 2>&1 | grep -v -i "warn\|resource" | tail -1
done
