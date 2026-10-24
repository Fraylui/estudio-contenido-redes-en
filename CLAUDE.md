# Estudio de contenido: canal Khipu y clientes

Repositorio de producción de videos con Remotion: el canal de YouTube **Khipu** (animación educativa y entretenimiento, en español) y anuncios para clientes.
Al usuario se le habla siempre **en español**, claro y sin tecnicismos.

## Las skills (en `.claude/skills/`)
| Skill | Para qué | Cuándo |
|---|---|---|
| `khipu-canal` | **Estrategia:** líneas temáticas, frecuencia, horas, duración, ganchos, retención, estructuras, métricas, monetización, documental 2D y mapa de capacidades | Planear, elegir temas, decidir horarios, revisar estadísticas |
| `khipu-diario` | **Rutina de cada día:** qué categoría toca, qué se produce, cómo y a qué hora se publica | Cada día de producción y en la tarea programada diaria |
| `khipu-revision` | **Mejorar como un gran creador:** analizar con datos el video anterior y las referencias, metas de ritmo, bucle de prompts y hoja de ruta | Antes de cada video nuevo, después de publicar, o si algo se ve básico |
| `pizarra` | **Producción técnica** de videos largos y Shorts: JSON de escenas, personajes, íconos, objetos 3D, mapas, efectos, música y miniaturas | Al armar y renderizar un video |
| `voz-narradora` | **Voz** de Xiomi (Chatterbox): estilos, pronunciación, calibración, sin soplido ni cortes | Al narrar o arreglar audio |
| `video-sfx` | **Efectos de sonido** del catálogo básico (14) | Anuncios y golpes clave; la biblioteca grande está en `public/sfx/biblioteca/` |

## Documentos (en `docs/`)
- **Cada video:** `receta-video.md` (la lista del 1 al 10).
- **Atención:** `psicologia-atencion.md`, `ganchos.md`, `patrones-creadores.md` (análisis con datos de 8 canales grandes).
- **Empaquetado:** `empaquetado.md` (miniaturas y títulos).
- **Canal:** `plan-quipu.md` (identidad, series, público), `calendario-contenido.md` (los próximos temas), `monetizacion.md`.
- **Imágenes:** `prompts-profesionales.md` (7 capas), `prompts-imagenes.md`.
- **Herramientas:** `herramientas.md` (inventario: qué es gratis y qué no).
- **Aprendizaje:** `mejora-continua.md` (técnicas usadas y datos reales de cada semana), `aprendizajes/` (una ficha por proyecto, hasta lo más mínimo) y `como-trabajan-los-creadores.md` (el método de MrBeast y Kurzgesagt).

## Reglas que nunca cambian
1. **Todo se publica público** en Khipu (el objetivo es monetizar), por Metricool, con la IA declarada (`isAiGeneratedContent: true`).
2. **Solo herramientas y recursos gratis** con licencia comercial: Mixkit, Kevin MacLeod (con crédito), Tabler, Open Peeps y Doodles, Natural Earth, SD-Turbo y rembg. Los créditos de Abracadabrax se gastan solo con permiso explícito.
3. **Datos con fuente**, nunca cifras inventadas; los temas sensibles (política, guerras, religión) se tratan con neutralidad.
4. **Contenido original**: guion propio, escenas hechas para el tema y nada que parezca plantilla repetida (contenido no auténtico).
5. **Archivos de clientes y voces de referencia** nunca se suben (están en `.gitignore`); el repositorio es público. Una voz solo se clona con permiso.
6. Los videos se suben a la rama `publicaciones` (menos de 100 MB) solo para que Metricool los descargue; nunca los de clientes.
7. **Aprender siempre:** cada video estrena algo y deja lecciones en `docs/mejora-continua.md`.
