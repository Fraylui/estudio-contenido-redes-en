#!/usr/bin/env bash
# Como generar-tomas.sh pero en horizontal (768x448) para los videos largos.
set -euo pipefail
cd "$(dirname "$0")/.."
SAL="$2"; mkdir -p "$SAL"
python3 -c "import json,sys;[print(k) for k in json.load(open(sys.argv[1])) if not k.startswith('_')]" "$1" | while read -r n; do
  [ -f "$SAL/$n-2.png" ] && continue
  p=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))[sys.argv[2]])" "$1" "$n")
  nice -n 5 imagen/.venv/bin/python imagen/generar.py "$p" "$SAL/$n.png" --estilo epico --ancho 768 --alto 448 --pasos 4 --variantes 2 2>&1 | grep -v -i "warn\|resource" | tail -1
done
