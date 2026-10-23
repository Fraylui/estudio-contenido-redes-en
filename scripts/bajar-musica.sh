#!/usr/bin/env bash
# Baja la biblioteca de música de fondo gratis y monetizable a public/musica/
# Kevin MacLeod (incompetech.com), licencia CC BY 4.0: en la descripción del video va el crédito de public/musica/CREDITOS.md
set -euo pipefail
cd "$(dirname "$0")/../public/musica"
while IFS='|' read -r archivo titulo; do
  [ -f "$archivo" ] && continue
  curl -sfL -o "$archivo" "https://incompetech.com/music/royalty-free/mp3-royaltyfree/${titulo// /%20}.mp3" && echo "✓ $archivo"
done <<'LISTA'
carefree.mp3|Carefree
wallpaper.mp3|Wallpaper
easy-lemon.mp3|Easy Lemon
life-of-riley.mp3|Life of Riley
investigations.mp3|Investigations
sneaky-snitch.mp3|Sneaky Snitch
fluffing-a-duck.mp3|Fluffing a Duck
local-forecast.mp3|Local Forecast - Elevator
LISTA
