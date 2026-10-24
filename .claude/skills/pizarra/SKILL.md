---
name: pizarra
description: Producción técnica de los videos animados 2D de Khipu (largos y Shorts) con Remotion - escenas desde un JSON sincronizadas con la voz, personajes que se mueven y hablan, íconos ilustrados, objetos y escenarios hechos con IA, mapas animados, barras, silueta, paneo, partículas, sonido ambiente, biblioteca de 334 efectos, música por tema, subtítulos estilo CapCut, título gancho en Shorts y miniaturas. Usar al armar, revisar, renderizar o publicar cualquier video o Short del canal, o al agregar dibujos y efectos a la biblioteca.
---

# Producción de videos de Khipu (formato pizarra animada)

El formato vive en `src/formatos/pizarra/` y cada video es un `contenido/pizarra-*.json`. Se genera con:

```bash
npm run lote -- pizarra-<nombre> --horizontal     # narra con voz-narradora y renderiza 1920x1080
```

**La estrategia del canal (temas, frecuencia, duración, ganchos, retención, métricas y lo que podemos hacer) está en la skill `khipu-canal`.** **Cada video cumple la lista completa de `docs/receta-video.md`** (idea, empaquetado, investigación, guion, visual, sonido, revisión, publicación y aprendizaje). Lo de abajo es el detalle técnico.

## 0. Investigar antes de escribir (obligatorio)

1. **Qué ya funciona en YouTube:** `python3 scripts/investigar-youtube.py "<tema>"` muestra los videos más vistos del tema, con su canal, vistas y duración. Anota qué títulos, duraciones y promesas se repiten, y busca el **ángulo que nadie cubrió**.
2. **Datos verificados:** investiga el tema con búsqueda web, o con la skill `anthropic-skills:deep-research` si es complejo. Usa solo fuentes confiables (estudios, universidades, organismos de salud, medios serios). Cada dato del guion debe tener su fuente, y las fuentes van en la descripción del video. Nada de cifras inventadas ni consejos "de moda" sin respaldo.
3. **Psicología de la atención:** arma el video con el mapa de `docs/psicologia-atencion.md` (brecha de curiosidad, bucles abiertos, lo que está en juego, identificación, contraste, recompensa antes del segundo 45). Revisa también `docs/empaquetado.md` para la miniatura y el título.
4. **Monetización:** cumple `docs/monetizacion.md`: guion propio con fuentes, escenas hechas para el tema, 8 a 12 minutos y nada que parezca plantilla repetida (contenido no auténtico).
5. **Patrones de los grandes:** aplica `docs/patrones-creadores.md` (miniatura con protagonista enorme y contraste, uno de los 6 tipos de gancho verbal, "Hoy en Khipu te explico…" entre los 10 y 15 s). Cada mes, vuelve a correr `scripts/analizar-canales.py` y actualiza el documento.
6. **Ganchos:** elige un gancho verbal y uno visual de `docs/ganchos.md`, más 2 o 3 ganchos de retención (bucle abierto, "paso N de 5", promesa del final).
7. **Mejora visual:** elige 1 o 2 técnicas nuevas de `docs/mejora-continua.md` para estrenar en este video.

## 1. Primero el guion, después los dibujos

Usa la estructura de los canales que funcionan (de 4 a 8 min; con más de 8 min caben anuncios a mitad del video):

1. **Gancho (0–20 s):** una situación que le pasó a todos ("Llega fin de mes y tu billetera está así").
2. **Historia de una persona común** (Lucía): el problema con ejemplos concretos.
3. **La explicación** (qué es, de dónde sale, con un dato o fecha).
4. **Los pasos o la lista** (4 preguntas, 4 cajas…), un paso por escena.
5. **El truco práctico.**
6. **El resultado**, un reto ("pruébalo esta semana") y el pedido de suscripción.

Una frase de narración = una escena = un dibujo nuevo (de 3 a 6 s). El texto en pantalla es una versión **corta** de lo que se dice, con 1 o 2 palabras en `resaltar`.

## 2. El JSON

```json
{
  "formato": "Pizarra",
  "voz": { "referencia": "voz/referencias/xiomi-clara.wav", "pausa": 0.22 },
  "props": {
    "escenas": [
      { "dibujo": "billetera-vacia", "texto": "Llega fin de mes… y tu billetera está vacía.", "resaltar": "vacía" }
    ],
    "narracion": [
      { "texto": "Llega fin de mes, y tu billetera está así. ¿Te suena?", "estilo": "narrador" }
    ]
  }
}
```

- La escena N dura lo que la frase N de la narración.
- Usa el estilo `narrador` en **todas** las frases y no pongas `velocidad`: cambiar la velocidad le da un tono robótico.
- Sin puntos suspensivos en la narración (en pantalla sí).

