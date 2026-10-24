#!/usr/bin/env bash
# Genera los escenarios de imagen/escenarios.json que todavía no existen en public/assets/ia/ (2 variantes; se elige a mano la mejor)
# Uso: bash imagen/generar-escenarios.sh [carpeta-de-variantes]
set -euo pipefail
cd "$(dirname "$0")/.."
SAL="${1:-/tmp/escenarios}"; mkdir -p "$SAL"
ESTILO=$(python3 -c "import json;print(json.load(open('imagen/escenarios.json'))['_estilo'])")
python3 -c "import json;[print(k) for k in json.load(open('imagen/escenarios.json')) if not k.startswith('_')]" | while read -r nombre; do
  [ -f "public/assets/ia/$nombre.jpg" ] && continue
  [ -f "$SAL/$nombre-2.png" ] && continue  # ya generado en una corrida anterior
  prompt=$(python3 -c "import json,sys;print(json.load(open('imagen/escenarios.json'))[sys.argv[1]])" "$nombre")
  nice -n 15 imagen/.venv/bin/python imagen/generar.py "$prompt, $ESTILO" "$SAL/$nombre.png" --estilo ninguno --ancho 768 --alto 448 --pasos 4 --variantes 2 2>&1 | grep -v -i "warn\|resource" | tail -1
done
