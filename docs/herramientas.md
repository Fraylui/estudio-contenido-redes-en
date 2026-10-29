# Inventario de herramientas de Khipu: qué podemos hacer y qué no

Estado al 23 de octubre de 2026. ✅ en uso · 🟡 disponible pero sin usar · 🔒 necesita autorización o pago · ❌ no se puede aquí.

## 1. Video y animación
| Herramienta | Capacidad | Estado |
|---|---|---|
| **Remotion 4.0.537** (React → video) | Cualquier animación por código, 1080p y 4K, vertical y horizontal, render por lotes | ✅ Base de todo |
| Skill `remotion-markup` | Curvas spring y bezier, transiciones, **más de 50 efectos** (glow, shine, light leaks, zoom blur, aberración cromática, papel, semitono), **Lottie**, **3D (Three.js)**, resaltados de texto, mapas | 🟡 Usamos poco: hay mucho por explotar |
| `@remotion/transitions` (instalado) | Fundidos, deslizamientos, barridos y overlays entre escenas | 🟡 |
| `@remotion/effects`, `@remotion/lottie` | Efectos de píxel y animaciones Lottie | 🟡 Se instalan con `npx remotion add` |
| `@remotion/captions` + whisper.cpp | Subtítulos palabra por palabra sincronizados con la voz | ✅ En los formatos narrados |
| Formato **Pizarra** (nuestro) | Escenas armadas desde el JSON, personajes vivos, íconos a mano, fondos IA y degradados, etiquetas, ritmo de sonido | ✅ |
| Skill `it-reelsmaker` | Edición de Reels con motion graphics de marca, escenas de gancho, cita, número, lista y cierre, recorte de pausas | 🟡 Útil para Shorts |
| Skill `video-cleanup` | Mejorar audio y video grabado (ruido, eco, poca nitidez), logos y créditos | ✅ Usado en los anuncios |
| Skill `unboxing-editor` | Cortes rápidos de videos de producto | 🟡 Para clientes |
| ffmpeg | Cortar, unir, mezclar, normalizar, convertir | ✅ |

## 2. Voz y audio
| Herramienta | Capacidad | Estado |
|---|---|---|
| **Chatterbox** (skill `voz-narradora`) | Voz clonada de Xiomi en español latino, 12 estilos, pronunciación, revisión con Whisper | ✅ Lento: ~8 s de cálculo por cada segundo de voz |
| `ecualizar.py` | Ecualización automática a calidad de locución, −14 LUFS | ✅ |
| Whisper (faster-whisper y whisper.cpp) | Transcripción, revisión de la voz, tiempos por palabra | ✅ |
| DeepFilterNet | Quitar ruido de voces grabadas | ✅ Solo voz humana |
| Skill `video-sfx` (14 efectos) | Whoosh, pop, ding, boom, magic reveal, caja registradora… | ✅ |
| Música de fondo | Generar música original | 🔒 Abracadabrax (créditos) |
| **Música gratis y monetizable** | La bajo yo: **Mixkit** (licencia libre, sin atribución) e **Incompetech** de Kevin MacLeod (CC BY: se pone el crédito en la descripción). La bajas tú: **Biblioteca de audio de YouTube** (la más segura para monetizar). Con cuidado: Free Music Archive, solo CC BY o CC0, nunca "NC" (no comercial) | 🟡 |
| **Música propia con IA local** | Stable Audio Open Small (licencia comunitaria de Stability, gratis bajo 1 M USD al año, como SD-Turbo). Requiere aceptar la licencia en Hugging Face con cuenta gratis | 🟡 Por instalar |
| **Efectos de sonido gratis** | Freesound (filtrar por CC0), Mixkit SFX y el paquete gratuito de Sonniss (GDC) | 🟡 |

## 3. Imágenes y dibujos
| Herramienta | Capacidad | Estado |
|---|---|---|
| **SD-Turbo** (`imagen/generar.py`) | **Escenarios ilustrados muy buenos** con prompts precisos (~1 min cada uno); objetos regulares; personas malas | ✅ Para fondos |
| Dibujo por código (rough.js) | Personajes en caricatura (Mateo, Lucía), mascota cerebro, monigotes, cajas, billetera | ✅ |
| Tabler (5 000 íconos, MIT) | Objetos redibujados a mano | ✅ 72 generados |
| Open Peeps (CC0) | Caras de reacción | ✅ 48 |
| Open Doodles (CC0) | Personas haciendo actividades | 🟡 31 |
| Fluent Emoji (MIT) | Objetos 3D | 🟡 Ya casi no se usan |
| Gemini / Meta AI (los usas tú) | Ilustraciones de máxima calidad con personajes consistentes | 🟡 Cuando necesitemos nivel Infonimados |
| Abracadabrax (imagen y video con IA) | Imágenes y videos con IA de alta calidad | 🔒 Créditos |
| Canva, Figma | Diseño | 🔒 Hay que autorizarlos (y tu Canva Pro es de Educación) |

## 4. Investigación
| Herramienta | Capacidad | Estado |
|---|---|---|
| Búsqueda web | Datos, estudios, tendencias | ✅ |
| `scripts/investigar-youtube.py` | Los videos más vistos de cualquier tema, con vistas y duración | ✅ |
| Lectura de canales y miniaturas | Analizar títulos, miniaturas y formatos de la competencia | ✅ |
| Skill `deep-research` | Investigación profunda con fuentes | 🟡 Para temas complejos |
| Transcribir videos de YouTube (AudioPod, Pepys, transcribe.so) | Analizar guiones de otros canales | 🔒 Autorización |

