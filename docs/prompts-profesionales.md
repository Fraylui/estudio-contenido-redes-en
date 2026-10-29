# Prompts profesionales para la IA de imágenes (SD-Turbo)

Un prompt básico ("a factory") da una imagen genérica. Un prompt profesional describe **la toma como la pediría un director de arte**. Siempre en inglés y en este orden: lo primero pesa más.

## La estructura (7 capas)
| # | Capa | Qué decir | Ejemplo |
|---|---|---|---|
| 1 | **Sujeto y acción** | Qué es y qué está pasando | *steam locomotive crossing a stone bridge* |
| 2 | **Lugar y época** | Dónde, cuándo y 3 o 4 detalles concretos | *19th century industrial town, red brick factories, tall smoking chimneys, canal with cargo boats* |
| 3 | **Encuadre** | Plano y composición | *wide establishing shot, rule of thirds, low angle, foreground / midground / background layers* |
| 4 | **Luz** | Hora y tipo de luz | *golden hour, long shadows, volumetric light rays, rim light, dramatic sunset* |
| 5 | **Paleta** | 2 o 3 colores dominantes | *warm orange and cool teal palette*, *earthy green, ochre and terracotta* |
| 6 | **Estilo** | Referencia visual fija del canal | *flat vector illustration, kurzgesagt and oversimplified style, clean geometric shapes, smooth gradients, soft shadows* |
| 7 | **Calidad y exclusiones** | Lo que no queremos | *high detail, crisp edges, no text, no people* |

## Plantillas listas
- **Escenario de documental** (fondos de historia y lugares):
  `[sujeto], [lugar y época con 3–4 detalles], wide establishing shot, rule of thirds, depth with foreground midground background, [luz], [paleta], flat vector illustration, kurzgesagt and oversimplified style, clean geometric shapes, smooth gradients, soft shadows, high detail, crisp edges, no text, no people`
  → `imagen/generar.py "<prompt>" salida.png --estilo ninguno --ancho 768 --alto 448 --pasos 4 --variantes 2`
- **Objeto 3D protagonista:** `--estilo objeto3d --sin-fondo`, describiendo material, colores y qué tiene encima o adentro.
- **Personaje 3D para miniatura:** *"a cute chibi cartoon [persona] character, [pelo], [ropa], big expressive eyes, [emoción exagerada] face, full body, standing"* + `--estilo objeto3d --sin-fondo`. Sirve para escenas fijas y miniaturas, no para animar la boca.
- **Mapa antiguo o pergamino** (fondo de historia): *"antique parchment map texture, sepia ink, compass rose, decorative border, aged paper, top-down view, no text"*.

## Paletas por tipo de tema
| Tema | Luz | Paleta |
|---|---|---|
| Historia y guerras | atardecer dramático, humo | naranja cálido y azul verdoso |
| Perú andino | hora dorada, sombras largas | verde, ocre y terracota |
| Biblia y mundo antiguo | amanecer, rayos de luz | arena, rosa y lavanda |
| Ciencia y espacio | brillo neón, fondo oscuro | azul profundo, magenta y cian |
| Dinero y vida diaria | luz suave de interior | pastel cálido |
| Misterio | noche, niebla, contraluz | azul noche y verde frío |

## Reglas
- Sin personas en los fondos: los personajes los ponemos nosotros encima.
- Sin texto en ninguna imagen (la IA escribe letras raras).
- Siempre 2 o 3 variantes, y quedarse con la que tenga menos detalles raros.
- Si sale algo extraño (caras deformes, letras), quitarlo del prompt o agregar *"no [cosa]"* al final.
- La misma capa 6 (estilo) en todo el video, para que las escenas se vean del mismo canal.

## Lecciones del bucle de prompts (24 de octubre)
- **Los objetos físicos salen muy bien en 3D:** comida, aparatos, vehículos, edificios, muebles, animales y herramientas.
- **Los símbolos abstractos no salen** (✓, ✗, +, ?, flechas, sol de dibujo): la IA los deforma incluso en la segunda vuelta. Esos se quedan como íconos vectoriales pintados, sin mancha.
- **Los fajos de billetes se recortan mal** (capas finas): usar la bolsa de dinero o la moneda.
- Lo que más ayudó en la segunda vuelta: describir **la vista** (*"seen from the front"*, *"standing upright"*), **la cantidad exacta** (*"a single…"*, *"four bars"*) y **los materiales** (*"glass with wooden top"*, *"brown leather with stitching"*).

## Lección del 28 de octubre: el estilo "plastilina" se veía de juguete
El usuario no entendió qué era el rollo de la Biblia: parecía un jabón o una toalla. La causa era el sufijo `objeto3d` ("cute 3d clay render, pastel colors"), que convierte todo en juguete.
- **Nuevo estilo `objeto-epico`:** "highly detailed realistic 3d render, physically based materials, rich textures, dramatic studio rim light". El mismo rollo salió con rodillos de madera y pergamino escrito, y se entiende al instante.
- **Nuevo estilo `epico` para escenarios:** "epic cinematic matte painting, dramatic volumetric lighting, god rays, atmospheric haze". Es el look de los Shorts de referencia de la Biblia.
- **Escenarios en vertical** (`--ancho 448 --alto 768`) para Shorts: llenan la pantalla sin recortar, y luego `imagen/nitidez.py` (Real-ESRGAN) los lleva a 1080 de ancho, nítidos.
- **Describir el objeto por sus partes reconocibles:** no "a scroll", sino "two dark carved wooden rollers at both ends, aged yellow parchment with faint columns of ink handwriting". Lo que hace que alguien lo reconozca tiene que estar en el prompt.
- **Revisar siempre que no haya cosas fuera de época:** de 3 templos, uno salió con cúpula dorada y se descartó.
- `objeto3d` (plastilina) queda solo para temas cotidianos y tiernos (hábitos, finanzas del día a día). Para historia, Biblia, misterios y ciencia se usa `objeto-epico`.

