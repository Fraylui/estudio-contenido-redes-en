---
name: khipu-revision
description: Cómo Khipu mejora en cada video como un gran creador - analizar con datos el video anterior y los de referencia (ritmo de cortes, duración de planos, gancho, palabras por minuto, volumen) con scripts/analizar-video.py, comparar contra las metas de los canales grandes, decidir 3 mejoras medibles, iterar los prompts de imagen hasta que no se vean básicos y estudiar a detalle cualquier técnica que tomemos de otro canal. Usar antes de empezar cada video nuevo, después de publicar, cuando el usuario diga que algo se ve plano o básico, o al copiar una idea de otro creador.
---

# Revisión y mejora continua (nivel gran creador)

Regla: **nunca repetir lo básico; cada contenido mejora al anterior** (lo pidió el usuario). El marcador está en `docs/mejora-continua.md`: cada contenido tiene su fila y deja 3 mejoras para el siguiente. Antes de cada video nuevo se analiza el anterior con datos, y el nuevo tiene que superarlo en al menos 3 medidas.

## 1. Analizar el video anterior (antes de producir el siguiente)
1. **Medir:** `voz/.venv/bin/python scripts/analizar-video.py <video.mp4> <carpeta>`, que da:
   - cortes por minuto, plano más largo y plano promedio, primer corte;
   - palabras por minuto y la primera frase (el gancho);
   - silencios y volumen;
   - una hoja con los primeros 10 s y el resto del video.
2. **Ver la hoja con ojo de editor:**
   - ¿Hay algo quieto más de 4 s?
   - ¿El primer segundo engancha sin sonido?
   - ¿Se lee el subtítulo?
   - ¿Hay escenas vacías o repetidas?
3. **Comparar con los datos reales:**
   - vistas, retención y "decidió mirar" del video, desde YouTube Studio (capturas del usuario);
   - estadísticas de Metricool (`getAnalyticsDataByMetrics`).
   - Qué hizo distinto el que funcionó: por ejemplo, el Short de 1 000 vistas tenía un personaje con emoción, colores vivos y "Por qué…", y el de pocas vistas, fondo de papel blanco plano.
4. **Escribir 3 mejoras medibles** en `docs/mejora-continua.md` (ejemplo: "de 10 a 20 cortes por minuto", "primer corte antes de 2 s", "todos los objetos protagonistas en 3D").

## 1b. Ficha de aprendizaje de cada proyecto (obligatoria)
Al terminar cada video o Short se llena `docs/aprendizajes/<fecha>-<tema>.md` con la plantilla `docs/aprendizajes/PLANTILLA.md`, y se vuelve a abrir a los 7 días con los datos. Se anota todo, hasta lo más mínimo: qué funcionó, qué falló (detalle, dónde se notó, causa, arreglo), qué costó tiempo y 3 mejoras medibles. Antes de cada proyecto nuevo se leen las últimas 3 fichas.

El método de los grandes (el manual de producción de MrBeast, el proceso de Kurzgesagt) está en `docs/como-trabajan-los-creadores.md`:
- el primer minuto cumple la promesa;
- reenganches en 1/3 y 2/3 del video;
- final de golpe;
- títulos con más fuerza;
- escaleras de datos;
- nunca el mismo formato dos veces seguidas;
- metáforas visuales decididas antes de dibujar;
- componente crítico revisado.

## 2. Metas contra las que se mide todo
| Medida | Shorts | Videos largos |
|---|---|---|
| Cortes o cambios visuales por minuto | 20–40 | 10–20 |
| Plano promedio | 1,5–3 s | 3–5 s |
| Plano más largo | 4 s | 6 s |
| Primer cambio visual | antes de 2 s | antes de 3 s |
| Palabras por minuto | 160–190 | 150–180 |
| Volumen | −14 LUFS | −14 LUFS |
| Objetos protagonistas | 3D con IA | 3D con IA |

**Ritmo ya automático:** las entradas de escena se turnan y hay una segunda toma a la mitad de cada escena de más de 2,6 s. **Datos del 24 de octubre:** nuestro mejor Short tenía 10 cambios por minuto y planos de 5,2 s, la mitad del ritmo de los grandes; la segunda toma lo duplica.

