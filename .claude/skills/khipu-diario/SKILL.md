---
name: khipu-diario
description: Rutina diaria de producción y publicación del canal Khipu - 2 Shorts nuevos al día (12:00 y 20:00 de Lima, la Biblia siempre a las 20:00), 2 videos largos por semana (miércoles y domingo 10:00, 8-12 min) y 2-3 recortes de cada largo (7:00 o 16:00); temas sacados de lo que ya pegó, todo en 2D con el personaje fijo, lista de control obligatoria, control de calidad y programación en Metricool. Usar cuando toque producir el contenido del día, cuando pregunten "qué sale hoy o mañana", o cuando corra la tarea programada diaria.
---

# Rutina diaria de Khipu

Objetivo: **cada día, contenido distinto y mejor que el anterior**, rotando categorías para descubrir qué funciona, sin bajar la calidad.
La estrategia de fondo está en `khipu-canal`; la producción técnica, en `pizarra`; la voz, en `voz-narradora`.

> **Ritmo desde el sábado 31 oct (decidido con el usuario el 29 oct):** 2 Shorts nuevos al día (12:00 y 20:00; la Biblia siempre a las 20:00), 2 videos largos por semana (miércoles y domingo a las 10:00, de 8 a 12 min) y 2 o 3 Shorts recortados de cada largo (marco de marca) en las 7:00 o 16:00. Motivo: la cuota gratis de FLUX (~80 imágenes/día, se reinicia a las 19:00 de Lima), el límite semanal de Claude del usuario y que YouTube premia la calidad. Se evalúa a las 2 semanas con los datos de Studio. La producción diaria corre a las 19:07 de Lima. Las tablas de abajo con 4 Shorts y 4 largos quedan como banco de categorías.

## 1. Qué toca cada día (historial: el ritmo vigente es el del aviso de arriba; las categorías siguen sirviendo para rotar temas)
Decisión del usuario: **4 Shorts diarios (28 por semana) y 4 videos largos por semana**. La Biblia tiene un Short **todos los días**; las otras 25 categorías salen al menos una vez cada 2 semanas.

**La Biblia sale todos los días a las 20:00** (pedido del usuario: mínimo un Short de la Biblia al día), cada día con su serie. Las otras 25 categorías van a las 7:00, 12:00 y 16:00; la columna de las 16:00 cambia entre semana A y semana B para que entren todas.

| Día | 07:00 | 12:00 | 16:00 (semana A / B) | 20:00 **Biblia** | Video largo 10:00 |
|---|---|---|---|---|---|
| Lunes | Ciencia y curiosidades | Hábitos y productividad | El universo / Sabiduría | Personajes (quién fue de verdad) | **Sí:** ciencia o universo |
| Martes | Cuerpo humano y salud | Psicología, emociones y amor | Comida / Palabras | Lugares y arqueología (con mapa) | — |
| Miércoles | Historia del Perú y Latinoamérica | Historia mundial y guerras | Mitos y leyendas | Historias explicadas | **Sí:** historia |
| Jueves | Historias del dinero | Economía y negocios | Historia de marcas / Cómo funciona | Vida cotidiana (monedas, comida, oficios) | — |
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

- **Shorts:** 2 nuevos al día a las **12:00 y 20:00**; las **7:00 y 16:00** son para recortes de los largos (hora de Lima).
- Los temas salen de `docs/calendario-contenido.md` (también el banco de la Biblia). Si se acaban, se investigan nuevos con el paso 2.

### Serie Biblia
**Reglas (nunca cambian):**
- **Cita siempre el pasaje** (libro, capítulo y versículo) en pantalla y en la descripción. Los versículos se citan de la **Reina-Valera 1909** (dominio público) o se parafrasean; nunca se copia una traducción con derechos.
- **Separar tres cosas:** lo que dice el texto, lo que dice la historia o la arqueología (con fuente) y lo que es tradición. Si los expertos discuten algo, se dice ("según…", "otros creen…").
- **Respeto y neutralidad:** para católicos, evangélicos y curiosos; nada de pelear doctrinas ni de burlarse.
- Escenarios con IA del mundo antiguo (`ia:jerusalen-antigua`, `ia:babilonia`, `ia:ciudad-antigua`), mapas del Medio Oriente, objetos 3D de época y `"tono": "sepia"` o `"calido"`. Nunca dibujar el rostro de Jesús ni de Dios: se usa luz, silueta de espaldas o símbolos.
- Música: `epica`, `antiguo` o `documental` de la biblioteca.


**Primero, revisar lo ya programado:** `getScheduledPosts` de Metricool para hoy y mañana. Si una hora ya tiene un Short o un video, no se duplica: se produce solo lo que falta, o se adelanta el trabajo del día siguiente.

## Cómo hablar de dinero sin que la gente se vaya (pedido del usuario, 28 oct)
Nuestros Shorts de finanzas fueron los peores (de 27 a 442 vistas). El público se pierde con consejos, porcentajes y palabras de banco. Por eso **el dinero siempre se cuenta como historia**:
- **Una persona, un problema y un giro:** Bansir no llegaba a fin de mes y el hombre más rico de Babilonia le enseñó una regla. Alemania imprimió billetes hasta que un pan costó 200 mil millones. Nunca "5 consejos para ahorrar".
- **Cifras que se sienten:** "4 meses de sueldo" o "un pan, 200 mil millones", en vez de "una inflación de 29 500 %".
- **Cero palabras técnicas:** nada de "activos", "pasivos", "tasa", "rentabilidad" ni "diversificar". Si hace falta la idea, se muestra con una imagen.
- **Curiosidad antes que consejo:** "¿por qué…?", "el día que…", "el país donde…". El consejo, si lo hay, va al final y en una sola frase.
- **Historias del dinero del mundo:** el chocolate como moneda, las piedras gigantes de Yap, la quiebra de Venezuela, la burbuja de los tulipanes, el hombre más rico de la historia (Mansa Musa).
- La categoría "Finanzas" pasa a llamarse **"Historias del dinero"**.

