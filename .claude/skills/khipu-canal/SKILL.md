---
name: khipu-canal
description: Estrategia completa del canal de YouTube Khipu (animación educativa y entretenimiento multitemático) - qué temas publicar, cuántos videos largos y Shorts, a qué hora, cuánto deben durar, los tipos de gancho (verbal, visual, sonoro, narrativo, emocional), las técnicas de retención, la estructura de cada video y de cada Short, las miniaturas, las métricas de cada semana y el mapa de lo que nuestras herramientas pueden hacer en cada elemento de producción. Usar al planear el calendario, elegir un tema, escribir un guion o un Short, decidir duración o frecuencia, revisar estadísticas, o cuando pregunten "qué hacemos ahora", "cómo crecer", "qué somos capaces de hacer".
---

# Canal Khipu: estrategia y capacidades

Khipu es un canal de **animación educativa y entretenimiento**, multitemático, en español. Toma lo mejor de CasiCreativo (explicar lo cotidiano con humor y personajes), Kurzgesagt (preguntas científicas grandes contadas como historia), The Infographics Show (muchos temas con un formato reconocible), TED-Ed (guion didáctico y claro) y Zack D. Films (Shorts de una sola curiosidad). Los personajes, la narración, el estilo visual y los guiones son propios: nunca se copia un video.

La rutina de cada día (qué categoría toca, qué se produce y a qué hora) está en la skill `khipu-diario`. El índice de todas las skills y las reglas que nunca cambian, en `CLAUDE.md`.

Documentos que completan esta skill:
- `docs/receta-video.md`: la lista de cada video, del paso 1 al 10.
- `docs/patrones-creadores.md`: el análisis con datos de 8 canales.
- `docs/psicologia-atencion.md`, `docs/ganchos.md`, `docs/empaquetado.md`, `docs/monetizacion.md`, `docs/mejora-continua.md`.
- La producción técnica va en la skill `pizarra`.

**Regla del usuario (28 oct): nunca mendigar** suscripciones, likes ni comentarios en el video ni en el texto; el final es un remate en bucle con el inicio.

## 0. Las 14 categorías de Khipu
1. Ciencia y curiosidades
2. Hábitos y productividad
3. Cuerpo humano y salud
4. Psicología, emociones y amor
5. Historia del Perú y Latinoamérica
6. Historia mundial y guerras
7. Finanzas personales
8. Economía y negocios
9. Tecnología e IA
10. Personajes que cambiaron la historia
11. Lugares y países
12. Animales y naturaleza
13. Misterios y enigmas
14. Mundo antiguo y Biblia

La rotación diaria (2 por día) está en `khipu-diario`. Cada categoría es una serie con su lista de reproducción y su color de miniatura.

## 1. Qué publicar: líneas temáticas
Todo cabe en Khipu, pero **el primer mes se prueban 3 líneas**, con el mismo estilo de narración y animación para poder compararlas:

| Línea | Ejemplos | Por qué |
|---|---|---|
| **A. Ciencia y curiosidades** (prioridad) | ¿Por qué los humanos somos tan inteligentes? ¿Qué pasaría si desaparecieran las abejas? ¿Por qué el tiempo pasa más rápido al crecer? | Mucho alcance; buen CPM en educación |
| **B. Cuerpo humano y vida cotidiana** | ¿Qué pasa en tu cuerpo si duermes poco? Tu cerebro cuando te enamoras. ¿Por qué se contagia el bostezo? | Identificación inmediata (el formato de CasiCreativo) |
| **C. Dinero, tecnología y comportamiento** | ¿Por qué cuesta tanto ahorrar? ¿Cómo cambiará la IA tu vida? ¿Por qué compramos lo que no necesitamos? | El CPM más alto (finanzas y tecnología) |
| Para probar en Shorts | Animales y sus adaptaciones, historias sorprendentes, fenómenos naturales, lugares | Muy visuales, mucho alcance |
| Serie de alto alcance | "La historia de ___ en N minutos" | Lo más visto del análisis: de 8 a 33 millones por video |

**Ingresos frente a vistas:** los temas que más vistas traen (animales, curiosidades) no son los que más pagan por cada mil vistas (finanzas, tecnología, educación). Se mezclan los dos. Las cifras de CPM de terceros son orientativas, nunca promesas: depende del país de quien mira, la duración y la demanda de anuncios.

**Al terminar el mes:** comparar vistas, retención, suscriptores y horas por línea, y hacer más de lo que funcione, sin abandonar del todo las demás.

