#!/usr/bin/env bash
# Hace un Short (o un video largo) de "tomas épicas" de corrido, paso por paso y sin repetir lo ya hecho:
#   tomas → hoja para elegir → instalar (nitidez + profundidad) → voz → render → control de calidad → subir
#
# Uso:  bash scripts/short-epico.sh <nombre> [paso]      (sin paso: hace todos los que falten)
#   <nombre> = contenido/<nombre>.json + imagen/tomas/<nombre>.json   ("largo-…" se hace en horizontal)
#   pasos: tomas | hoja | instalar | voz | video | qc | subir
#
# Se detiene en "hoja" hasta que exista imagen/tomas/<nombre>.elegidas (una línea por toma: "<toma> <1|2>").
# Con KHIPU_AUTO=1 elige la variante 1 de todas (solo para pruebas: siempre hay que mirar la hoja).
# Cada paso pesado toma un candado: nunca corren dos generadores de imágenes ni dos voces a la vez
# (el 28 oct, con todo en paralelo, la carga llegó a 13 en 4 núcleos y nada avanzaba).
set -euo pipefail
cd "$(dirname "$0")/.."
N="${1:?falta el nombre}"; SOLO="${2:-}"
TOMAS="imagen/tomas/$N.json"; ELEGIDAS="imagen/tomas/$N.elegidas"
VAR="${KHIPU_TOMAS:-/tmp/claude-0/tomas}"; REV="out/revision"; mkdir -p "$VAR" "$REV"
PUB="${KHIPU_PUBLICACIONES:-/tmp/claude-0/publicaciones}"
if [[ "$N" == largo-* ]]; then ANCHO=768; ALTO=448; FINAL=1920; LOTE="--horizontal"; SUF="Horizontal"
else ANCHO=448; ALTO=768; FINAL=1080; LOTE=""; SUF="Vertical"; fi
log() { echo "[$N] $*"; }
toca() { [[ -z "$SOLO" || "$SOLO" == "$1" ]]; }
LISTA=$(python3 -c "import json,sys;[print(k) for k in json.load(open(sys.argv[1])) if not k.startswith('_')]" "$TOMAS")
tomas() { echo "$LISTA"; }
# Las escenas que reutilizan una toma de otro video no están en tomas.json: se revisa que exista
for t in $(python3 -c "import json,sys;[print(e['fondo'].split(':')[1]) for e in json.load(open(sys.argv[1]))['props']['escenas'] if e.get('fondo','').startswith('ia:')]" "contenido/$N.json" | sort -u); do
  grep -qx "$t" <<< "$LISTA" || [ -f "public/assets/ia/$t.jpg" ] || { log "falta la toma $t (ni en $TOMAS ni en public/assets/ia)"; exit 1; }
done

if toca tomas; then
  log "1/7 tomas"
  for t in $(tomas); do
    [ -f "public/assets/ia/$t.jpg" ] || [ -f "$VAR/$t-2.png" ] && continue
    p=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))[sys.argv[2]])" "$TOMAS" "$t")
    flock /tmp/khipu-imagenes.lock nice -n 5 imagen/.venv/bin/python imagen/generar.py "$p" "$VAR/$t.png" \
      --estilo epico --ancho $ANCHO --alto $ALTO --pasos 4 --variantes 2 2>&1 | grep -v -i "warn\|resource" | tail -1
  done
fi

if toca hoja; then
  log "2/7 hoja para elegir → $REV/$N-tomas.jpg"
  faltan=$(for t in $(tomas); do [ -f "public/assets/ia/$t.jpg" ] || echo "$t"; done)
  for t in $faltan; do [ -f "$VAR/$t-2.png" ] || { log "todavía faltan imágenes de $t: corre el paso tomas"; exit 2; }; done
  if [ -n "$faltan" ]; then
    entradas=(); filtro=""; i=0
    for t in $faltan; do for v in 1 2; do entradas+=(-i "$VAR/$t-$v.png"); filtro+="[$i]scale=-2:300,drawtext=text='$t $v':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6[v$i];"; i=$((i+1)); done; done
    pila=""; for k in $(seq 0 $((i-1))); do pila+="[v$k]"; done
    # Cuadrícula que siempre cierra: 6, 4 o 2 columnas (cada toma tiene 2 variantes, así que i es par)
    col=2; (( i % 6 == 0 )) && col=6; (( i % 6 != 0 && i % 4 == 0 )) && col=4
    ffmpeg -v error -y "${entradas[@]}" -filter_complex "${filtro}${pila}xstack=inputs=$i:grid=${col}x$(( i / col ))" "$REV/$N-tomas.jpg"
    if [ ! -f "$ELEGIDAS" ]; then
      if [ "${KHIPU_AUTO:-0}" = 1 ]; then for t in $faltan; do echo "$t 1"; done > "$ELEGIDAS"
      else log "ALTO: mira $REV/$N-tomas.jpg y escribe $ELEGIDAS (\"<toma> <1|2>\" por línea; para rehacer una toma, bórrala de $VAR)"; exit 3; fi
    fi
  fi
fi

if toca instalar; then
  log "3/7 instalar (Real-ESRGAN a $FINAL px + profundidad)"
  for t in $(tomas); do
    [ -f "public/assets/ia/$t.jpg" ] && continue
    v=$(awk -v t="$t" '$1==t{print $2}' "$ELEGIDAS" 2>/dev/null); v="${v:-1}"
    flock /tmp/khipu-imagenes.lock imagen/.venv/bin/python imagen/nitidez.py "$VAR/$t-$v.png" "public/assets/ia/$t.jpg" $FINAL 2>&1 | grep listo
  done
  sinprof=$(for t in $(tomas); do [ -f "public/assets/ia/$t-prof.png" ] || echo "$t"; done)
  [ -n "$sinprof" ] && flock /tmp/khipu-imagenes.lock imagen/.venv/bin/python imagen/profundidad.py $sinprof 2>&1 | grep -c listo
  node scripts/listar-objetos-ia.mjs >/dev/null
fi

if toca voz; then
  if [ -f "public/voz/$N.json" ] && [ "public/voz/$N.json" -nt "contenido/$N.json" ]; then log "4/7 voz (ya estaba)"
  else log "4/7 voz"; flock /tmp/khipu-voz.lock voz/.venv/bin/python voz/narrar.py "contenido/$N.json" "public/voz/$N.wav" > "$REV/$N-voz.log" 2>&1; fi
fi

if toca video; then
  log "5/7 video"
  flock /tmp/khipu-imagenes.lock npm run lote -- "$N" $LOTE > "$REV/$N-render.log" 2>&1
  ffmpeg -v error -y -i "out/$N-$SUF.mp4" -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k "out/$N-final.mp4"
  tam=$(stat -c %s "out/$N-final.mp4"); [ "$tam" -lt 100000000 ] || { log "pesa más de 100 MB: re-codificar con crf 24"; exit 1; }
fi

if toca qc; then
  log "6/7 control de calidad → $REV/$N-final-informe.md y $REV/$N-final-hoja.jpg"
  voz/.venv/bin/python scripts/analizar-video.py "out/$N-final.mp4" "$REV" 2>/dev/null | sed -n 5,12p
fi

if toca subir; then
  log "7/7 subir a la rama publicaciones"
  cp "out/$N-final.mp4" "$PUB/khipu-$N.mp4"
  git -C "$PUB" add "khipu-$N.mp4" && git -C "$PUB" commit -qm "Video: $N" && git -C "$PUB" push -q origin publicaciones
  log "listo: https://raw.githubusercontent.com/Fraylui/estudio-contenido-redes-en/publicaciones/khipu-$N.mp4"
fi