## 2. Antes de producir (15 minutos)
**Obligatorio: repasar `docs/lista-de-control.md` antes del guion y antes de programar (resume todo lo analizado).**
**Desde el 30 oct manda `docs/plan-nuevo-formato.md`:** fondos FLUX sin personas + personaje fijo de Khipu dibujado en código, serie «Tú en la historia» para los largos y Shorts con temas de lo que ya pegó.
**Regla del usuario (28 oct): cada tema tiene que interesarle a cualquier persona del mundo hispanohablante, no solo al Perú.** Los datos de YouTube lo confirman: el público del mejor Short fue México 19 %, Bolivia 12 % y Costa Rica 8 %. Un tema peruano entra solo si el gancho es universal ("la bebida que le ganó a Coca-Cola", "un cuarto lleno de oro"), y siempre se explica sin dar nada por sabido. Prueba antes de elegir: ¿le daría curiosidad a alguien de México, España o Argentina que nunca oyó del tema?

0. **Revisar el último video publicado** con la skill `khipu-revision` (`scripts/analizar-video.py` y sus estadísticas) y escribir 3 mejoras medibles para el de hoy.
1. **Elegir el tema de lo que ya pegó (regla del usuario, 29 oct; obligatoria):** `python3 scripts/buscar-pegados.py shorts 3` (o `videos` para los largos) lista, en canales en español de nuestras categorías, los videos con 3 o más veces las vistas normales del canal. El tema sale de esa lista (o de un enlace que pase el usuario). **Se copia el tema, nunca el guion, el orden de escenas ni el título**: guion propio con fuentes, nuestro gancho con "tú", imágenes FLUX, voz y personaje de Khipu (copiar el video entero es contenido reutilizado y YouTube no lo monetiza). Anotar en el JSON `_nota` de qué video salió la idea. **Antes de escribir el guion, leer la transcripción del video que pegó** (gancho de los primeros 2 s, estructura, giro, cierre) y anotar qué técnica usa. YouTube bloquea las descargas desde el servidor y no se le da la vuelta: la transcripción la pega el usuario (Tactiq) o sube una grabación de pantalla, que se transcribe gratis con `voz/.venv/bin/python` + faster_whisper (como los TikToks del 29 oct). Pedirle al usuario los enlaces del día en un solo mensaje. Los canales se agregan en `CANALES` del script.
   **Demanda:** `python3 scripts/investigar-youtube.py "<tema>"`. Vale si hay videos del tema con más de 500 000 vistas.
2. **Ángulo propio:** qué no dicen esos videos, o un ejemplo peruano o latino.
3. **Datos con fuente** (búsqueda web). Nada inventado.
4. **Gancho:** escribirlo primero, eligiendo uno de los 6 tipos de `docs/patrones-creadores.md` o una fórmula de `khipu-canal`. Para Shorts, la frase de los primeros 2 s y el título fijo de arriba.

## 3. Short nativo (diseñado para entenderse solo)
- **Se hace con la skill `khipu-short-epico`** (`bash scripts/short-epico.sh <nombre>`): ahí están el formato del guion, las reglas de los prompts y la publicación.
- **Contar historias, no listar datos** (pedido del usuario, 28 oct): personajes, conflicto y desenlace ("un ejército temblaba… hasta que llegó un joven pastor… una sola piedra"). El dato va dentro de la historia. Nunca un dato que confunda: "Goliat medía 2 metros" sin contexto hizo pensar que no era gigante.
- **Formato (desde el 30 oct): todo en 2D** — fondos FLUX `fondo2d` + personaje fijo de Khipu; nada realista. (Antes: "tomas épicas") (el de los Shorts de la Biblia que más se ven): una imagen épica vertical por cada momento de la historia, con cámara 2.5D. Detalle en la skill `khipu-short-epico`.
- **Cada escena se hace al máximo:** si un momento se puede mostrar mejor con una toma propia, se hace la toma; los objetos 3D solos son para datos y explicaciones, no para historias.
- **Nunca mendigar** (regla del usuario, 28 oct): nada de "suscríbete", "comenta", "dale like" ni "te leo en los comentarios". Baja la calidad percibida y la retención. El final es un remate fuerte que **conecta con la primera frase** (bucle): la última línea lleva de vuelta a la pregunta del inicio.
- **Voz: SIEMPRE Xiomi (`voz/referencias/xiomi-clara.wav`) en todo, largos y Shorts, también la Biblia** (pedido del usuario, 31 oct: "Todo mejor utilicemos su voz de Xiomi"). Lo que sigue queda solo como historia: ~~Voz según la categoría:~~ se copia de `voz/voces.json` (hombre grave en Biblia, historia, misterios y personajes; mujer cálida en hábitos, finanzas y animales; Sayra en cuerpo y psicología; en las de "prueba" se alternan y gana la que más retiene).
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

## 4. Video largo (miércoles y domingo a las 10:00, 8-12 min)
- **Voz: siempre Xiomi** (pedido del usuario, 28 oct), sea cual sea la categoría. Desde el 31 oct también en los Shorts: ya no hay mapa de voces por categoría.
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
