---
name: pizarra
description: Hacer videos de YouTube estilo pizarra o doodle (como DOMINALO, DECIDO VIVIR MEJOR, Aprendiz Financiero o CasiCreativo) con Remotion. Monigotes y una mascota cerebro que se dibujan solos, objetos ilustrados, fondo de papel y texto con marcador amarillo. Usar cuando pidan un video de pizarra, doodle, whiteboard, "como esos canales", explicar un tema con dibujos, una escena con cerebro o monigote, o agregar dibujos nuevos a la biblioteca.
---

# Videos de pizarra

El formato vive en `src/formatos/pizarra/` y cada video es un `contenido/pizarra-*.json`. Se genera con:

```bash
npm run lote -- pizarra-<nombre> --horizontal     # narra con voz-narradora y renderiza 1920x1080
```

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
- **Efectos de sonido solo en momentos clave** (8 a 12 por video), con `"sonido"` y `"sonidoEn"` en la escena, usando el catálogo de la skill video-sfx: `whoosh`, `whoosh_2` y `whoosh_3` al cambiar de sección; `caja_registradora` cuando aparece dinero; `ding` o `magic_reveal` en una revelación; `boom` en un dato impactante. **Nunca un sonido en cada escena**: cansa y se escucha barato.

## 5. Antes de narrar

Haz una hoja de contacto con todas las escenas (un `still` por escena a `--scale=0.25`, unidos con `ffmpeg tile`) y revisa:
- que ningún dibujo quede cortado o diminuto;
- que se resalte la palabra correcta;
- que cada dibujo diga lo mismo que la frase.

Narrar un video de 4 minutos toma de 40 a 60 minutos, así que vale la pena revisar antes.
