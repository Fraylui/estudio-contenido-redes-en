# Inventario de herramientas de Quipu: qué podemos hacer y qué no

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
| **Metricool** (marca "Ecos del Camino", con YouTube Quipu y Facebook) | Programar en YouTube, Facebook, Instagram y TikTok; **mejor hora para publicar**; **estadísticas** | ✅ Publica · 🟡 Estadísticas y mejor hora |
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
