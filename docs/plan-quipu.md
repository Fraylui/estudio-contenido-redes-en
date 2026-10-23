# Plan del canal Khipu (@tu_quipu)

**Nombre:** **Khipu**, como se escribe en quechua (el sistema de cuerdas con nudos de los incas). La voz lo pronuncia "Kípu" (`voz/narrar.py`). El usuario del canal sigue siendo @tu_quipu mientras no se cambie en YouTube.

**Promesa:** "Lo que nadie te explicó, explicado fácil." Videos ilustrados con la voz de Xiomi, de **cualquier tema**. La marca es el nombre y el khipu, no un personaje: cada video usa los personajes y escenarios que pida su historia (el cerebro solo aparece en temas de mente).

## Público
- **Fase 1 (hasta monetizar): solo español.** Personas de 18 a 35 años de Latinoamérica (primero Perú, México, Colombia y Argentina) y de España, que quieren mejorar su dinero, su mente y sus hábitos. Un canal en dos idiomas confunde al algoritmo: no sabe a quién mostrarle los videos.
- **Sin límite de lugar:** los videos son para cualquier hispanohablante del mundo. Por ahora **todo en español** (voz, títulos, descripción y subtítulos); otros idiomas, en la fase 2.
- **Dónde se espera más público** (no es un límite): México (el mayor público), Estados Unidos hispano y España (pagan más por anuncio), Colombia, Argentina, Perú y Chile.
  - Español neutro, sin jerga local.
  - Montos en dólares o sin moneda ("5 al día son 1 800 al año"), salvo un ejemplo local puntual.
  - Ejemplos que sirvan en cualquier país.
  - Publicar a las 4 p. m. de Lima (3 p. m. en México, 5 p. m. en Nueva York).
- **Fase 2 (con el canal monetizado):** inglés como **pista de audio doblada** en los mismos videos (función de audio en varios idiomas de YouTube) o como canal aparte. El público en inglés paga más por anuncio, pero tiene mucha más competencia.

## Regla de publicación
**Todo se publica PÚBLICO**: el objetivo es monetizar. En Metricool, `privacy: "public"`, categoría Educación, no hecho para niños y voz con IA declarada.

## Temas: sin límites
Khipu habla de **todo**: historias, lugares, curiosidades, viajes y visitas, dinero, tecnología, amor, emociones, ciencia, salud, historia, misterios… Lo que une a los videos no es el tema sino la **forma**: contado fácil, bien investigado y muy visual.

Para que YouTube aprenda a quién mostrar cada video y la gente vea uno tras otro, cada tema va en una **serie con su lista de reproducción**. Se pueden abrir series nuevas cuando haga falta:

| Serie | Temas | Formato de título |
|---|---|---|
| **Historias que no conocías** | Historias reales, personajes, hechos | "La historia de ___" |
| **Lugares increíbles** | Lugares del Perú y del mundo, visitas, viajes | "El lugar donde ___" |
| **¿Por qué…?** | Curiosidades del cuerpo, el mundo, la ciencia | "¿Por qué ___?" |
| **Dinero simple** | Ahorro, deudas, inversiones | "El método ___ para ___" |
| **Tecnología explicada** | Apps, IA, inventos, cómo funciona | "Cómo funciona ___" |
| **Tu mente y tus emociones** | Psicología, hábitos, amor, relaciones | "Por qué sientes ___" |
| **Misterios** | Enigmas, casos sin resolver, leyendas | "El misterio de ___" |

**Regla de crecimiento:** se rotan las series, pero se repite más la que mejor funcione en las estadísticas (la revisión de cada lunes lo decide).

## Ritmo semanal

- **Martes:** video largo (de 4 a 8 min; desde 8 min se pueden poner anuncios a mitad del video).
- **Viernes:** video largo de otra serie.
- **Lunes, miércoles y sábado:** un Short sacado de los videos largos (de 30 a 50 s, con el mejor tramo y "video completo en el canal").
- **Hora:** de 6 a 8 p. m., hora de Lima. Después de 2 o 3 semanas, ajustarla con los datos de Metricool.

## Primeros 8 videos

| # | Serie | Título | Texto de la miniatura | Gancho (primeros 5 s) |
|---|---|---|---|---|
| 1 | Dinero simple | El método japonés para ahorrar dinero sin sufrir (Kakeibo) | AHORRA COMO **JAPONÉS** | "Llega fin de mes y tu billetera está así." ✅ |
| 2 | Tu cerebro cuando… | Tu cerebro cuando procrastinas (y cómo engañarlo) | MAÑANA **LO HAGO** | "Dijiste 'mañana lo hago'… hace tres semanas." |
| 3 | ¿Por qué…? | ¿Por qué el tiempo pasa más rápido cuando creces? | ¿EL TIEMPO **SE ACELERA**? | "¿Sientes que diciembre llegó otra vez demasiado rápido?" |
| 4 | Tu cerebro cuando… | Tu cerebro cuando te enamoras | AMOR = **QUÍMICA** | "Enamorarte se parece más a una droga de lo que crees." |
| 5 | Dinero simple | Los gastos hormiga que te dejan pobre | 5 SOLES **AL DÍA** | "Cinco soles al día parecen nada. Al año son mil ochocientos." |
| 6 | ¿Por qué…? | ¿Por qué bostezamos (y es contagioso)? | NO **BOSTECES** | "Seguro vas a bostezar antes de que termine este video." |
| 7 | Tu cerebro cuando… | Tu cerebro cuando usas el celular antes de dormir | 1 HORA **MENOS** | "Tu celular te está robando una hora de sueño cada noche." |
| 8 | Dinero simple | La regla 50/30/20 explicada con tu sueldo | 50 · 30 · **20** | "Si ganas 1 500 soles, esta regla te dice exactamente qué hacer." |

## Cómo se hace cada video (con las skills del proyecto)

1. **Guion** con la estructura de la skill `pizarra`: gancho → historia → explicación → pasos → truco → resultado y reto.
2. **Datos reales:** cada dato con su fuente, sin inventar cifras.
3. **Dibujos:** primero reusar la biblioteca; si falta uno, dibujarlo en el mismo estilo.
4. **Voz:** la referencia clara de Xiomi, con el estilo `narrador` y sin cambiar la velocidad.
5. **Efectos de sonido:** de 8 a 12 por video, solo en momentos clave (skill `video-sfx`).
6. **Miniatura:** `MiniaturaPizarra`, con el personaje o el objeto central del tema y una emoción exagerada, 2 o 3 palabras y una en rojo.
7. **Short:** versión vertical del mejor tramo.
8. **Publicación con Metricool:** solo en YouTube; Educación; voz con IA declarada; capítulos en la descripción.

## Qué medir cada semana (Metricool o YouTube Studio)

- **CTR de la miniatura:** la meta es más del 5 %. Si está por debajo, cambiar la miniatura.
- **Retención a los 30 s:** la meta es más del 60 %. Si está por debajo, el gancho no funcionó.
- **Duración media vista:** la meta es más del 40 % del video.
- **Qué serie trae más suscriptores:** hacer más de esa.

## Meta para monetizar

Para el Programa de Socios de YouTube hacen falta **1 000 suscriptores** y **4 000 horas de reproducción** en 12 meses, o 10 millones de vistas de Shorts en 90 días. Los videos largos de más de 8 minutos ayudan a sumar horas más rápido.
