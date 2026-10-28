---
name: khipu-diario
description: Rutina diaria de producción y publicación del canal Khipu, dedicado a la Biblia desde el 28 de octubre de 2026 (personajes, historias, lugares y arqueología, palabras en hebreo y griego, vida cotidiana, parábolas, profetas, mujeres, mapas y cronología), 2 Shorts nativos al día a las 12:00 y 20:00 de Lima, video largo lunes y jueves, investigación previa, control de calidad y programación en Metricool. Usar cuando toque producir el contenido del día, cuando pregunten "qué sale hoy o mañana", o cuando corra la tarea programada diaria.
---

# Rutina diaria de Khipu

Objetivo: **cada día, contenido distinto y mejor que el anterior**, rotando categorías para descubrir qué funciona, sin bajar la calidad.
La estrategia de fondo está en `khipu-canal`; la producción técnica, en `pizarra`; la voz, en `voz-narradora`.

## 1. Qué toca cada día: Khipu es ahora un canal de la Biblia
**Decisión del usuario (27 de octubre de 2026):** los Shorts de hábitos y finanzas no dejaban valor. Desde el 28 de octubre todo el contenido es de la **Biblia**, explicada con historia, arqueología, mapas y contexto, al estilo de BibleProject pero en Shorts animados. Las otras 13 categorías quedan pausadas.
Datos de antes del cambio (Metricool, 27 oct): los Shorts de "por qué" con personaje (lunes 1 093 y 5 minutos más 1 295 vistas) ganaron; los de dinero, 27 a 442. Lo que se lleva al nuevo tema: **"Por qué…", personaje con emoción, colores vivos y un dato que choca**.

| Día | Short 12:00 | Short 20:00 | Video largo |
|---|---|---|---|
| Lunes | Personajes (quién fue de verdad) | Historias explicadas | **Sí:** una historia completa con su contexto |
| Martes | Lugares y arqueología (con mapa) | Palabras en hebreo o griego que cambian el sentido | — |
| Miércoles | Personajes | Lugares y arqueología | — |
| Jueves | Vida cotidiana en tiempos bíblicos (monedas, comida, oficios) | Parábolas y enseñanzas para hoy | **Sí:** un libro, un imperio o una época |
| Viernes | Datos que casi nadie sabe | Profetas y reyes | — |
| Sábado | Mapas y rutas (Éxodo, viajes de Pablo) | Mujeres de la Biblia | — |
| Domingo | Enseñanza para la semana (ansiedad, perdón, esperanza) | Cronología (qué pasó antes y después) | — (estadísticas y plan) |

**Reglas de la serie (nunca cambian):**
- **Cita siempre el pasaje** (libro, capítulo y versículo) en pantalla y en la descripción. Los versículos se citan de la **Reina-Valera 1909** (dominio público) o se parafrasean; nunca se copia una traducción con derechos.
- **Separar tres cosas:** lo que dice el texto, lo que dice la historia o la arqueología (con fuente) y lo que es tradición. Si los expertos discuten algo, se dice ("según…", "otros creen…").
- **Respeto y neutralidad:** para católicos, evangélicos y curiosos; nada de pelear doctrinas ni de burlarse.
- Escenarios con IA del mundo antiguo (`ia:jerusalen-antigua`, `ia:babilonia`, `ia:ciudad-antigua`), mapas del Medio Oriente, objetos 3D de época y `"tono": "sepia"` o `"calido"`. Nunca dibujar el rostro de Jesús ni de Dios: se usa luz, silueta de espaldas o símbolos.
- Música: `epica`, `antiguo` o `documental` de la biblioteca.

- **Shorts:** 2 al día, a las **12:00 p. m. y 8:00 p. m.** (hora de Lima).
- Los temas salen de `docs/calendario-contenido.md` (banco de temas de la Biblia). Si se acaban, se investigan nuevos con el paso 2.

**Primero, revisar lo ya programado:** `getScheduledPosts` de Metricool para hoy y mañana. Si una hora ya tiene un Short o un video, no se duplica: se produce solo lo que falta, o se adelanta el trabajo del día siguiente.

## 2. Antes de producir (15 minutos)
0. **Revisar el último video publicado** con la skill `khipu-revision` (`scripts/analizar-video.py` y sus estadísticas) y escribir 3 mejoras medibles para el de hoy.
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
