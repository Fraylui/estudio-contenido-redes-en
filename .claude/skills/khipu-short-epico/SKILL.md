---
name: khipu-short-epico
description: Hacer de corrido un Short o un video largo de Khipu en formato "tomas épicas" (una historia narrada con una imagen épica por momento, cámara 2.5D, voz según la categoría) con un solo comando que se puede retomar - guion, tomas, elegir, nitidez, profundidad, voz, render, control de calidad, subir y programar en Metricool. Usar para cada Short o video largo nuevo, en la tarea diaria, o cuando haya que rehacer uno.
---

# Short épico de corrido

Todo el proceso es **un comando**: `bash scripts/short-epico.sh <nombre>`. Hace solo los pasos que faltan, así que si el servidor se reinicia se vuelve a correr igual. Los pasos pesados usan candados: nunca hay dos generadores de imágenes ni dos voces a la vez.

## 1. Escribir los dos archivos (lo único que se escribe a mano)
**`contenido/<nombre>.json`**, el guion. Para un video largo, el nombre empieza con `largo-` y sale en horizontal.
```json
{"formato": "Pizarra",
 "voz": {"referencia": "voz/referencias/kokoro-alex.wav", "pausa": 0.25, "velocidad": 0.95, "tono": "serio", "pronunciacion": {"Goliat": "Goliát"}},
 "props": {"gancho": "¿CÓMO CAYÓ EL GIGANTE?", "musica": "musica/epica.mp3", "tono": "calido",
   "narracion": [{"texto": "Un ejército entero temblaba por un solo hombre.", "estilo": "narrador"}],
   "escenas": [{"dibujo": {"iconos": []}, "fondo": "ia:gol01-ejercito", "texto": "Un ejército temblaba…", "resaltar": "temblaba…",
                "sonido": "flash_shock", "sonidoEn": 0.05}]}}
```
- **Una frase de narración = una escena = una toma.** Con `":paneo"` al final del fondo, la cámara se mueve más.
- **Voz:** la copia de `voz/voces.json` según la categoría. Los videos largos van siempre con Xiomi.
- **El video largo no lleva `gancho`.** Sus secciones se marcan con `"etiqueta"`.
- **Extras por escena:** `particulas` (polvo, brasas, lluvia, chispas, nieve, **niebla** que avanza, **rayos** de luz que respiran), `ambiente` (sonido de fondo de la biblioteca) y `sonido` + `sonidoEn` (golpe).
- **Movimiento:** cada toma se mueve sola como filmada: la cámara se turna entre acercar, derecha, alejar, izquierda, subir y bajar, y la profundidad mueve lo cercano más que lo lejano. Se puede forzar con `"camara": "acercar"`. Úsalo con intención: `acercar` para revelar o dar tensión, `alejar` para mostrar escala, `subir` para lo enorme (Goliat, montañas) y los barridos para viajes y caminos.

**`imagen/tomas/<nombre>.json`**, una toma por escena:
```json
{"_nota": "fuentes y reglas del video", "gol01-ejercito": "an ancient Israelite army on a hill seen from behind, ..."}
```
Una toma de otro video se reutiliza poniendo su nombre en `fondo`, sin repetirla aquí.

## 1b. Investigar desde todas las perspectivas (antes de escribir una sola línea)
1. **Los hechos:** 2 fuentes serias por cada dato central (enciclopedias, museos, universidades, la Biblia con su cita). Si no coinciden, se dice.
2. **Las otras versiones:** qué dicen los historiadores que no están de acuerdo, qué es tradición y qué está comprobado.
3. **La competencia:** qué videos del tema tienen más vistas (`scripts/investigar-youtube.py`), qué cuentan, y **qué no cuentan**. Ahí está nuestro ángulo.
4. **El público:** qué preguntan en los comentarios de esos videos, y qué entiende o no entiende alguien de México, España o Argentina.
5. **Lo visual:** qué imágenes reales existen con licencia libre (`scripts/imagen-libre.py`) y qué hay que crear.
Se anota en el `_nota` de `imagen/tomas/<nombre>.json`: las fuentes, el ángulo elegido y lo que se descartó.