## 1b. Lo que dicen los datos del canal (se actualiza cada semana)
- **24 de octubre:** los Shorts sacaron 1 000 y 590 vistas en 48 h, y los videos largos 9 y 5. **Los Shorts son el motor de crecimiento ahora.**
  - Ganador: "Por qué [algo que le pasa a todos]" + un personaje que lo vive + una respuesta que sorprende, en 30–40 s.
  - Por eso: 4 Shorts al día (decisión del usuario del 28 oct) y 4 videos largos por semana, con título gancho fijo arriba (`"gancho"` en las props del video vertical) y de 3 a 5 Shorts por cada video largo.

## 1c. Quién administra el canal
Claude administra Khipu de punta a punta: elige los temas, investiga, produce, decide las horas y programa todo en Metricool (siempre público). El dueño del canal comparte, responde comentarios y hace en YouTube Studio lo que Metricool no permite (prueba A/B de miniaturas, banner). Cada decisión de horario se basa en los datos: en las estadísticas de la semana y en `getBestTimeToPostByNetwork` de Metricool.

## 2. Cuánto publicar y a qué hora (Perú)
| Etapa | Videos largos | Shorts |
|---|---|---|
| Semanas 1–2 | 1 o 2 por semana | **1 al día** |
| Semanas 3–4 | 2 por semana | 2 al día, si se mantiene la calidad |
| Máximo | 2 o 3 por semana | 3 al día, solo si son buenos |

- **Calendario base:** lunes video largo (ciencia o curiosidades) · martes y miércoles Shorts · jueves segundo video largo (otra línea) · viernes y sábado Shorts · domingo un Short y la revisión de estadísticas.
- **Horas de prueba para Shorts:** 12:00 p. m., 5:00 p. m. y 8:00 p. m. Para videos largos, 9:00 a. m. o 4:00 p. m. A las 2 semanas se ajusta con la actividad real del público en YouTube Studio.
- **Más no es mejor:** un Short flojo resta. La calidad decide el ritmo.

## 3. Duración
| Tipo | Duración | Cuándo |
|---|---|---|
| Curiosidad sencilla | 3–5 min | Un fenómeno, una pregunta, una explicación |
| **Explicación o historia animada (el objetivo)** | **6–10 min** | Contexto, 2 o 3 descubrimientos y una conclusión |
| Documental animado | 10–15 min | Con experiencia: varias etapas y una investigación |
| Short | 20–40 s | Una sola curiosidad |

Nunca se rellena para llegar a 8 minutos: un video de 5 minutos que retiene vale más que uno de 12 con pausas. Para llegar a 6–10 min hacen falta de 1 200 a 1 800 palabras de guion (unas 185 por minuto con la voz de Xiomi).

## 4. Ganchos: los 5 tipos (se usan juntos)
| Tipo | Qué es | En Khipu |
|---|---|---|
| **Verbal** | La primera frase: pregunta, contradicción, dato que choca, promesa | Ver las fórmulas de abajo y `docs/ganchos.md` |
| **Visual** | Lo que se ve en el cuadro 1 | Algo ya en movimiento, un personaje con emoción extrema, un objeto 3D raro, un antes y después |
| **Sonoro** | Un golpe que tenga sentido | `flash_shock` o `boom` en el cuadro 1, o un silencio repentino |
| **Narrativo** | Empezar en el momento intrigante de una historia | "Mateo posponía la alarma 5 veces… hasta que" |
| **Emocional** | Sorpresa, ternura, admiración, indignación o empatía, sin exagerar los hechos | Lucía en una situación con la que el espectador se identifica |

**8 ganchos para videos largos** (los primeros 15 a 30 s):
1. Pregunta con contraste: *"¿Por qué somos tan inteligentes, si no somos los más fuertes ni los más rápidos?"*
2. Escenario hipotético: *"Imagina que mañana desaparecieran todos los humanos. ¿Qué pasaría con las ciudades en 100 años?"*
3. Paradoja personal: *"Tienes el cerebro más desarrollado de la historia… y aun así tomas malas decisiones."*
4. Misterio científico: *"Los científicos llevan décadas estudiándolo, y no hay una sola explicación."*
5. Viaje en el tiempo: *"Hace millones de años, sobrevivir no era nada sencillo."*
6. Problema cotidiano: *"Cobras, pagas tus gastos… y a fin de mes no sabes dónde quedó tu dinero."*
7. Reto al espectador: *"Intenta responder esto antes de que te lo explique: ¿por qué recordamos unas cosas y olvidamos otras?"*
8. Comparación: *"Una computadora calcula millones de operaciones, pero comprender el mundo es otra cosa."*

