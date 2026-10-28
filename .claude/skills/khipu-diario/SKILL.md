---
name: khipu-diario
description: Rutina diaria de producción y publicación del canal Khipu - 26 categorías, con un Short de la Biblia todos los días a las 20:00 (ciencia, universo, hábitos, sabiduría, cuerpo, psicología, comida, palabras, historia del Perú, historia mundial, mitos y leyendas, Biblia, finanzas, economía, marcas, cómo funciona, tecnología, personajes, deportes, arte y música, lugares, animales, planeta Tierra, ¿qué pasaría si…?, misterios y mundo antiguo), cada Short con valor y fuente, 4 Shorts nativos al día (7:00, 12:00, 16:00 y 20:00 de Lima) y 4 videos largos por semana (lunes, miércoles, viernes y domingo a las 10:00), investigación previa, control de calidad y programación en Metricool. Usar cuando toque producir el contenido del día, cuando pregunten "qué sale hoy o mañana", o cuando corra la tarea programada diaria.
---

# Rutina diaria de Khipu

Objetivo: **cada día, contenido distinto y mejor que el anterior**, rotando categorías para descubrir qué funciona, sin bajar la calidad.
La estrategia de fondo está en `khipu-canal`; la producción técnica, en `pizarra`; la voz, en `voz-narradora`.

## 1. Qué toca cada día: 4 Shorts al día y 4 videos largos por semana (desde el 29 oct 2026)
Decisión del usuario: **4 Shorts diarios (28 por semana) y 4 videos largos por semana**. La Biblia tiene un Short **todos los días**; las otras 25 categorías salen al menos una vez cada 2 semanas.

**La Biblia sale todos los días a las 20:00** (pedido del usuario: mínimo un Short de la Biblia al día), cada día con su serie. Las otras 25 categorías van a las 7:00, 12:00 y 16:00; la columna de las 16:00 cambia entre semana A y semana B para que entren todas.

| Día | 07:00 | 12:00 | 16:00 (semana A / B) | 20:00 **Biblia** | Video largo 10:00 |
|---|---|---|---|---|---|
| Lunes | Ciencia y curiosidades | Hábitos y productividad | El universo / Sabiduría | Personajes (quién fue de verdad) | **Sí:** ciencia o universo |
| Martes | Cuerpo humano y salud | Psicología, emociones y amor | Comida / Palabras | Lugares y arqueología (con mapa) | — |
| Miércoles | Historia del Perú y Latinoamérica | Historia mundial y guerras | Mitos y leyendas | Historias explicadas | **Sí:** historia |
| Jueves | Finanzas personales | Economía y negocios | Historia de marcas / Cómo funciona | Vida cotidiana (monedas, comida, oficios) | — |
| Viernes | Tecnología e IA | Personajes que cambiaron la historia | Deportes y récords / Arte y música | Profetas y reyes / palabras en hebreo o griego | **Sí:** personajes o tecnología |
| Sábado | Lugares y países | Animales y naturaleza | Planeta Tierra / ¿Qué pasaría si…? | Mujeres de la Biblia / mapas y rutas | — |
| Domingo | Misterios y enigmas | Mundo antiguo | La ganadora de la semana | Parábolas y enseñanza para la semana | **Sí:** Biblia (una historia completa con su contexto) |

- Las horas son de Lima. La semana A empieza el lunes 2 de noviembre de 2026, la B el 9, y así se alternan. Cada video largo va con su categoría alternando semana a semana, y deja 1 o 2 de los Shorts de su día como avance (nativos, nunca recortes).
- **Ritmo de trabajo:** se produce con un día de adelanto (hoy se hace lo de mañana), para que una falla nunca deje un hueco. Cada proceso largo (voz, render) se lanza por separado, porque el servidor corta lo que pasa de 30 minutos.
- **Cuidado con la "granja de contenido":** 4 Shorts al día está dentro de lo normal, pero solo si cada uno es distinto de verdad (tema, escenario, objetos, gancho y voz). Si dos se parecen, se cambia uno.
- La voz de cada categoría está en `voz/voces.json`; el color de su miniatura, en `src/formatos/pizarra/categorias.ts`.
- Cuando una categoría gana 2 semanas seguidas en % visto, gana el turno del domingo a las 16:00 y su video largo; la que pierde 3 veces seguidas se pausa y se reemplaza por una nueva.

