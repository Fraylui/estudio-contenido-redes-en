---
name: video-sfx
description: Añade efectos de sonido a videos (reels, TikToks, shorts, anuncios, demos) con un set de 14 efectos (flash, whoosh, pop, ding, click, shutter, boom, caja registradora, magic reveal, rewind) sincronizados al golpe visual. Úsala cuando el usuario pida poner sonidos, SFX, efectos, whoosh en transiciones, sonido a un zoom, rebobinar con sonido, o "darle ritmo" a un video, aunque no diga "skill".
---

# Efectos de sonido para video

Esta skill mezcla efectos de sonido sobre un video ya editado usando ffmpeg, a través de un solo script: `scripts/sfx.py`. El resultado es un MP4 nuevo con el audio original más los efectos, sin recodificar la imagen.

Antes de mezclar, lee `references/sonidos.md`: qué efecto usar en cada momento, reglas de mezcla y densidad. **Léelo siempre la primera vez.**

## Límites que debes tener presentes (y decirle al usuario cuando aplique)

- **No escuchas audio.** Eliges efectos por su descripción en `assets/sfx/sfx.json`, no por oído. Si el usuario quiere sincronizar con lo que se dice, necesitas los tiempos (o un `.srt`).
- **No ves el video en movimiento.** Para ubicar en qué segundo aparece algo, genera una hoja con `fotogramas` y mírala. Si el usuario ya te da los segundos, úsalos.

## Flujo de trabajo

1. **Inspecciona:** `python3 scripts/sfx.py info video.mp4` (duración, si tiene audio) y una hoja de `fotogramas` para ubicar cortes, apariciones de texto, zooms y momentos clave.
2. **Propón los cues** (segundo → efecto, con el motivo) si el video dura más de ~20 s o el usuario no dio indicaciones. Si el pedido es claro y corto, ejecuta directo.
3. **Escribe `cues.json`** y mezcla con `sonidos`. Usa `zoom` o `rebobinar` cuando el efecto visual también hace falta (traen su sonido).
4. **Entrega** el MP4 final con una lista corta de los efectos y sus segundos, para que el usuario pueda pedir ajustes precisos ("el pop del 4.2 más bajo", "quita el boom").

Trabaja en una carpeta de trabajo propia; las rutas a los efectos las resuelve el script solo.

## Comandos (`python3 scripts/sfx.py <cmd> -h` para ver todo)

| Comando | Qué hace | Sonido automático |
|---|---|---|
| `info video.mp4` | Resolución, fps, duración, si tiene audio | — |
| `lista-sonidos` | Lista los efectos con su uso | — |
| `sonidos --video --cues cues.json --out` | Mezcla efectos donde quieras | — |
| `zoom --video --ini --fin [--factor 1.25] [--transicion 0 para punch-in] [--foco x,y] [--sonido-salida]` | Zoom in y vuelta | whoosh |
| `rebobinar --video --ini --fin [--velocidad 3]` | Reproduce hasta `fin`, retrocede hasta `ini` y sigue | rewind |
| `fotogramas video.mp4 [--n 8 \| --tiempos 1,2.5,4] --out hoja.png` | Hoja de capturas para revisar | — |

`zoom` acepta `--sonido` con cualquier efecto o `ninguno`.

### Formato de cues para `sonidos`
```json
[
  {"sfx": "flash_shock", "t": 0.0},
  {"sfx": "whoosh", "t": 3.2},
  {"sfx": "caja_registradora", "t": 7.8, "db": -4},
  {"sfx": "rewind", "t": 10.0, "dur": 1.2}
]
```
- `t`: segundo donde debe **sonar el golpe**. El script adelanta el archivo según su punto de impacto (`impacto_s` en `sfx.json`), así el sonido cae exacto sobre el corte o la aparición.
- `db` (opcional): ganancia; por defecto usa la sugerida de cada efecto.
- `dur` (opcional): recorta el efecto con fade de salida.

Un limitador final evita que el audio sature. Si el video no tiene audio, el script crea la pista desde silencio.

## Criterios rápidos (detalle en `references/sonidos.md`)

- **Un sonido = un evento visual.** Nunca pongas un efecto sin algo que aparezca, cambie o se corte en pantalla en ese instante. Deja al menos ~0.4 s entre efectos, salvo secuencias rítmicas deliberadas.
- **Hook:** en contenido vertical, `flash_shock` en el primer golpe visual.
- **Alterna variantes** (`whoosh`, `whoosh_2`, `whoosh_3`; `shutter`, `shutter_2`) para que no suene repetido.
- **Dinero** → `caja_registradora`; **dato impactante** → `boom`; **revelar un resultado** → `magic_reveal`; **demo de una app** → `click` en cada clic.
- Si añades música de fondo, mézclala **antes** de los efectos (receta en `references/sonidos.md`).

## En este repositorio: anuncios de Remotion

Los anuncios (`contenido/anuncio-*.json`) mezclan los efectos al generar el video, sin pasar por `sfx.py`. Los sonidos están copiados en `public/sfx/efectos/` con el mismo `sfx.json`. Dentro de `props`:

```json
"efectos": [
  { "sonido": "flash_shock", "segundo": 0.05 },
  { "sonido": "whoosh", "segundo": 0, "escena": 2 },
  { "sonido": "magic_reveal", "segundo": 0.35, "escena": 8, "db": -4 }
]
```

- `sonido`: un id del catálogo. Se adelanta solo según su `impacto_s`, así que el golpe cae en el segundo pedido; en `magic_reveal`, el brillo cae justo ahí.
- `escena`: cuenta `segundo` desde el inicio de esa escena. Combinado con `"frase"` en las escenas, los efectos siguen a la narración aunque cambien sus tiempos.
- `db`: ganancia; si no se indica, se usa `ganancia_db_sugerida`.
- Para otro archivo de `public/`, usa `"archivo"` y `"volumen"` (de 0 a 1) en lugar de `sonido`.

Para videos que no son de Remotion (un MP4 ya editado), usa `scripts/sfx.py` como se explica arriba.

## Estructura de la skill
```
scripts/sfx.py         herramienta (ffmpeg + Pillow)
assets/sfx/            14 efectos normalizados (-3 dBFS, 48 kHz) + sfx.json (uso, duración, punto de impacto, ganancia)
references/sonidos.md  manual: tabla de efectos, reglas de mezcla, mapa situación → sonido, recetas de audio
```
