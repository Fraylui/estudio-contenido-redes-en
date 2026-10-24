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