## 2. Reglas del guion (todas las pidió el usuario)
- **Cómo narrar:** las 12 técnicas y la lista de revisión de `docs/como-narran-los-grandes.md` (arranque con 3 datos que chocan, un anzuelo al cierre de cada parte, una pregunta por minuto, imágenes concretas, remates, un hilo que vuelve y un final que cierra el círculo). Los videos largos duran de **8 a 12 minutos**.
- **Temas para todo el mundo hispanohablante**, no solo para el Perú: el gancho tiene que entenderlo alguien que nunca oyó del tema.
- **Contar una historia:** personaje, conflicto, giro y desenlace. El dato va dentro de la historia y nunca debe confundir; por ejemplo, "Goliat medía 2 m" sin contexto hacía pensar que no era un gigante.
- **Empezar en medio de la acción** (el momento más fuerte, no el contexto) y con un primer cuadro que sorprenda: la decisión de quedarse se toma en unos 2 s. Meta: "Visto vs. deslizado" de más de 70 %.
- **Cada Short lleva a un video largo** del mismo tema: los Shorts casi no pagan, los largos sí (`docs/monetizacion.md`, 1c).
- **El gancho en la primera frase:** algo en juego o un misterio con nombre propio. Nada de "hola" ni de presentaciones.
- **Nunca mendigar:** ni "suscríbete" ni "comenta". El final es un remate fuerte que conecta con el inicio.
- **Datos con fuente** en la descripción. Lo que viene de la tradición se dice así ("según la tradición…").
- **Biblia:** se cita el pasaje y nunca se muestra el rostro de Jesús ni de Dios (luz, silueta de espaldas).
- **Short:** de 30 a 45 s y de 9 a 11 escenas. **Video largo:** de 8 a 10 min, de 1 200 a 1 500 palabras, con un reenganche en 1/3 y otro en 2/3.

## 3. Reglas de los prompts de las tomas
- **Describir lo que hace reconocible cada cosa:** no "a scroll", sino "two dark carved wooden rollers, aged parchment with columns of ink".
- **El personaje siempre igual:** misma descripción en todas sus tomas (Goliat: "giant Philistine warrior, bronze helmet, bronze scale armor, thick black beard, huge spear").
- **Encuadres variados:** plano general, contrapicado para lo enorme, primer plano de manos u objetos, silueta a contraluz.
- **Nada fuera de época:** ni cúpulas, ni cruces, ni armas de fuego en historias antiguas. Revisarlo en la hoja.
- El estilo `epico` ya agrega la luz cinematográfica (ver `docs/prompts-profesionales.md`).

## 4. Correr, elegir y publicar
1. Primero `bash scripts/short-epico.sh <nombre>`. Se detiene en el paso **hoja**: mira `out/revision/<nombre>-tomas.jpg` (cada imagen dice su toma y su variante).
2. Escribe `imagen/tomas/<nombre>.elegidas`, una línea por toma: `gol01-ejercito 2`. Si ninguna sirve, borra sus PNG en `/tmp/claude-0/tomas`, mejora el prompt y vuelve a correr.
3. Corre otra vez el comando. Instala, narra, renderiza, revisa y sube: al final imprime el link público del video.
4. Mira `out/revision/<nombre>-final-hoja.jpg`. Revisa que nada tape la imagen, que no haya cuadros negros ni cosas fuera de época, y que el informe esté a −14 LUFS.
5. Programa en Metricool (`createScheduledPost`, blogId 7370438, `publicationDate` con zona `America/Lima`):
   - YouTube, `type` short o video, `privacy` public, `category` EDUCATION, `madeForKids` false, `isAiGeneratedContent` true.
   - **Título:** gancho + `#shorts`.
   - **Descripción:** 1 o 2 líneas de historia, las fuentes, el crédito de la música (Kevin MacLeod, CC BY 4.0) y 3 o 4 hashtags.
   - En los videos largos va `videoThumbnailUrl` con la mejor de las 3 miniaturas.
6. Llena su fila en el marcador de `docs/mejora-continua.md` y marca el tema con ✅ en el calendario.

## 5. Tiempos reales (CPU de 4 núcleos)
- Una toma: ~1 min por variante. La nitidez: ~1–2 min por toma. La voz: ~20–30 min por Short. El render: ~10 min.
- **Un Short completo: ~1 h 30 min.** Por eso se trabaja con un día de adelanto: hoy se hace lo de mañana.
- **Nunca se lanzan dos narraciones a la vez:** cada una usa 6 GB y la máquina tiene 16.
- **Nunca editar `scripts/short-epico.sh` mientras corre:** bash lee el archivo a medida que avanza, y un cambio a mitad de camino lo rompe (pasó el 28 oct). Si hay que cambiarlo, primero se espera a que termine; o se corre una copia.
