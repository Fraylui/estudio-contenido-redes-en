# Voces de referencia

Aquí va la grabación de la persona cuya voz usará la narradora (por ejemplo `xiomi.wav`).
**Estos audios no se suben a GitHub** (están en `.gitignore`): el repositorio es público y,
con una grabación, cualquiera podría clonar esa voz.

Cómo debe ser la grabación:
- 15 a 30 segundos de la persona **leyendo una noticia** con el tono que quieres en los videos.
- Lugar silencioso y sin eco, celular a un palmo de la boca, sin música.
- Solo de alguien que te dio permiso para usar su voz. Guarda ese permiso.

Para limpiarla y dejarla lista:

```bash
ffmpeg -i nota-de-voz.m4a -af "highpass=f=80,afftdn=nr=8:nf=-45,loudnorm=I=-18:TP=-2" -ac 1 -ar 24000 voz/referencias/xiomi.wav
```