**7 ganchos para Shorts** (los primeros 2 s):
1. **Curiosidad:** "Hay algo que tu cerebro hace todos los días y no lo notas."
2. **Pregunta intrigante:** "¿Qué pasaría si…?" (distinguir siempre hipótesis de hechos).
3. **Problema cotidiano:** "¿Ganas tu sueldo y aun así no ahorras?"
4. **Contraste:** "No somos los más fuertes ni los más rápidos. Entonces, ¿cómo llegamos aquí?"
5. **Revelación:** "La explicación no está donde todos creen." (solo si el video la da).
6. **Consecuencias:** "Si las abejas desaparecieran, el problema no sería la miel."
7. **Misterio:** "Durante años esta pregunta desconcertó a todos."

**Reglas:** nunca "Hola, bienvenidos". El nombre del canal entra después ("Hoy en Khipu te explico…", entre los 10 y 15 s) o solo en la identidad visual. Nada de intro con logo. Un gancho que promete más de lo que el video da hace que la gente se vaya y hunde la retención.

## 5. Técnicas de retención (después del gancho)
| Técnica | Cómo se hace en Khipu |
|---|---|
| **Bucle abierto** | "El paso 4 casi nadie lo hace…", y se cierra más adelante |
| **Brecha de curiosidad** | Mostrar lo justo: el resultado de Lucía antes de explicar cómo llegó |
| **Ruptura del patrón** | Cambio de fondo por sección, destello de luz, sonido distinto, sacudida |
| **Cliffhanger de sección** | Terminar una sección con una pregunta: "¿Y entonces por qué caemos tan fácil?" |
| **Historia** | Personaje con nombre, conflicto, intentos, resultado |
| **Payoff** | Toda pregunta abierta se responde en el mismo video |
| **Escalada** | Datos de menor a mayor: 5 al día → 150 al mes → 36 000 en 20 años |
| **Microganchos** | Cada 20 a 40 s: un ejemplo, una comparación, un número que sube o un chiste |
| **Anticipación** | "Y aquí viene lo importante:" antes del dato clave |
| **Contraste** | Antes y después, activo frente a pasivo, efectivo frente a tarjeta |
| **Revelación progresiva** | Descubrir por etapas, sin ocultar datos esenciales de forma engañosa |
| **Recontextualización** | Un dato que cambia lo que se vio antes ("los gastos hormiga son pasivos disfrazados") |
| **Ritmo** | Alternar explicación, acción, pausa y descubrimiento. No hace falta un efecto por segundo: el exceso cansa |
| **Cierre** | Un remate fuerte y el siguiente video que continúa la historia (pantalla final). Nunca pedir suscripciones, likes ni comentarios |

## 6. Estructuras
**Video largo de unos 8 minutos** (orientativo; si la respuesta llega antes, se entrega antes):
| Tiempo | Bloque |
|---|---|
| 0:00–0:20 | Gancho (verbal, visual y sonoro) |
| 0:20–0:45 | Promesa: qué va a descubrir y por qué importa, más un bucle abierto |
| 0:45–2:30 | Contexto: el problema con un personaje y ejemplos |
| 2:30–5:30 | Desarrollo: 2 o 3 ideas, con microganchos cada 20–40 s |
| 5:30–7:30 | La revelación prometida: se conecta todo |
| 7:30–8:00 | Cierre: la última revelación y el siguiente video, sin pedir nada. Sin despedidas largas |

**Cadena de preguntas** (la técnica más importante): cada respuesta abre la siguiente pregunta. Por ejemplo: ¿por qué tanta tecnología? → ¿fue solo por tener un cerebro grande? → lenguaje, cooperación y herramientas → ¿qué ventaja dio pasar el conocimiento entre generaciones? → conclusión.

**Short de 30 s** (diseñado para entenderse solo, no un recorte que necesita contexto):
| Tiempo | Bloque |
|---|---|
| 0–2 s | Gancho verbal y visual juntos |
| 2–7 s | El contexto mínimo y por qué es interesante |
| 7–22 s | Explicación con cambios visuales, ejemplo o comparación |
| 22–30 s | La respuesta y un remate. Opcional: una pregunta o un enlace al video largo relacionado |