## 5. Publicar y medir
| Herramienta | Capacidad | Estado |
|---|---|---|
| **Metricool** (marca "Ecos del Camino", con YouTube Khipu y Facebook) | Programar en YouTube, Facebook, Instagram y TikTok; **mejor hora para publicar**; **estadísticas** | ✅ Publica · 🟡 Estadísticas y mejor hora |
| Rama `publicaciones` en GitHub | Link público para que Metricool baje los videos | ✅ |
| Tareas programadas | Revisiones automáticas (publicación, mejoras semanales) | ✅ |

## 6. Límites reales
- **Sin tarjeta gráfica:** la voz tarda ~1 h por cada 5 min de video; no hay IA de imagen a video ni modelos de imagen grandes.
- **No hay acceso directo a YouTube Studio:** la privacidad, las miniaturas y las pruebas A/B las cambias tú; la programación va por Metricool.
- **Meta AI y Gemini no tienen conexión aquí:** se usan desde tu celular.

## Lo que más nos falta explotar (por impacto)
1. **Efectos de `remotion-markup`:** light leaks entre secciones, glow y shine en datos, resaltados animados, Lottie (confeti, flechas, checks).
2. **Estadísticas de Metricool y mejor hora:** decidir con datos.
3. **`it-reelsmaker`:** Shorts más dinámicos a partir de cada video.
4. **Música libre** mezclada con la voz.
5. **Escenarios con IA en cada sección**, más objetos en la mano y globos de diálogo.

## Radar de herramientas gratis (se revisa cada semana con la tarea de aprendizaje)
Regla del usuario: **adaptarnos a cualquier herramienta gratis que dé mejores resultados**. Antes de usarla se revisa su licencia: tiene que permitir uso comercial, porque el canal es para monetizar.

| Herramienta | Para qué | Licencia | Estado |
|---|---|---|---|
| Kokoro-82M | Voces de hombre y mujer en español sin copiar a nadie | Apache 2.0 ✅ | **En uso** desde el 28 oct (`voz/voces.json`) |
| nara_wpe + noisereduce | Quitar eco y ruido a grabaciones de celular | MIT ✅ | **En uso** (`voz/limpiar.py`) |
| Depth Anything V2 Small | Mapa de profundidad para movimiento 2.5D (paralaje) de los escenarios | Apache 2.0 ✅ (solo el modelo Small) | Por probar: siguiente efecto nuevo |
| FLUX.1-schnell | Imágenes mucho más realistas y épicas que SD-Turbo (como los Shorts de referencia) | Apache 2.0 ✅ | Por probar; en CPU es lento: 1 imagen por escena clave |
| Real-ESRGAN | Agrandar las imágenes de SD-Turbo sin que se vean borrosas | BSD ✅ | Por probar |
| RIFE | Movimiento más suave entre cuadros | MIT ✅ | Por probar |
| DeepFilterNet | Mejor reductor de ruido de voz | MIT/Apache ✅ | El modelo oficial está en GitHub y aquí no se puede bajar |
| Wav2Lip, MusicGen, Stable Audio Open | Labios sincronizados, música con IA | ❌ No comercial o con límites | **No usar** |

## Imágenes reales con licencia libre (`scripts/imagen-libre.py`)
Para que se vean cosas **reales**: el lugar como es hoy, un cuadro antiguo, un mapa de época o una foto del espacio. Suman autenticidad, que es lo que YouTube pide a los canales con IA.
- **Wikimedia Commons:** solo dominio público, CC0 o CC BY (con crédito). **CC BY-SA no**, porque obligaría a compartir el video con esa misma licencia. Sirve para pinturas clásicas de escenas bíblicas (casi todas en dominio público), fotos de lugares (Cuarto del Rescate, Qumrán, Guatavita) y mapas antiguos. El 28 oct respondió "demasiadas consultas" (error 429) a este servidor; la herramienta reintenta sola.
- **NASA:** dominio público (funciona). Planetas, nebulosas, la Tierra.
- **Pexels, Pixabay y Unsplash** también permiten uso comercial sin crédito, pero no tienen una forma de buscar desde aquí sin una clave. Se usan si el usuario manda los enlaces.
- **Nunca** imágenes de Google sin revisar su licencia, ni capturas de otros videos o películas.
- Cada imagen descargada se anota en `public/assets/ia/CREDITOS-LIBRES.md`, y su crédito va en la descripción del video.


## Estilos para más adelante (el usuario los aprobó el 28 oct)
- **Manhwa / webtoon semi-realista** (coreano: proporciones humanas, línea limpia, sombras suaves) y **anime moderno** (japonés).
- **Para quién:** series con personajes que vuelven (historias, leyendas, psicología con personaje fijo) y Shorts para el público joven.
- **Lo que falta:** SD-Turbo hace líneas sucias en 2D. Hay que probar un modelo de anime o manhwa **gratis y con licencia que permita uso comercial** (revisar la licencia de cada uno antes de usarlo; muchos son OpenRAIL o "Fair AI Public License" con condiciones), con el sistema de 4 capas: personaje sobre fondo blanco, ficha del personaje, fondo aparte y unión con capas. El disco y la máquina tienen que estar libres (un modelo XL ocupa unos 7 GB).

## FLUX en Cloudflare: límite real (medido el 29 oct)
- El uso gratis diario (10 000 "neuronas") alcanzó para **unas 80 imágenes** de 1024×1024 a 4 pasos, no 170 como decía la calculadora.
- **Se reinicia a las 00:00 UTC = 19:00 de Lima.** Planificar: las imágenes del día siguiente se generan apenas se reinicia.
- Presupuesto por día: 4 Shorts × 10 tomas × 2 variantes = 80 → **no alcanza también para un video largo el mismo día**. El video largo (50 tomas) usa la cuota de otro día, o 1 variante por toma en las de objetos y paisajes.