**Khipu trata todas las categorías que existan** (lo confirmó el usuario el 28 de octubre). Lo que cambió el 27 de octubre es la exigencia: **cada Short tiene que dejar valor** (un dato que no se sabía, con fuente, o algo que se pueda aplicar), no solo curiosidad. La **Biblia** entra como serie fuerte: domingo a las 20:00 y, cuando no haya un buen tema de historia mundial, también el miércoles a las 20:00.
Datos (Metricool, 27 oct): ganaron los Shorts de "por qué" con personaje (lunes 1 093 y 5 minutos más 1 295 vistas); los de dinero sacaron de 27 a 442.

- **Shorts:** 4 al día, a las **7:00, 12:00, 16:00 y 20:00** (hora de Lima).
- Los temas salen de `docs/calendario-contenido.md` (también el banco de la Biblia). Si se acaban, se investigan nuevos con el paso 2.

### Serie Biblia
**Reglas (nunca cambian):**
- **Cita siempre el pasaje** (libro, capítulo y versículo) en pantalla y en la descripción. Los versículos se citan de la **Reina-Valera 1909** (dominio público) o se parafrasean; nunca se copia una traducción con derechos.
- **Separar tres cosas:** lo que dice el texto, lo que dice la historia o la arqueología (con fuente) y lo que es tradición. Si los expertos discuten algo, se dice ("según…", "otros creen…").
- **Respeto y neutralidad:** para católicos, evangélicos y curiosos; nada de pelear doctrinas ni de burlarse.
- Escenarios con IA del mundo antiguo (`ia:jerusalen-antigua`, `ia:babilonia`, `ia:ciudad-antigua`), mapas del Medio Oriente, objetos 3D de época y `"tono": "sepia"` o `"calido"`. Nunca dibujar el rostro de Jesús ni de Dios: se usa luz, silueta de espaldas o símbolos.
- Música: `epica`, `antiguo` o `documental` de la biblioteca.


**Primero, revisar lo ya programado:** `getScheduledPosts` de Metricool para hoy y mañana. Si una hora ya tiene un Short o un video, no se duplica: se produce solo lo que falta, o se adelanta el trabajo del día siguiente.

## 2. Antes de producir (15 minutos)
0. **Revisar el último video publicado** con la skill `khipu-revision` (`scripts/analizar-video.py` y sus estadísticas) y escribir 3 mejoras medibles para el de hoy.
1. **Demanda:** `python3 scripts/investigar-youtube.py "<tema>"`. Vale si hay videos del tema con más de 500 000 vistas.
2. **Ángulo propio:** qué no dicen esos videos, o un ejemplo peruano o latino.
3. **Datos con fuente** (búsqueda web). Nada inventado.
4. **Gancho:** escribirlo primero, eligiendo uno de los 6 tipos de `docs/patrones-creadores.md` o una fórmula de `khipu-canal`. Para Shorts, la frase de los primeros 2 s y el título fijo de arriba.

## 3. Short nativo (diseñado para entenderse solo)
- **Nunca mendigar** (regla del usuario, 28 oct): nada de "suscríbete", "comenta", "dale like" ni "te leo en los comentarios". Baja la calidad percibida y la retención. El final es un remate fuerte que **conecta con la primera frase** (bucle): la última línea lleva de vuelta a la pregunta del inicio.
- **Voz según la categoría:** se copia de `voz/voces.json` (hombre grave en Biblia, historia, misterios y personajes; mujer cálida en hábitos, finanzas y animales; Sayra en cuerpo y psicología; en las de "prueba" se alternan y gana la que más retiene).
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

## 4. Video largo (lunes, miércoles, viernes y domingo)
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
