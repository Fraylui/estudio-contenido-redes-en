# Prompts para crear las imágenes con Meta AI

Copia cada prompt completo en Meta AI. Todas las imágenes de personajes y objetos van **sobre fondo magenta plano**, así yo quito el fondo automáticamente.

## Reglas para que salgan bien

1. **Siempre el mismo bloque de personaje.** Pega el bloque BASE al inicio de cada prompt de pose, así sale siempre la misma chica.
2. **Mejor aún:** sube la imagen original a Meta AI y pide *"same character, same outfit, same style"* + la pose. Así se parece más.
3. **Nada rosado ni morado** en el personaje ni en los objetos: el magenta se borraría junto con ellos. Para objetos rosados (como la alcancía) usa el fondo verde que indico.
4. **Sin texto ni letras** dentro de la imagen: los textos los pongo yo en el video.
5. **Personaje de cuerpo entero, centrado**, sin sombra en el piso.
6. Nombra los archivos como en la lista (por ejemplo `xiomi-pensando.png`) y pásamelos todos juntos.

---

## Bloque BASE del personaje (va al inicio de cada pose)

```
Anime illustration, soft cel shading, clean thin black outlines, warm natural colors, Studio Ghibli inspired.
Young Latina woman, 25 years old, long wavy chestnut-brown hair with bangs, brown eyes, friendly face,
beige blazer, white ruffled high-neck blouse, light-blue denim mini skirt, white sneakers.
Full body, centered, on a solid flat magenta background (#FF00FF), no shadow on the floor, no text.
```

## 1. Poses y emociones de la narradora (las más importantes)

| Archivo | Prompt (después del bloque BASE) |
|---|---|
| `xiomi-normal.png` | standing, hands together in front, gentle smile |
| `xiomi-explicando.png` | explaining, one hand raised with open palm, talking, friendly |
| `xiomi-senalando.png` | pointing to the right side with her index finger, confident smile |
| `xiomi-pensando.png` | thinking, hand on chin, eyes looking up, curious |
| `xiomi-sorprendida.png` | very surprised, mouth open, eyes wide, hands on cheeks |
| `xiomi-preocupada.png` | worried, eyebrows up, biting lip, hands clasped near chest |
| `xiomi-feliz.png` | very happy, big smile, giving a thumbs up |
| `xiomi-triste.png` | sad, looking down, shoulders slumped |
| `xiomi-enojada.png` | annoyed, arms crossed, frowning, puffed cheeks |
| `xiomi-riendo.png` | laughing out loud, eyes closed, hand over mouth |
| `xiomi-contando.png` | counting on her fingers, showing three fingers, explaining |
| `xiomi-encogida.png` | shrugging, palms up, confused expression |
| `xiomi-facepalm.png` | facepalm, hand covering her face, embarrassed |
| `xiomi-celebrando.png` | jumping and celebrating, both arms up, very happy |
| `xiomi-cansada.png` | very tired, dark circles, yawning, slouching |
| `xiomi-idea.png` | had a great idea, index finger up, excited eyes |
| `xiomi-alto.png` | stop gesture, palm facing the viewer, serious face |

## 2. Poses con objetos (para historias)

| Archivo | Prompt (después del bloque BASE) |
|---|---|
| `xiomi-celular.png` | looking at her smartphone, scrolling, absorbed |
| `xiomi-dinero.png` | holding a fan of paper money bills, smiling |
| `xiomi-sin-dinero.png` | holding an open empty wallet, sad |
| `xiomi-compras.png` | carrying many shopping bags, happy |
| `xiomi-libro.png` | reading an open book, focused |
| `xiomi-laptop.png` | sitting on a chair working on a laptop on her lap |
| `xiomi-reloj.png` | looking at her wristwatch, stressed, in a hurry |
| `xiomi-cafe.png` | holding a coffee cup with both hands, relaxed |

## 3. Personajes secundarios (mismo estilo)

Cambia solo la descripción de la persona; mantén el estilo y el fondo:

```
Anime illustration, soft cel shading, clean thin black outlines, warm natural colors, Studio Ghibli inspired.
[DESCRIPCIÓN], full body, centered, on a solid flat magenta background (#FF00FF), no shadow on the floor, no text.
```

| Archivo | DESCRIPCIÓN |
|---|---|
| `amigo-normal.png` | young Latino man, 27, short black hair, green hoodie, jeans, gray sneakers, relaxed smile |
| `amigo-confundido.png` | same young man, scratching his head, confused |
| `jefe.png` | middle-aged man, gray suit, tie, glasses, serious face, arms crossed |
| `abuela.png` | kind Andean grandmother, gray braids, colorful shawl in green and orange, warm smile |
| `nino.png` | 8-year-old boy, yellow t-shirt, shorts, backpack, curious face |

## 4. Objetos sueltos

```
Anime illustration style, clean thin black outlines, soft cel shading, single object,
[OBJETO], centered, on a solid flat magenta background (#FF00FF), no shadow, no text.
```

| Archivo | OBJETO |
|---|---|
| `obj-billetes.png` | a stack of paper money bills |
| `obj-monedas.png` | a pile of gold coins |
| `obj-billetera.png` | a brown leather wallet |
| `obj-tarjeta.png` | a blue credit card |
| `obj-celular.png` | a modern smartphone with a glowing screen |
| `obj-reloj.png` | a round alarm clock |
| `obj-cerebro.png` | a cute cartoon brain (light orange color, not pink) |
| `obj-foco.png` | a glowing yellow light bulb |
| `obj-libro.png` | a closed green book |
| `obj-calendario.png` | a desk calendar |
| `obj-casa.png` | a small cozy house |
| `obj-bolsa-dinero.png` | a money bag |
| `obj-grafico-sube.png` | a green arrow going up |
| `obj-grafico-baja.png` | a red arrow going down |
| `obj-trofeo.png` | a gold trophy |

**Objetos rosados** (cambia el fondo a verde: `solid flat green background (#00FF00)`):
- `obj-alcancia.png`: a pink piggy bank

## 5. Fondos (sin magenta: imagen completa, horizontal 16:9)

```
Anime background art, Studio Ghibli inspired, soft colors, no people, no text, horizontal 16:9, [LUGAR]
```

| Archivo | LUGAR |
|---|---|
| `fondo-cuarto.png` | a cozy bedroom with a desk and a window, daytime |
| `fondo-oficina.png` | a modern bright office |
| `fondo-cocina.png` | a simple warm kitchen |
| `fondo-calle.png` | a colonial Andean town street with white houses and blue doors |
| `fondo-parque.png` | a sunny park with trees |
| `fondo-aula.png` | a classroom with a blackboard |
| `fondo-tienda.png` | a small neighborhood store |
| `fondo-noche.png` | a bedroom at night lit only by a phone screen |

## 6. Caras para miniaturas (primer plano)

Después del bloque BASE, cambia "Full body" por **"Close-up portrait, head and shoulders"**:

| Archivo | Expresión |
|---|---|
| `cara-shock.png` | extremely shocked, eyes huge, mouth wide open |
| `cara-feliz.png` | huge excited smile |
| `cara-duda.png` | skeptical, one eyebrow raised |
| `cara-llorando.png` | crying dramatically, tears |

---

**Orden recomendado:** primero las secciones 1 y 6 (narradora y caras), después 4 (objetos). Con eso ya podemos hacer el primer video.
