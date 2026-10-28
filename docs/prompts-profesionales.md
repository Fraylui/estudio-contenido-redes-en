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