### Escenas armadas en el JSON (lo más rápido)

En vez de un nombre, `dibujo` puede describir la escena y se arma sola: un personaje a la izquierda, de 1 a 4 íconos a mano a la derecha y un rótulo.

```json
{ "dibujo": { "personaje": "peep:mateo-cansada", "iconos": [["alarm", "#ffadad"], ["bed"]], "rotulo": "6:00" },
  "texto": "Suena la alarma… y la apagas.", "resaltar": "apagas" }
```

- `personaje`: `peep:<persona>-<emoción>`, `cerebro:<cara>:<pose>`, `monigote:<cara>:<brazos>`, `lucia:<cara>:<brazos>`, o nada (solo íconos, centrados).
- Íconos que todavía no existen: agrega su nombre en `scripts/generar-iconos.mjs` y corre `node scripts/generar-iconos.mjs`.

## 3. La biblioteca: primero reusar, después dibujar

**Busca siempre primero en lo que ya existe** (`src/formatos/pizarra/dibujos.ts`):

| Qué | Dónde | Cómo se usa |
|---|---|---|
| Escenas ya armadas (billetera vacía, Lucía, 4 cajas, 4 preguntas, mascota cerebro…) | `DIBUJOS` en `dibujos.ts` | `"dibujo": "cerebro-duda"` |
| Monigote a mano con 6 caras y 6 poses de brazos, pelo largo (Lucía) o moño | `monigote()` en `trazos.ts` | trazos |
| **Mascota cerebro kawaii** (feliz, duda, sorpresa, triste; poses `musculos`, `menton`, `arriba`, `abajo`) | `cerebro()` en `trazos.ts` | trazos |
| Billetera abierta con manos, cajas de cartón, signo de pregunta | `trazos.ts` | trazos |
| 39 objetos a color (dinero, monedas, chancho, cuaderno, celular, foco, cerebro, reloj, gráficos, Japón…) | `public/objetos/*.svg` (Fluent Emoji, MIT) | `objetos: [{ img, x, y, t }]` |
| 31 ilustraciones de personas haciendo cosas (leyendo, corriendo, café, abriendo una caja…) | `public/assets/doodles/*.svg` (Open Doodles, CC0) | `objetos` con `img: "doodle:reading"` |
| **Íconos redibujados a mano** con mancha de color (la opción principal para objetos; ver lista en `scripts/generar-iconos.mjs`, se agregan más de los 5 000 de Tabler) | `icono(nombre, x, y, t, color)` en `trazos.ts` | trazos |
| **Caras de reacción Open Peeps** (CC0): Lucía, Mateo y la abuela, con 16 emociones cada uno (feliz, miedo, cansada, enamorada…) | `public/assets/peeps/` (`node scripts/generar-peeps.mjs`) | `objetos` con `img: "peep:lucia-miedo"` |
| Rótulos escritos a mano ("1904", "24 h", "¡50 %!") | `textos: [{ texto, x, y, t, color }]` | textos |