## 7. Miniaturas y títulos
- **Miniatura:** un protagonista enorme (personaje, objeto 3D o imagen rara), una emoción clara, de 0 a 3 palabras que **no repiten el título**, un contraste si hay, y el color de la serie. Debe leerse en un celular.
- **Título:** preciso y con curiosidad, sin engañar. Fórmulas: "¿Por qué…?", "¿Qué pasaría si…?", "Tu ___ cuando ___", "La historia de ___ en N minutos", "Cómo ___ sin ___", "N errores que ___".
- Siempre 3 miniaturas por video: la principal va en Metricool y las otras 2 se prueban con "Probar y comparar" de YouTube.

## 8. Estadísticas de cada domingo (YouTube Studio)
| Métrica | Qué dice | Si va mal |
|---|---|---|
| Impresiones y CTR | Si el título y la miniatura atraen | CTR por debajo del 4–5 %: cambiar la miniatura |
| Duración media y retención | Dónde se va la gente y dónde vuelve a mirar | Arreglar el gancho o el tramo donde cae |
| Espectadores recurrentes | Qué temas hacen volver | Hacer la segunda parte de esos temas |
| En Shorts, "decidió mirar" frente a "deslizó" | Si el comienzo detiene el dedo | Cambiar el gancho de los 2 primeros segundos |
| Suscriptores por video | Qué convierte en comunidad | Repetir la serie |

Los primeros días importan poco: se necesitan de 8 a 12 videos para comparar. La retención detallada tarda 1 o 2 días en aparecer. Las métricas privadas de otros canales (retención, CTR, ingresos) no se conocen y **nunca se inventan**.

## 9. Monetización (Perú, vigente al revisar)
- **Ingresos por anuncios:** 1 000 suscriptores y 4 000 horas públicas de videos largos en 12 meses, o 10 millones de vistas válidas de Shorts en 90 días.
- **Las horas del feed de Shorts no cuentan para las 4 000 horas.** Los largos dan horas y los Shorts dan descubrimiento.
- Hay un nivel anticipado con unos 500 suscriptores (funciones de fans, no anuncios completos).
- IA permitida, pero nada de contenido repetitivo o en masa (ver `docs/monetizacion.md`).

## 10. Mapa de capacidades: qué podemos hacer en cada elemento de producción
✅ ya lo hacemos · 🟡 se puede, falta construirlo o usarlo más · ❌ no se puede aquí (y qué hacer en su lugar)

| Elemento | Estado y herramienta |
|---|---|
| **Narración** | ✅ Chatterbox con la voz de Xiomi, 12 estilos, pronunciación y revisión con Whisper |
| Voces de distintos personajes (diálogo) | 🟡 El mismo clon con otro `tono` o estilo; una voz distinta necesita otra grabación de referencia con permiso |
| **Música de fondo** | ✅ Kevin MacLeod (CC BY), que se aparta sola cuando habla la voz |
| **Efectos de sonido** | ✅ 14 efectos (`video-sfx`), whoosh y pop automáticos, golpes clave |
| Sonidos ambientales (lluvia, ciudad, selva) | 🟡 Freesound CC0, por integrar |
| Silencios y transiciones sonoras | ✅ |
| Ecualización, ruido y mezcla | ✅ Calibración por bandas, sin soplido, −14 LUFS |
| Destellos y luz | ✅ Light leak entre secciones |
| Partículas | ✅ Confeti · 🟡 polvo, lluvia, chispas y humo (partículas por código) |
| Fuego, explosiones | 🟡 Lottie gratis o dibujo animado; ❌ simulación realista |
| Ralentizar, congelar | 🟡 Con `Sequence` y `playbackRate` |
| Desenfoque y profundidad | ✅ Fondos con IA desenfocados y entrada con desenfoque |
| **Cámara:** zoom, punch-in, Ken Burns | ✅ |
| Paneo y travelling | ✅ Paneo lateral sobre escenarios con IA (`ia:x:paneo`) · 🟡 cámara que viaja por un lienzo grande |
| Órbita y 3D | 🟡 Three.js en Remotion (skill `remotion-markup`, 3D) |
| **Personajes 2D animados** (parpadeo, boca, gestos) | ✅ Mateo, Lucía, la mascota y Open Peeps |
| Personajes 3D con IA | ✅ Para miniaturas y escenas fijas (chibi 3D, estilo `objeto3d`) · ❌ animarlos con labios |
| Animales y criaturas | 🟡 Objeto 3D con IA o dibujo nuevo en la biblioteca |
| **Objetos** | ✅ Íconos ilustrados (Tabler, más de 5 000) y objetos 3D con IA recortados |
| **Escenarios** (lugares, épocas, día y noche) | ✅ SD-Turbo con prompt preciso · ❌ fotos reales de un lugar concreto (pedirlas o usarlas con licencia) |
| Imágenes de archivo | 🟡 Solo con licencia libre (Wikimedia CC, dominio público) y su crédito |
| **Textos y subtítulos** | ✅ Estilo CapCut con palabra clave |
| Cifras que cuentan, flechas, círculos | ✅ |
| **Mapas animados** | ✅ `"mapa"` en la escena: países que se pintan, rutas con flecha, marcadores y etiquetas, en 2D plano y sin internet |
| Gráficos, diagramas, cronologías | ✅ Barras que crecen con cifras que cuentan · 🟡 líneas y cronología por construir |
| Revelación por capas (silueta → imagen) | ✅ `"silueta": true` |
| Logo y marca | ✅ Logotipo khipu, banner y miniaturas |
| Color y ambiente | ✅ Paletas por sección · 🟡 gradación de color o grano por efecto |
| Edición y ritmo | ✅ Escenas sincronizadas con cada frase y transiciones |
| Shorts | ✅ Recortes verticales del largo · 🟡 Shorts nativos diseñados para entenderse solos (preferible) |
| Investigación | ✅ Búsqueda web, `investigar-youtube.py`, `analizar-canales.py` |
| Publicación y medición | ✅ Metricool (público, miniatura, mejor hora) · 🟡 estadísticas de Metricool en la revisión semanal |
| Video con IA (imagen a video) | ❌ Sin tarjeta gráfica; Abracadabrax cuesta créditos |

