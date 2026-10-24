---
name: khipu-diario
description: Rutina diaria de producción y publicación del canal Khipu - cada día una categoría distinta (ciencia, cuerpo humano, historia, dinero, tecnología, lugares y animales, misterios y Biblia), 2 Shorts nativos al día a las 12:00 y 20:00 de Lima, video largo lunes y jueves, investigación previa, control de calidad y programación en Metricool. Usar cuando toque producir el contenido del día, cuando pregunten "qué sale hoy o mañana", o cuando corra la tarea programada diaria.
---

# Rutina diaria de Khipu

Objetivo: **cada día, contenido distinto y mejor que el anterior**, rotando categorías para descubrir qué funciona, sin bajar la calidad.
La estrategia de fondo está en `khipu-canal`; la producción técnica, en `pizarra`; la voz, en `voz-narradora`.

## 1. Qué categoría toca cada día
| Día | Categoría del día | Video largo |
|---|---|---|
| Lunes | Ciencia y curiosidades | **Sí** (9 a. m. o 4 p. m.) |
| Martes | Cuerpo humano y vida cotidiana | — |
| Miércoles | Historia (Perú, Latinoamérica, mundo) | — |
| Jueves | Dinero y comportamiento | **Sí** |
| Viernes | Tecnología e IA | — |
| Sábado | Lugares y animales | — |
| Domingo | Misterios, mundo antiguo y Biblia | — (revisión de estadísticas y plan de la semana) |

- **Shorts:** 2 al día, a las **12:00 p. m. y 8:00 p. m.** (hora de Lima). Uno de la categoría del día y otro de la categoría que mejor esté funcionando según los datos.
- Los temas salen de `docs/calendario-contenido.md`. Si se acaban, se investigan nuevos con el paso 2.
- **Prioridad por datos:** hoy los Shorts traen casi todas las vistas (ver `docs/mejora-continua.md`). Si una categoría gana dos semanas seguidas, recibe más espacio.

## 2. Antes de producir (15 minutos)
1. **Demanda:** `python3 scripts/investigar-youtube.py "<tema>"`. Vale si hay videos del tema con más de 500 000 vistas.
2. **Ángulo propio:** qué no dicen esos videos, o un ejemplo peruano o latino.
3. **Datos con fuente** (búsqueda web). Nada inventado.
4. **Gancho:** escribirlo primero, eligiendo uno de los 6 tipos de `docs/patrones-creadores.md` o una fórmula de `khipu-canal`. Para Shorts, la frase de los primeros 2 s y el título fijo de arriba.

## 3. Short nativo (diseñado para entenderse solo)
- De 20 a 40 s, **una sola idea**, de 6 a 9 escenas (una por frase), en `contenido/short-<tema>.json` y renderizado en vertical:
  `npm run lote -- short-<tema>` (la composición vertical usa `Pizarra-Vertical`).
- **Estructura:**
  - 0–2 s: gancho verbal y visual juntos;
  - 2–7 s: el contexto mínimo;
  - 7–22 s: la explicación, con cambios visuales;
  - 22–30 s: la respuesta y un remate.
- **Siempre lleva:**
  - `"gancho"` (título fijo arriba);
  - un personaje con emoción, o un objeto 3D protagonista;
  - un golpe de sonido en el cuadro 1 (`hooks/…` de la biblioteca);
  - música por tema;
  - números que cuentan si hay cifras.
- **Título:** "Por qué…", "¿Qué pasaría si…?" o "El truco para…", más `#shorts`. **Descripción:** 1 línea, enlace al video largo relacionado si hay, crédito de la música y fuentes.
- También valen los recortes de un video largo, siempre que se entiendan solos y lleven `"gancho"` (ver `pizarra`, sección 5b).

## 4. Video largo (lunes y jueves)
Se sigue completo `docs/receta-video.md`:
- de 6 a 10 minutos, entre 1 200 y 1 800 palabras;
- 3 miniaturas;
- mapa o barras si el tema lo pide;
- 6 a 8 objetos 3D del tema;
- escenarios con IA hechos con prompts de 7 capas.

De cada video largo salen de 3 a 5 Shorts para los días siguientes.

## 5. Control de calidad (nunca se salta)
- [ ] Hoja de contacto de todas las escenas: nada cortado, el dibujo dice lo mismo que la frase.
- [ ] Voz: todas las frases al 92 % o más en la revisión; pausas por debajo de −65 dB; −14 LUFS.
- [ ] Ninguna palabra encimada, el gancho legible y la última palabra en rojo.
- [ ] Archivo de menos de 100 MB; licencias y créditos en la descripción.

## 6. Publicar y avisar
1. Subir el video a la rama `publicaciones` y comprobar el link público.
2. Programarlo en Metricool: **público**, a la hora del calendario, `isAiGeneratedContent: true`, `madeForKids: false`, categoría Educación y miniatura en los videos largos.
3. Comprobar con `getScheduledPosts` que quedó programado.
4. Avisar al usuario en español y en pocas líneas: qué sale, a qué hora, y que lo comparta.

## 7. Aprender cada día
- Anotar en `docs/mejora-continua.md` qué se estrenó hoy.
- Los domingos: estadísticas de la semana (vistas, retención, "decidió mirar" en los Shorts, suscriptores por video) y ajustar el calendario.
- Cada mes: `scripts/analizar-canales.py` para actualizar `docs/patrones-creadores.md`.
