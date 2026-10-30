# Lista de control de cada video (todo lo analizado hasta el 30 oct)
Se revisa ANTES de escribir el guion y OTRA VEZ antes de programar. Viene del análisis de CuriosaMente, Infonimados, Ifverse, Axen, Gorrito Sobrevive, Homo Curioso, la mafia por niveles, las lombrices, Kurzgesagt y Origen en Trazos (detalle en `como-narran-los-grandes.md`), y de nuestros propios datos (`mejora-continua.md`).

## 1. Tema
- [ ] Fechas del año: Todos los Santos y Día de Muertos (1-2 nov), Navidad, Año Nuevo, Semana Santa, fiestas patrias. Publicar 1-3 días antes.
- [ ] Sale de algo que ya pegó (`scripts/buscar-pegados.py` o enlace del usuario) y se leyó su transcripción. Se copia el tema, nunca el guion.
- [ ] Tiene que ver con la vida diaria del espectador o la pone en una situación ("¿Y si…?", "Tú en…", "¿Qué hacían los antiguos cuando…?").
- [ ] Ángulo propio: tema latino, bíblico o dato que los otros no cuentan (no ser otra copia, como Origen en Trazos con 16 suscriptores).
- [ ] Cuando un tema pega (3× nuestras vistas normales): parte 2 esa semana; con 3 partes, "película completa".

## 2. Guion
- [ ] Primer segundo: promesa o dato que choca, con "tú" (nunca un nombre difícil al inicio).
- [ ] Escalera: cada escalón peor, más alto o más raro (niveles, días, desgracias). Un giro cada 10-15 s.
- [ ] Humanizar: animales, células y objetos con emociones de persona.
- [ ] Palabras de hoy para cosas antiguas ("la sensación del momento").
- [ ] Preguntas abiertas a la mitad ("¿podría durar?"); en los largos, "Pero antes de seguir, una pregunta rápida: …".
- [ ] Final que pega en lo personal o con humor, y una pregunta para comentar. Nunca pedir "suscríbete" ni "comenta".
- [ ] Una frase "para mandar" a un amigo.
- [ ] Datos con fuente; lo dudoso no entra. Religión y política neutrales; nunca rostro de Jesús ni de Dios.
- [ ] Shorts: 25-45 s (una historia en escalera hasta 60-70 s). Largos: 8-12 min.

## 3. Imagen (2D, nada realista)
- [ ] Antes de pedir fondos nuevos: `python3 scripts/biblioteca-fondos.py <palabras>` y reusar los 2D que sirvan (lugares genéricos: cielo, mar, desierto, biblioteca). Nunca copiar la misma secuencia de escenas de otro video. Al terminar, regenerar `docs/biblioteca-fondos.md`.
- [ ] Fondos FLUX `fondo2d`: colores vivos, una paleta por video. Solo describir lo que SÍ va (nombrar lo prohibido hace que FLUX lo dibuje) y no nombrar lugares famosos con imagen moderna (Jerusalén, Belén).
- [ ] Protagonista fijo de Khipu con cara, pose y vestuario según el momento, pisando el piso del fondo (que no flote).
- [ ] Escenas con varios personajes o acciones: monitos simples dibujados por FLUX dentro de la escena (en prueba desde el 30 oct).
- [ ] Una imagen nueva cada 2-3 s (mismo fondo, otro encuadre, pose o lado).
- [ ] Revisar cada imagen a tamaño completo: sin letras inventadas, sin cosas de otra época (cúpulas, cruces, uniformes, monedas), sin cuerpos deformes.

### Consistencia visual (pedido del usuario, 30 oct)
- [ ] `"_paleta"` en imagen/tomas/<n>.json: la misma paleta, luz y grosor de contorno en todos los fondos del video (se agrega sola a cada prompt).
- [ ] Mismo lugar = mismo fondo (no generar dos versiones distintas del mismo sitio); la hora del día sigue la historia (no salta de noche a mediodía sin motivo).
- [ ] El personaje siempre igual (código) y del mismo tamaño en la misma escena; los compañeros más chicos (36 %) y sin bufanda-quipu.
- [ ] Objetos de la época: si el personaje lleva lanza en el camino, la sigue llevando en la escena siguiente del mismo lugar.
- [ ] Revisar la hoja completa de fondos junta: si uno desentona en estilo o color, se rehace.

## 4. Sonido
- [ ] Música de Kevin MacLeod distinta en cada video del día, bajo la voz.
- [ ] Golpe de sonido al gancho, silencio en el clímax, ambiente en las escenas de lugar.

## 5. Miniatura y título (largos)
- [ ] Personaje grande con emoción fuerte, 0-3 palabras gigantes, colores vivos, un contraste que se entienda sin leer (peligro/seguridad, antiguo/moderno). 3 versiones para la prueba de YouTube.
- [ ] Título con lo que la gente busca (`python3 scripts/buscar-titulos.py "<tema>"`: sugerencias reales del buscador de YouTube), como pregunta o paradoja ("Si X, ¿por qué Y?").

## 6. Después de publicar
- [ ] 2-3 recortes de cada largo que lleven al video completo; recordar al usuario enlazarlos como "video relacionado".
- [ ] Respuestas a comentarios listas para que el usuario las copie (sobre el tema, cortas, con dato y pregunta).
- [ ] Lunes: retención (meta: Shorts más de 15 s o 40 %; largos más de 35 %) y anotar en `mejora-continua.md`.