**Si falta algo, dibújalo en el mismo estilo y agrégalo a la biblioteca** para el siguiente video:
- **Trazos a mano** con `linea`, `circulo`, `rect` y `camino` de `trazos.ts` (tinta #1f1f1f, 5 px, rough.js).
- **Rellenos planos** con `pintado(color)`. Paleta: rosa cerebro #ff8fab, piel #f1c9a5, café #6e3b1f, amarillo #f6c445, verde #2e9e4f, rojo #d7263d, azul #4d8fe0.
- **Personajes:** cabeza grande, cuerpo de palito, sin nariz; ojos de punto o, en las mascotas, ojos grandes blancos con pupila.
- Comprueba cada dibujo nuevo con `npx remotion still Pizarra-Horizontal x.png --props=... --frame=N` antes de narrar.

Licencias:
- Fluent Emoji (MIT) y Open Doodles (CC0) se pueden usar en videos comerciales.
- Solo usamos recursos **gratis**: Tabler (MIT), Open Peeps (CC0), Open Doodles (CC0), Fluent Emoji (MIT). Los emojis 3D solo cuando un ícono de línea no alcanza.
- **No subas al repositorio** imágenes de Storyset o Freepik: su licencia no permite redistribuirlas y el repositorio es público.

## 4. Animación (ya resuelta en `Pizarra.tsx`)

- Los trazos se dibujan línea por línea en el primer 60 % de la escena. Los rellenos aparecen junto con su contorno.
- Los objetos y rótulos entran con `spring()` y después flotan apenas.
- El texto aparece palabra por palabra; las de `resaltar` llevan marcador amarillo.
- Zoom lento de cámara y papel arrugado.
- **Ritmo de sonido automático (alta retención):** un whoosh suave en cada cambio de escena (alterna 3 variantes) y un pop bajito, con tono variado, por cada persona, objeto o rótulo que aparece. Va 12 a 13 dB por debajo para no tapar la voz.
- **Golpes clave a mano** (8 a 12 por video) con `"sonido"` y `"sonidoEn"`: `magic_reveal` en revelaciones, `caja_registradora` con dinero, `boom` en datos impactantes, `ding` en conclusiones. Nunca el mismo sonido fuerte seguido.
- **Etiquetas de sección** con `"etiqueta"` en la escena ("La ciencia", "Paso 2 de 5"): se quedan arriba hasta la siguiente, y si dicen "Paso N de M" llevan una barra de progreso.
- **Sacudida de pantalla** automática cuando la escena tiene `"sonido": "boom"`.
- **Estilo moderno (por defecto), como en CapCut o After Effects:**
  - **Fondos degradados vivos** con manchas de color que flotan y viñeta: `cielo`, `durazno`, `menta`, `lila`, `mostaza`, `noche`. Cambian solos en cada sección.
  - **Look sticker:** borde blanco y sombra profunda alrededor de cada dibujo.
  - **Entrada de cada escena con zoom y desenfoque**, como una transición de CapCut.
  - **Subtítulos en negrita** (Montserrat 900, mayúsculas, contorno negro) con rebote palabra por palabra; la palabra clave va más grande en amarillo.
  - Los escenarios de cuarto siguen disponibles: `cuarto-cielo`, `cuarto-menta`, etc. También hay `blanco` y `papel`.
- **Prompts profesionales:** `docs/prompts-profesionales.md` (7 capas: sujeto, lugar y época, encuadre, luz, paleta, estilo y exclusiones).
- **Fondos ilustrados con IA** (`"fondo": "ia:cuarto-amanecer"` → `public/assets/ia/<nombre>.jpg`): el modelo instalado (`imagen/generar.py`) da **escenarios muy buenos** si el prompt es preciso.
  - **Escena:** `--estilo escena --ancho 768 --alto 448 --pasos 4 --variantes 2`. Describe el lugar, la luz, los colores y 3 o 4 objetos concretos (*"cozy bedroom at sunrise, warm golden light through a big window, bed with blue blanket, alarm clock on a nightstand, plants"*). Sin personas: los personajes los ponemos nosotros encima.
  - Elige la mejor variante, escálala a 1920 con lanczos y un poco de nitidez, y guárdala como JPG.
  - En el video va un poco desenfocada y con acercamiento lento, para que el personaje resalte.
  - **No sirve para personas ni para texto.** Para objetos usa `--estilo objeto --sin-fondo` y revísalos antes.
- **Efectos de documental animado** (historia, guerras, países, lugares, Biblia):
  - **Mapa animado:** `"mapa": {"centro": [lon, lat], "zoom": 5, "zoomFinal": 7, "paises": [{"nombre": "Peru", "color": "#ff6464", "en": 0.1}], "rutas": [{"de": [lon, lat], "a": [lon, lat], "en": 0.2}], "etiquetas": [{"texto": "Perú", "lugar": [lon, lat]}], "marcadores": [{"lugar": [lon, lat]}]}`. Reemplaza al fondo; países de Natural Earth con nombre en inglés; zoom 1 es el mundo, 4 un continente y 7 un país. Funciona sin internet.
  - **Paneo lateral:** `"fondo": "ia:<nombre>:paneo"` recorre el escenario de izquierda a derecha.
  - **Revelación por capas:** `"silueta": true` muestra primero la silueta negra y la revela con un destello al 40 % de la escena.
  - **Barras que crecen:** `"barras": [{"etiqueta": "1940", "valor": 7000000}, ...]`, con los números contando.
  - **Sonido ambiente:** `"ambiente": "naturaleza/<efecto>"` (o `historia/…`, `tension/…`), en bucle y muy bajo durante la escena.
  - **Partículas en bucle:** `"particulas": "lluvia" | "polvo" | "chispas" | "nieve" | "brasas"`.
  - **Biblioteca de 334 efectos** (Mixkit, gratis y comercial; `scripts/bajar-sfx.py`): `"sonido": "hooks/big-cinematic-impact"`. Categorías: hooks, transiciones, historia, naturaleza, animacion, tension, tecnologia, dinero y reacciones. La lista está en `public/sfx/biblioteca/catalogo.json`. Jerarquía: la voz siempre clara, la música detrás y los efectos solo donde hay una acción o una revelación; un silencio breve antes del dato fuerte.
  - **Música por tema:** guerra, épica, documental, antiguo (Biblia y civilizaciones), industria, aventura y ambiente (ver `public/musica/CREDITOS.md`).
- **Objetos 3D hechos con IA** (`"iconos": [["img:hormiga"]]` → `public/assets/objetos-ia/hormiga.png`): para los objetos protagonistas del tema.
  - `imagen/.venv/bin/python imagen/generar.py "<objeto con detalles: material, colores, qué tiene encima o adentro>" public/assets/objetos-ia/x.png --estilo objeto3d --sin-fondo --pasos 4 --variantes 3`
  - El prompt describe el objeto **con detalle** (ej.: *"a takeaway coffee cup with a brown cardboard sleeve and a white lid, steam rising"*). El estilo 3D de plastilina y el fondo blanco los pone `objeto3d`.
  - `--sin-fondo` recorta con rembg (IA local). Revisa las variantes y quédate con la mejor (sin letras raras ni objetos de más).
  - Úsalos en 1 de cada 8 a 10 escenas, en los momentos clave y en la miniatura; el resto, íconos ilustrados.
- **Motion graphics de `@remotion/effects`:** destello de luz de color (light leak) al cambiar de sección, automático.
- **Círculo dibujado a mano** alrededor de cada rótulo (números, horas), automático.
- **Confeti** con `"confeti": true` en las escenas de logro o resultado.
- **El cerebro no es la marca ni la mascota del canal:** Khipu trata todos los temas (historias, lugares, curiosidades, dinero, tecnología, emociones…). Cada video usa los personajes y escenarios de su historia: Mateo y Lucía en caricatura (`caricatura:mateo:<ojos>:<boca>:<brazo>`), personajes nuevos cuando hagan falta y escenarios con IA del lugar o la época. El cerebro solo aparece cuando se habla de la mente.
- **Punch-in:** la cámara da un pequeño golpe de zoom cuando aparece la palabra resaltada.
- **Ritmo visual:** algo nuevo aparece cada 1 o 2 s (trazo, objeto, rótulo, palabra), y los dibujos respiran al terminar.

## 5. Antes de narrar

Haz una hoja de contacto con todas las escenas (un `still` por escena a `--scale=0.25`, unidos con `ffmpeg tile`) y revisa:
- que ningún dibujo quede cortado o diminuto;
- que se resalte la palabra correcta;
- que cada dibujo diga lo mismo que la frase.

Narrar un video de 4 minutos toma de 40 a 60 minutos, así que vale la pena revisar antes.

## 5b. Shorts (hoy traen la mayoría de las vistas)
- Se renderizan en vertical (`Pizarra-Vertical`) solo con los tramos elegidos: `--frames=a-b`, calculados con `frasesVoz` (inicio de la frase menos 0,1 s). Se unen con fundidos de 30 ms y se masterizan a −14 LUFS.
- **Siempre con `"gancho"`** en las props: el título fijo arriba en mayúsculas, con la última palabra en rojo ("¿POR QUÉ GASTAS MÁS CON TARJETA?"). En vertical, la etiqueta de sección se oculta cuando hay gancho.
- Una sola idea por Short, de 20 a 40 s; que empiece en la frase más fuerte y termine en la respuesta.
- La descripción lleva "Video completo en el canal: <título>" y el crédito de la música.

## 6. Publicar
Siempre **público** (el canal es para monetizar), con Metricool: solo YouTube, categoría Educación, `madeForKids: false`, `isAiGeneratedContent: true` (voz clonada) y capítulos en la descripción. El video se sube a la rama `publicaciones` del repositorio para que Metricool tenga un link público; nunca los videos de clientes.

**Música de fondo:** en las props, `"musica": "musica/<archivo>.mp3"` (biblioteca y ánimos en `public/musica/CREDITOS.md`; si faltan los MP3, `scripts/bajar-musica.sh`). Se aparta sola cuando habla la voz (20 dB bajo la voz y 14 dB bajo la voz en las pausas; los MP3 quedan a −20 LUFS) y entra y sale con fundido. Elige la música por el ánimo del tema y **pon el crédito de Kevin MacLeod en la descripción** (licencia CC BY 4.0). Nunca uses música con derechos ni licencias "NC" (no comercial).

**Miniaturas:** cada video sale con 3 variantes (`MiniaturaPizarra`). La más fuerte va en `videoThumbnailUrl` de Metricool (PNG en la rama `publicaciones`), así el video ya se publica con miniatura. Metricool no hace pruebas A/B: las otras 2 se le envían al usuario para "Probar y comparar" en YouTube Studio (desde la computadora o Chrome en modo computadora).
