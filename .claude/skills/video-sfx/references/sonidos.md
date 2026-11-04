# Manual de efectos de sonido

Los archivos están en `assets/sfx/`, normalizados a pico -3 dBFS, 48 kHz estéreo. `sfx.json` guarda duración, punto de impacto y ganancia sugerida; el script los usa solo.

Recuerda: no puedes escuchar estos sonidos. Confía en las descripciones.

| id | Nombre | Cuándo usarlo | Duración |
|---|---|---|---|
| `flash_shock` | Camera Flash Sound | Flash fuerte tipo shock. Inicio del video; muy usado en contenido vertical. | 1.8 s |
| `flash_shock_fuerte` | 21 - Camera Flash | Igual, pero el shock es más fuerte y con eco. Arranques de más impacto. Máximo uno por video. | 1.8 s |
| `whoosh` | Whoosh | Transiciones, zoom in / zoom out. | 0.8 s |
| `whoosh_2` | Whoosh 3 | Variante de whoosh. Alterna para no repetir. | 0.8 s |
| `whoosh_3` | Whoosh 6 | Variante de whoosh. Alterna para no repetir. | 0.7 s |
| `click` | Camera Click | Click de mouse. Al mostrar cosas en pantalla, sobre todo en demos de una app o web. | 0.8 s |
| `shutter` | 16 - Camera Shutter | Disparo corto de cámara. Cuando entran elementos o imágenes en pantalla; también transiciones. | 0.9 s |
| `shutter_2` | 17 - Camera Shutter 2 | Variante de shutter. | 1.0 s |
| `boom` | boom | Mostrar algo impactante: un dato fuerte, una cifra, un resultado. | 3.4 s (cola larga) |
| `rewind` | Fast Forward | Retroceso de video / cámara hacia atrás. Lo usa `rebobinar`. | 4.1 s (se recorta) |
| `caja_registradora` | Cash Register | Cuando se habla de dinero: sueldos, precios, ahorro. | 1.6 s |
| `pop` | Bubble Pop | Mostrar cosas en pantalla (textos, íconos, stickers, bullets). | 1.1 s |
| `ding` | Ding | Mostrar cosas en pantalla; ideal para aciertos, checks, una coincidencia. | 1.7 s |
| `magic_reveal` | Magic Reveal | Revelar cosas: un resultado, un puntaje, un antes/después. Tiene subida antes del brillo. | 3.1 s |

## Reglas de mezcla

- La voz manda. Las ganancias sugeridas (−5 a −8 dB) están pensadas para que el efecto se note sin tapar a quien habla. Si el video no tiene voz, puedes subir 2-3 dB.
- `t` en los cues = momento del golpe visual. El script alinea el impacto del sonido a ese instante.
- `magic_reveal` tiene ~0.9 s de subida antes del brillo: el script arranca el archivo antes para que el brillo caiga en `t`. Asegúrate de que haya ~1 s libre antes.
- `boom` tiene cola grave larga: evita otro efecto fuerte en los 1.5 s siguientes.
- Densidad orientativa en un reel de 30 s: 6-12 efectos. Más que eso cansa.
- No repitas el mismo efecto tres veces seguidas; alterna variantes o cambia de familia (`pop` ↔ `ding` ↔ `shutter` para apariciones).
- El limitador final evita saturación; aun así, no apiles más de dos efectos en el mismo instante.

## Mapa rápido: situación → sonido

- Primer segundo de un reel → `flash_shock`
- Cambio de escena / salto de corte → `whoosh` (alternando variantes)
- Zoom in o zoom out → `whoosh`
- Aparece un texto o bullet → `pop` o `ding`
- Aparece una captura o imagen → `shutter`
- Clic en una app o web (demo) → `click`
- Cifra o dato fuerte → `boom`
- Sueldos, precios, ahorro → `caja_registradora`
- Resultado, puntaje, antes/después → `magic_reveal`
- Rebobinar para repetir una parte → `rewind`

## Recetas de audio complementarias

### Normalizar la voz (redes sociales ≈ -14 LUFS)
Hazlo antes de mezclar efectos.
```bash
ffmpeg -y -i in.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k out.mp4
```

### Música de fondo con ducking (baja cuando hay voz)
Solo si el usuario aporta la música (la skill no trae música). Ponla antes de los efectos, para que no se compriman.
```bash
ffmpeg -y -i video.mp4 -i musica.mp3 -filter_complex \
"[1:a]volume=-14dB,aloop=loop=-1:size=2e9,atrim=duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 video.mp4)[m];\
 [m][0:a]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];\
 [0:a][md]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]" \
-map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k out.mp4
```

### Detectar silencios (para ubicar cortes o huecos donde cabe un efecto)
```bash
ffmpeg -i in.mp4 -af silencedetect=noise=-35dB:d=0.5 -f null - 2>&1 | grep silence_
```

### Disimular un corte
Si se quitó un tramo del medio, un `whoosh` justo en el segundo del corte (con `sonidos`) suaviza el salto.