## 3. Bucle de prompts (hasta que no se vea básico)
Para cada escenario u objeto nuevo:
1. Escribir el prompt con las 7 capas de `docs/prompts-profesionales.md`.
2. Generar 2 o 3 variantes.
3. **Criticar cada imagen** con esta lista:
   - ¿letras o símbolos raros?
   - ¿partes deformes?
   - ¿sobran objetos?
   - ¿se lee en un celular?
   - ¿tiene profundidad (frente, medio, fondo)?
   - ¿la paleta es la del tema?
   - ¿combina con el resto del video?
   - ¿parece de un canal profesional o de clip-art?
4. **Corregir el prompt** según el fallo y repetir, hasta 3 vueltas:
   - si salen letras raras, agregar *"no text, no letters"* y sacar la palabra que las provoca (menu, sign, poster);
   - si se ve plano, agregar capas de profundidad, luz con dirección y *"soft shadows, volumetric light"*;
   - si sobran cosas, describir menos objetos y más concretos.
5. **Guardar el prompt ganador** en `imagen/escenarios.json` u `imagen/objetos3d.json`, con la imagen elegida en `public/assets/`.

## 4. Estudiar a detalle lo que tomamos de otro creador
Cuando se toma una idea de otro canal (un gancho, un efecto, un formato), antes de copiarla:
1. **Qué es exactamente:** en qué segundo aparece, cuánto dura, cada cuánto se repite y qué suena al mismo tiempo.
2. **Por qué funciona:** qué emoción o principio de `docs/psicologia-atencion.md` usa.
3. **Medir la referencia:**
   - si el usuario la manda como grabación de pantalla, pasarla por `analizar-video.py`;
   - si no, usar sus miniaturas, títulos y subtítulos (`scripts/analizar-canales.py`). Descargar videos de YouTube está bloqueado aquí.
4. **Cómo adaptarlo a Khipu sin copiarlo:** con nuestros personajes, colores y voz, y para nuestro tema.
5. **Probarlo en una escena**, revisarlo en una imagen fija y recién después usarlo en todo el video.

## 4b. Cuando el usuario pasa un video o una transcripción (todo es para aprender)
El usuario manda videos de otros canales para que Khipu **aprenda a hacer contenido**: cómo cuentan, cómo enganchan y cómo eligen el tema. No es para copiar su formato ni su duración. Con cada uno:
1. **Las técnicas que retienen** (gancho, promesa, misterios abiertos, segunda persona, escenas, diálogo, capítulos, cierre): qué hace y en qué minuto.
2. **Por qué tiene vistas** (tema, empaquetado, duración, tono), aunque tenga errores. Lo que funciona se copia sin miedo.
3. **Lo que no copiamos:** fuentes inventadas y mendigar. Los errores se señalan, pero sin despreciar el video.
4. **Ideas de temas** que salen de él, con nuestro ángulo (lo que no cuenta, o el lado hispano).
5. Todo se anota en `docs/como-narran-los-grandes.md` y en el calendario, y **se aplica en el siguiente guion** (cambiar la skill si hace falta). Al usuario se le responde corto: qué aprendimos y qué cambia.

## 4c. Evolucionar sin parar
Khipu está empezando: todo lo analizado es para evolucionar. Antes de cada video se mira el **plan de evolución** de `docs/mejora-continua.md` y se aplican las 3 mejoras de la etapa en curso. A los 7 días se mide si sirvieron.

## 5. Habilidades que todavía faltan (hoja de ruta, en orden)
Cada contenido estrena algo **visual, sonoro o de efectos**. Las herramientas gratis por probar y su licencia están en el radar de `docs/herramientas.md`; cuando aparezca una mejor, se prueba en una escena y, si mejora el % visto, se adopta.

1. **Boca sincronizada con la voz:** mover la boca con la intensidad del audio de cada frase (se puede: el WAV está en `public/voz/`).
2. **Movimiento 2.5D (paralaje):** separar el escenario en capas con un modelo de profundidad gratis en CPU y mover la cámara entre ellas.
3. **Personajes 3D consistentes:** el mismo personaje en varias poses (semilla y prompt fijos) para miniaturas e historias.
4. **Diseño sonoro automático:** elegir de la biblioteca el ambiente y los golpes según el tema de cada escena.
5. **Final en bucle en los Shorts:** que la última imagen conecte con la primera.
6. **Biblioteca de personajes históricos** (reyes, soldados, campesinos, científicos, profetas) en el estilo de Mateo y Lucía.