## Imágenes sin deformaciones (el usuario lo pidió el 28 oct: "parecen distorsionadas")
SD-Turbo es rápido pero chico: deforma **manos, caras pequeñas, multitudes y cualquier letra**. Reglas:
1. **No pedir lo que deforma:** manos en primer plano, texto o monedas con inscripción, multitudes con caras, varios personajes tocándose. Mejor: objetos, lugares, una sola cara grande de frente, siluetas a media distancia.
2. **Personas y lugares reales → imágenes reales libres** (fotos de época y pinturas de dominio público de Wikimedia Commons o NASA, con `scripts/imagen-libre.py` y su crédito) antes que inventarlas.
3. **4 variantes por toma** en lugar de 2, y se descarta cualquiera con dedos, ojos o letras raras. Si ninguna sirve, se cambia el encuadre, no se acepta.
4. **Probar un modelo mejor y gratis con licencia comercial** cuando la máquina y el disco lo permitan (el disco de la sesión es limitado; FLUX.1-schnell necesita unos 12 GB): comparar lado a lado con SD-Turbo y mostrárselo al usuario antes de cambiar.
5. **Consistencia de personajes:** SD-Turbo no sabe poner a dos personajes descritos en una misma imagen (probado el 28 oct: sale gente cualquiera). Solución: crear **una imagen buena de cada personaje** y reutilizarla:
   - **pantalla partida** (los dos recortes lado a lado, como en `babi03-pregunta-3`);
   - **capas** (recortar con rembg y mover sobre un fondo).
   Nunca pedirle al modelo una escena nueva con el mismo personaje esperando que salga igual.
6. **Cuerpos y objetos fundidos** (el usuario lo vio el 28 oct: "personajes que se sobreponen"): en el chasqui, un sombrero pegado al pecho; en Fleming, soldados fundidos con las camas. Reglas:
   - **una sola figura principal por imagen**, con fondo simple;
   - nada de "un hombre con X en la mano" (el objeto se pega al cuerpo);
   - **antes de elegir, mirar cada imagen en grande** (no solo la hoja chica) buscando cuerpos que se juntan, miembros de más y objetos pegados; si aparece, se descarta.

## Sistema de 4 capas (guía que pasó el usuario el 28 oct) adaptado a nuestras herramientas
1. **Personaje** (edad + rasgos fijos + ropa con material y color + pose) · 2. **Objeto** (solo si hay; material, estado, dónde está) · 3. **Lugar** (sitio + hora + clima, "fondo desenfocado, espacio negativo, sin personas extra") · 4. **Acabado** (estilo + luz + lente + calidad).
**Límites de SD-Turbo que cambian la guía:**
- **No acepta lista negativa** ("--no overlapping…"): trabaja sin guía (`guidance_scale=0`). Lo que no queremos se evita **no nombrándolo** y pidiendo lo contrario ("one person only, empty plain background").
- **Solo lee unas 75 palabras-ficha (tokens) del prompt (CLIP de 77):** lo que va al final se pierde. Las capas se escriben **cortas y en orden de importancia** (personaje primero, acabado al final y breve).
**La regla de oro sí se aplica (y es la solución de fondo):** generar por separado:
1. **El personaje solo, sobre fondo blanco liso**, con 4 variantes; elegir uno y guardarlo como **ficha del personaje** (`public/assets/personajes/<historia>-<nombre>.png`, recortado con rembg).
2. **El fondo solo, sin personas** ("empty, no people").
3. **Unirlos en Remotion con `capas`** (el personaje recortado encima del fondo, con sombra suave y el mismo color de luz). Mismo personaje en todas las escenas = consistencia total.
4. Para otras poses o emociones del mismo personaje: **img2img desde su ficha** (fuerza baja, 0,35–0,5), así no cambia la cara.

## Estilos 2D que suben de nivel: manhwa y anime (decidido el 29 oct, con FLUX)
- `--estilo manhwa` (coreano semi-realista) y `--estilo anime` (japonés moderno) en `imagen/generar.py`. Solo con FLUX: SD-Turbo los ensucia.
- **Flujo por historia (4 capas + generar por separado):**
  1. **Ficha de cada personaje** con `--estilo ficha` (cuerpo entero, fondo magenta que se vuelve transparente solo). 4 variantes, elegir 1 y guardarla en `public/assets/personajes/`. Su descripción fija (edad, rasgos, ropa con color y material) se copia igual en todos sus prompts.
  2. **Fondos sin personas** con `--estilo manhwa` o `anime` ("empty scene, no people").
  3. **Escenas con acción** del personaje: misma descripción fija + pose nueva; si la cara cambia, se usa la ficha recortada en `capas` encima del fondo.
  4. Revisar en grande: manos, cuerpos fundidos, letras, que sea el mismo personaje.
- **Dónde se usa:** historias con personajes (leyendas, Biblia sin rostro de Jesús ni de Dios, historia, psicología con personaje fijo). Los temas épicos y de objetos siguen en `epico`.
7. **Control final en tamaño real (lección del 29 oct: la abuela de Inca Kola pasó con dedos fundidos, letras en el vaso y manos de más abajo):** cada imagen elegida se mira **sola y a tamaño completo**, no en la hoja chica. Cualquier mano visible se revisa dedo por dedo; si hay duda, se descarta. En los prompts: "hands out of frame" o "hands resting out of view", y vasos y botellas "plain, no label".
