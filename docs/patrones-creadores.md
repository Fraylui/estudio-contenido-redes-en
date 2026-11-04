# Patrones de los creadores grandes (análisis con datos)

Análisis del 24 de octubre de 2026: los 4 videos más vistos de 8 canales, con su título, su miniatura y los primeros 30 s de lo que dicen (subtítulos).
Canales: MrBeast, CasiCreativo, Aprendiz Financiero, Infonimados, Academia Play, CuriosaMente, Kurzgesagt y Veritasium (de 5 a 112 millones de vistas por video).
Se repite con `scripts/analizar-canales.py <carpeta>`.

## 1. Miniaturas: lo que tienen en común las más vistas
| Patrón | Quién | Cómo lo aplicamos en Khipu |
|---|---|---|
| **Un protagonista enorme** (cara o personaje que ocupa del 40 al 60 % de la imagen) | MrBeast, Infonimados, Veritasium | El personaje o el objeto 3D principal, grande; nunca 4 cosas chicas |
| **Emoción exagerada** en la cara o los ojos | Kurzgesagt (ojos gigantes), CuriosaMente ("¿¡Esto qué es?!"), Aprendiz (cara gritando) | Lucía o Mateo con sorpresa, miedo o cara de dinero al máximo |
| **Conflicto o contraste:** dos que se miran de frente, VS, antes → después | Infonimados (líderes cara a cara), CuriosaMente (boxeadores VS), Aprendiz ("Dormir MAL → BIEN") | Plantilla de miniatura con dos lados y flecha roja |
| **Una imagen rara que pide explicación** | Veritasium (96 millones de pelotas negras), Kurzgesagt (bomba en el fondo del mar, "El Huevo") | Un objeto 3D extraño o fuera de lugar en el centro |
| **De 0 a 4 palabras.** MrBeast casi nunca pone texto; Veritasium usa una frase corta ("This shouldn't exist.") | Todos | Máximo 3 palabras; si la imagen se explica sola, sin texto |
| **Plantilla fija por serie:** se reconoce el canal sin leer | Infonimados (franja roja con el tema), Academia Play (mano dibujando + "EN 17 MINUTOS"), Kurzgesagt (fondo oscuro y neón) | Cada serie de Khipu con su color y su franja |
| **Objetos con cara** (comida, órganos, células) | CasiCreativo, Kurzgesagt | Objetos 3D con ojos y boca (la hormiga ya funciona así) |
| **Colores saturados y alto contraste;** fondo oscuro con neón o fondo muy vivo | Kurzgesagt, CasiCreativo | Fondo liso vivo o negro, y el protagonista con borde |

## 2. Títulos que más se repiten
- **"[Tema enorme] en N minutos"**: Infonimados y Academia Play pasan los 10 a 33 millones con la Segunda Guerra Mundial, la Guerra Fría o la Revolución Francesa. Es una promesa de ahorrar tiempo.
- **"Tu [cosa] cuando [situación]"**: CasiCreativo ("Tu estómago en la cena de Navidad", 42 millones).
- **"¿Qué pasaría si…?"**, a veces con "(Realidad, no fantasía)": Kurzgesagt.
- **"¿Por qué hay [número exacto] [cosa rara]?"**: Veritasium, con 112 millones.
- **"El hombre que [hecho increíble]"**, una historia de una persona: Veritasium.
- **"N hábitos o errores que te mantienen pobre"**, por aversión a la pérdida: Aprendiz Financiero.
- **"Cómo [resultado] sin [dolor] (la mentira sobre [tema])"**: Aprendiz Financiero, 5,4 millones con el mismo tema de nuestro video 2.
- **Dinero en juego exacto**: "$456,000 Squid Game", "$100,000,000 Car Doors" (MrBeast).

## 3. Ganchos verbales: cómo empiezan (los primeros 30 s)
Ninguno saluda. La primera frase es siempre una de estas:
1. **Golpe en segunda persona:** *"Estabas camino a casa cuando moriste."* (Kurzgesagt, "El Huevo"). Mete al espectador en la historia sin explicar nada.
2. **Pregunta enorme + consecuencias que escalan + giro:** *"¿Qué pasaría si detonáramos el arma nuclear más poderosa en el punto más profundo del océano? Tsunamis… terremotos… invierno nuclear… Bueno, casi."* (Kurzgesagt).
3. **Escena con fecha y lugar + chiste sarcástico:** *"Es 1914 y Europa es el centro del mundo… ¿Por qué no hacemos algo noble, como acabar con la pobreza? No. Mejor tengamos una guerra."* (Infonimados).
4. **Sketch con diálogo de personajes, sin intro:** el rey y su ministro hablando de la quiebra (Infonimados); la comida entrando a una discoteca (CasiCreativo).
5. **Personaje con nombre en los primeros 5 s:** *"Aquí tenemos a Esteban, quien a las 7:00 de la mañana golpea con su puño el despertador."* (Aprendiz Financiero).
6. **Anécdota personal que sirve de analogía:** la raqueta para matar mosquitos y luego "te cuento esto porque…" (Aprendiz Financiero).

Y después, **la frase de marca entre los 10 y 15 s:** *"Hoy en Infonimados te contamos…"*.

## 4. Qué hacemos distinto desde el video 4
1. **Miniatura:** un protagonista enorme con emoción exagerada, un contraste o una imagen rara, máximo 3 palabras y la plantilla de color de la serie.
2. **Objetos 3D con cara** como personajes secundarios (la billetera triste, el café travieso).
3. **Gancho:** elegir uno de los 6 tipos de arriba y escribirlo **primero**, antes que el resto del guion. Un chiste sarcástico antes del segundo 20.
4. **"Hoy en Khipu te explico…"** entre los 10 y 15 s.
5. **Nueva serie "La historia de ___ en N minutos"**: la historia es el formato con más vistas del análisis (de 8 a 33 millones por video).
6. Probar de vez en cuando el **sketch con diálogo** (dos personajes que hablan), con la voz cambiando de tono para cada uno.