**Regla:** un video profesional no es el que acumula más efectos, sino el que usa los elementos que cuentan mejor **su** historia. Por ejemplo: un pueblo de Ayacucho pide un mapa, sonido ambiente, fechas y fotos con permiso; un animal pide su comportamiento, sonidos naturales y un gráfico que lo explique.

## 11. Documental animado 2D (historia, países, guerras, personajes, Biblia)
Referencias que hay que estudiar: **OverSimplified** (guerras y revoluciones con humor y caricaturas), **Simple History** (2D simple y reutilizable), **The Armchair Historian** (mapas y tropas), **History Matters** (una pregunta, pocos minutos), **Extra History** (series por episodios), **Geo History** (fronteras que cambian) y **BibleProject** (relatos bíblicos ilustrados).
- **Los 8 movimientos que explican:**
  1. Zoom a un rostro, una fecha o un lugar, y luego alejarse.
  2. Paneo por el escenario.
  3. Mapa que se pinta con rutas.
  4. Personajes con gestos.
  5. Objetos que se mueven (máquinas, humo, engranajes).
  6. Antes y después.
  7. Revelación por capas.
  8. Gráficos que se construyen.
- **Ganchos de historia:**
  - misterio ("Durante siglos este lugar escondió…");
  - contradicción ("Tenía enormes riquezas, pero su pueblo era pobre");
  - pregunta ("¿Por qué estalló realmente…?");
  - transformación ("Así era Lima antes de…");
  - personaje ("Este hombre tomó una decisión que cambió el Perú");
  - consecuencia;
  - escenario hipotético ("¿Qué habría pasado si…?");
  - detalle desconocido.
- **Sonido:** la voz siempre se entiende. La música va por tema: documental, tensión o curiosidad, y nunca épica durante todo el video. Whoosh en desplazamientos, pop en gráficos, ambiente en escenarios y golpe sutil en revelaciones. Un silencio breve antes del dato fuerte.
- **Temas sensibles** (política peruana, guerras, Biblia):
  - neutralidad y fuentes serias;
  - en las reformas y los gobiernos, contar los efectos distintos según la zona y la época;
  - en la Biblia, distinguir el relato de fe de la evidencia histórica, con respeto;
  - nunca inventar secretos, cifras ni conspiraciones.
- **Diferencia de Khipu:** historia del Perú y de Latinoamérica (reforma agraria, gobiernos, fronteras, independencias) contada con las técnicas de los canales internacionales que casi no cubren estos temas.

## 12. Producción por lotes
1. Investigar y escribir 2 o 3 guiones juntos, con fuentes verificadas.
2. Generar objetos, escenarios y personajes con IA para todos en una sola tanda.
3. Narrar en lote: `npm run lote`, con la memoria de frases.
4. Revisar las hojas de contacto, renderizar y masterizar.
5. Sacar de 1 a 3 Shorts que se entiendan solos.
6. Programar todo en Metricool: público, mejor hora, miniatura y 3 variantes.
7. El domingo, revisar las estadísticas y anotar en `docs/mejora-continua.md`.
