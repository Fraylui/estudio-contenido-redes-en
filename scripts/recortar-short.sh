#!/usr/bin/env bash
# Short recortado de un video largo, con marco de marca (lección de CasiCreativo, 28 oct):
# fondo = el mismo video desenfocado y oscuro, el video al centro, gancho arriba, marca y "video completo" abajo.
# Uso: bash scripts/recortar-short.sh <video-largo.mp4> <inicio_s> <fin_s> <salida.mp4> "<GANCHO EN MAYÚSCULAS>"
set -euo pipefail
ENT="$1"; A="$2"; B="$3"; SAL="$4"; G="$5"
F=/usr/share/fonts/opentype/inter/Inter-Bold.otf
D=$(python3 -c "print(round($B-$A,2))")
G1=$(python3 -c "import sys,textwrap;l=textwrap.wrap(sys.argv[1],18);print(l[0])" "$G")
G2=$(python3 -c "import sys,textwrap;l=textwrap.wrap(sys.argv[1],18);print(l[1] if len(l)>1 else '')" "$G")
ffmpeg -v error -y -ss "$A" -t "$D" -i "$ENT" -filter_complex "\
[0:v]split[a][b];\
[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=28:4,eq=brightness=-0.28:saturation=0.8[fondo];\
[b]scale=1080:-2,setsar=1[centro];\
[fondo][centro]overlay=0:(H-h)/2,\
drawtext=fontfile=$F:text='KHIPU':fontsize=46:fontcolor=white@0.85:borderw=3:bordercolor=black@0.6:x=(w-tw)/2:y=150,\
drawtext=fontfile=$F:text='$G1':fontsize=78:fontcolor=white:borderw=6:bordercolor=black:x=(w-tw)/2:y=330,\
drawtext=fontfile=$F:text='$G2':fontsize=78:fontcolor=0xFFD23F:borderw=6:bordercolor=black:x=(w-tw)/2:y=430,\
drawtext=fontfile=$F:text='Historia completa en el canal':fontsize=44:fontcolor=white:borderw=4:bordercolor=black:x=(w-tw)/2:y=1500,\
fade=t=in:st=0:d=0.2[v]" \
  -map "[v]" -map 0:a -af "afade=t=in:st=0:d=0.3,afade=t=out:st=$(python3 -c "print(max(0,$D-0.6))"):d=0.6" \
  -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k "$SAL"
echo "listo $SAL ($D s)"
