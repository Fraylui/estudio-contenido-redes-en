# Plan del nuevo formato (29 oct 2026)
Por qué: los Shorts se ven 3-7 s, los "largos" duraban 3-4 min y las imágenes cambiaban de personaje. Los canales que crecieron en semanas (Ifverse, Gorrito Sobrevive, la mafia por niveles) comparten una fórmula. Ver `como-narran-los-grandes.md` y `mejora-continua.md`.

## 1. Cómo se ve: fondos FLUX + personaje fijo dibujado en código
- **Fondos con FLUX, siempre sin personas** (FLUX falla en personas y no repite caras). Con 1 imagen por fondo, la cuota de ~80 al día alcanza.
- **Protagonista fijo de Khipu, dibujado en Remotion** (como `monigote`/`caricatura` de la skill pizarra): siempre idéntico, con caras, poses y vestuario por época (casco romano, chullo, túnica). Así se acaban las inconsistencias.
- **Una paleta por video** (sepia para historia antigua, azul noche para misterio…), aplicada a los fondos con el prompt y un filtro de color.
- **Un corte cada 2-3 s sin gastar imágenes:** cada fondo se usa varias veces con otro encuadre (zoom, paneo, plano detalle) y otra pose o expresión del personaje.

## 2. Videos largos: serie «Tú en la historia» (miércoles y domingo 10:00, 8-12 min)
- En segunda persona y por escalones (niveles, días, años). Cada escalón tiene un problema, un dilema, una decisión y un precio. Final emocional y una pregunta para comentar.
- Unos 35-45 fondos por video, que se generan el día anterior.
- Si un video llega a 3 veces nuestras vistas normales, se hace la parte 2 esa semana; con 3 partes, «película completa».
- Miniatura: el personaje con una emoción fuerte y 2-3 palabras gigantes.
- Primer video: **«Tú en el ejército romano: de recluta a centurión»** (domingo 1 nov). Los 4 jinetes pasan a la serie Biblia en otra fecha.

## 3. Shorts (12:00 y 20:00 Biblia)
- Tema de `scripts/buscar-pegados.py` + transcripción del video que pegó.
- 25-45 s (una historia en escalera puede llegar a 60 s). Gancho con "tú" en el primer segundo, una imagen nueva cada 2 s, humanizar animales y células, una pregunta al final.
- Recortes de los largos a las 7:00 y 16:00, que llevan al video completo; el usuario los enlaza como "video relacionado".

## 4. Medir cada lunes (Metricool + capturas de Studio)
- Shorts: % "visto vs. deslizado" y segundos promedio. Meta: pasar de 3-7 s a más de 15 s.
- Largos: duración media y % visto. Meta: más de 35 %.
- Lo que funcione se repite (secuela); lo que no, se cambia.

## 5. Orden de trabajo
1. Viernes (cuota de las 19:00): los 4 Shorts del viernes ya en camino + **el personaje fijo de Khipu** en código + fondos de los Shorts del sábado.
2. Sábado: Shorts Le Gentil (12:00) y Jesús histórico (20:00); guion y fondos del ejército romano.
3. Domingo 10:00: «Tú en el ejército romano» + 2-3 recortes para la semana.
