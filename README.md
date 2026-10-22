# Estudio de contenido para redes

Fábrica de videos para **Facebook Reels, YouTube Shorts, TikTok y YouTube**, hecha con [Remotion](https://www.remotion.dev).

Escribes el contenido en un archivo JSON y el proyecto genera el video con tu marca. Cada formato sale en dos tamaños:

| Tamaño | Medidas | Dónde publicarlo |
|---|---|---|
| Vertical | 1080×1920 | Reels de Facebook e Instagram, YouTube Shorts, TikTok |
| Horizontal | 1920×1080 | YouTube normal, publicaciones de Facebook |

## Formatos incluidos

| Formato | Para qué sirve | Ejemplo |
|---|---|---|
| `TopLista` | Rankings en cuenta regresiva ("Top 5…") | `contenido/top-5-platos-peruanos.json` |
| `Trivia` | Pregunta con 4 opciones, cuenta regresiva y respuesta. Genera muchos comentarios | `contenido/trivia-capital-australia.json` |
| `Frase` | Frases motivacionales que aparecen palabra por palabra | `contenido/frase-constancia.json` |
| `DatosBarras` | Gráfico de barras animado con datos reales | `contenido/datos-poblacion-sudamerica.json` |

Todos llevan tu @usuario arriba, una barra de progreso abajo (ayuda a que vean el video completo) y un cierre con llamada a la acción.

## Primeros pasos

Necesitas [Node.js](https://nodejs.org) 20 o más nuevo.

```bash
npm install
npm run dev        # abre Remotion Studio para ver y editar los videos en el navegador
```

### 1. Pon tu marca
Edita `src/marca.ts`: nombre, `@usuario` y colores. Las fuentes están en `public/fuentes/`.

### 2. Crea contenido
Copia uno de los JSON de `contenido/`, cámbiale el nombre y el texto. Ejemplo de trivia:

```json
{
  "formato": "Trivia",
  "props": {
    "pregunta": "¿Cuál es el río más largo del mundo?",
    "opciones": ["Nilo", "Amazonas", "Yangtsé", "Misisipi"],
    "correcta": 1,
    "segundosParaPensar": 5,
    "explicacion": "Según varios estudios, el Amazonas supera al Nilo por pocos kilómetros.",
    "cta": "¿Acertaste? Comenta"
  }
}
```

`correcta` empieza a contar desde 0 (0 = A, 1 = B, 2 = C, 3 = D).

### 3. Genera los videos

```bash
npm run lote                     # todos los JSON, en vertical
npm run lote -- --horizontal     # todos, en horizontal
npm run lote -- --ambos          # todos, en los dos tamaños
npm run lote -- trivia           # solo los archivos cuyo nombre contiene "trivia"
```

Los videos quedan en `out/`.

### Música de fondo (opcional)
Pon un `.mp3` en `public/musica/` y agrega `"musica": "nombre.mp3"` dentro de `props`. Usa solo música libre de derechos (por ejemplo, la Biblioteca de audio de YouTube); si no, te quitan la monetización de ese video.

## Rutina sugerida para monetizar

1. **Elige un nicho** y no lo cambies (curiosidades, datos de Latinoamérica, comida, motivación…).
2. **Cada semana:** un video horizontal largo para YouTube y de 3 a 5 Shorts o Reels.
3. **Escribe 10 JSON de una vez** y genera todo con `npm run lote -- --ambos`.
4. **Agrega tu aporte propio**: tu voz, tu opinión, datos verificados. YouTube y Facebook no pagan por contenido repetitivo sin valor agregado.
5. **Revisa qué funciona** (retención, comentarios) y repite esos temas.

> Los datos de los ejemplos son aproximados. Verifica siempre las cifras y cita la fuente antes de publicar.

## Estructura

```
contenido/        ← tus videos, uno por archivo JSON
public/fuentes/   ← fuentes tipográficas
public/musica/    ← música de fondo
scripts/          ← render-lote.mjs (genera todos los videos)
src/marca.ts      ← tu identidad: colores, fuentes, @usuario
src/formatos/     ← las plantillas de video
src/comun/        ← piezas compartidas (fondo, firma, música, animaciones)
```

## Licencia de Remotion
Remotion es gratis para personas y equipos de hasta 3 personas. Revisa https://www.remotion.dev/license si crece tu empresa.
