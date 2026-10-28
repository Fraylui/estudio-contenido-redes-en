---
name: voz-narradora
description: Narrar videos con voz clonada (Chatterbox) en español latino y dejar cualquier voz con calidad de locución. Usar cuando haya que generar la voz de un anuncio, Reel o video narrado, clonar la voz de una persona, mejorar o ecualizar una grabación (voz ronca, apagada, con ruido o poco clara), elegir las mejores frases entre varias tomas, o sincronizar las escenas de un anuncio con la narración.
---

# Voz narradora

Todo vive en `voz/` y funciona en procesador, sin tarjeta gráfica. Las grabaciones de referencia (`voz/referencias/*`), el entorno (`voz/.venv`) y las voces generadas (`public/voz/`) **no se suben a GitHub**: el repositorio es público y con una grabación cualquiera puede clonar esa voz. Usa solo voces de personas que dieron su permiso.

## 1. Instalar (una vez)

```bash
./voz/instalar.sh          # crea voz/.venv con Chatterbox, PyTorch CPU y faster-whisper (necesita uv y ffmpeg)
```

La primera narración descarga los modelos de Chatterbox multilingüe y del revisor Whisper (varios GB).

## 2. Preparar la voz de referencia

Pide a la persona **dos lecturas de 12 a 15 s cada una**, en un cuarto sin eco y con el celular a un palmo de la boca:
- una **noticia**, para el tono serio → `voz/referencias/<nombre>.wav`;
- un **cuento infantil**, para el tono alegre → `voz/referencias/<nombre>-alegre.wav`.

Chatterbox copia el timbre **y también el sonido de la grabación**. Por eso la referencia siempre pasa por el ecualizador:

```bash
voz/.venv/bin/python voz/ecualizar.py nota.m4a voz/referencias/xiomi.wav --referencia        # 24 kHz, -18 LUFS
voz/.venv/bin/python voz/ecualizar.py cuento.m4a voz/referencias/xiomi-alegre.wav --referencia
```

**Antes de limpiar, escuchar todo el audio con datos:** `voz/.venv/bin/python scripts/analizar-voz.py nota.opus informe.md` mide cada frase (volumen, voz contra ruido, picos recortados, brillo, eco al final de la frase y confianza de Whisper) y les pone nota. Con eso se decide qué arreglar y qué tramos usar. Caso Sayra (28 oct 2026, nota de WhatsApp hablando bajito):
- el ruido **no** era el problema (voz 36–44 dB sobre el fondo): el reductor de ruido con IA sobraba y podía borrar consonantes;
- lo que fallaba era el **brillo**: de 4 a 6 kHz estaba 50 dB por debajo de los graves (hablar bajito + micrófono del celular) y nada por encima de 9 kHz;
- y unas pocas frases tenían **picos recortados** (hasta 165 en una frase): esas se descartan.
Receta de ingeniero para ese caso: elegir las 3 frases con mejor nota, sin recortes y con caída de cola de más de 30 dB (poco eco); ponerlas en orden, la mejor primero, porque Chatterbox se fija sobre todo en los primeros 10 s; y luego aplicar
`highpass=f=90,adeclip,equalizer=f=250:t=q:w=1:g=-3,equalizer=f=3000:t=q:w=1.2:g=6,highshelf=f=3500:g=10,equalizer=f=5500:t=q:w=1:g=5,lowpass=f=9500,acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:makeup=2,deesser=i=0.3`
y terminar con `ecualizar.py --referencia`. El lowpass a 9,5 kHz evita subir el siseo donde ya no hay voz.
**Si sí hay eco o ruido fuerte** (voz a menos de 30 dB del fondo): `voz/limpiar.py` (adeclip, WPE contra el eco y noisereduce al 75 %) antes de ecualizar. DeepFilterNet sería mejor, pero su modelo oficial está en GitHub y aquí no se puede bajar.

Si la persona mandó una sola grabación larga, transcríbela, busca los tramos y recórtalos con `ffmpeg -ss <inicio> -t <duración>`. Elige tramos sin errores ni repeticiones, porque la referencia también contagia las muletillas.

## 3. Narrar

En el JSON de contenido, dentro de `props`:

```json
"narracion": [
  { "texto": "¡Tu encomienda sale volando al VRAEM!", "estilo": "urgente" },
  { "texto": "Contáctanos al 943 960 656.", "estilo": "vendedor", "pausa": 0.2 }
]
```

Y junto a `props`, si hace falta: `"voz": { "referencia": "voz/referencias/xiomi.wav", "tono": "alegre", "velocidad": 1.1, "pronunciacion": { "Satipo": "Satípo", "SD": "Señor de" } }`.

- `tono`: usa una sola referencia en todo el video. **En anuncios ponlo siempre**: si cada frase cambia de referencia, la voz cambia de una frase a otra y suena a recortes pegados.
- `pausa`: silencio entre frases para todo el video (0,2 s suena fluido en narraciones largas; 0,35 s por defecto).
- `velocidad`: se aplica una sola vez por frase, junto con la del estilo, con rubberband (conserva el timbre). Nunca con `atempo` encima de otro `atempo`: entrecorta la voz.
- Las siglas de cada negocio van en su JSON (`"SD": "Señor de"`), no en `narrar.py`: la misma sigla significa otra cosa en otro cliente.

`npm run lote -- <nombre>` narra (solo si el JSON cambió), revisa cada frase con Whisper, la repite hasta 3 veces si no coincide con el texto y ecualiza el resultado a -14 LUFS. Para narrar sin generar el video: `voz/.venv/bin/python voz/narrar.py contenido/x.json public/voz/x.wav`. También escribe `public/voz/x.json` con el inicio y el fin de cada frase.

| Estilo | Para | Referencia |
|---|---|---|
| `normal` | información neutra | seria |
| `serio` | datos, confianza, garantías | seria |
| `calmado` | cierre tranquilo, explicaciones | seria |
| `triste` | historias, pérdidas, empatía | seria |
| `suspenso` | misterio, "lo que nadie te cuenta" | seria |
| `pregunta` | ganchos con "?" (automático) | seria |
| `feliz` | buenas noticias, logros | alegre |
| `emocion` | sorpresa, revelación | alegre |
| `vendedor` | anuncios, ofertas, llamados a la acción | alegre |
| `urgente` | ganchos de los primeros 3 segundos | alegre |
| `rapido`, `contando` | listas, ritmo de Reels, cuentos | alegre |
| `narrador` | videos largos de pizarra o historias: **un solo estilo en todo el video** suena más fluido | alegre |

**Pronunciación latina (automática en `narrar.py`):**
- seseo: la c ante e/i y la z suenan como s;
- nombres del VRAEM con su acento escrito (Pichári, Kimbíri, Vráem, Kinuapáta…);
- siglas comunes deletreadas (PNP → "pe ene pe");
- "Jr." y "Av." sin pausa;
- celulares dichos cifra por cifra, de tres en tres.

Si un nombre sale mal, agrégalo en `voz.pronunciacion` escrito como se pronuncia, con la tilde donde va el acento. El texto en pantalla no cambia.

## 4. Sincronizar un anuncio con la narración

En `contenido/anuncio-*.json` cada escena puede indicar `"frase": n`, y entonces empieza cuando la voz dice la frase número n. Con `"fraseCambio": m`, su segundo texto (`texto2`) aparece en la frase m. La última escena dura hasta 1 s después de que termina la voz. Los efectos de sonido pueden anclarse a una escena con `"escena": n` (su `segundo` se cuenta desde el inicio de esa escena). Así nadie mide tiempos a mano.

## 5. Mejorar una voz grabada (humana)

1. **Diagnosticar antes de tocar.** Mide la energía por bandas: `voz/.venv/bin/python voz/ecualizar.py grabacion.m4a --medir`. En los celulares, lo típico es que sobren 250–500 Hz (suena ronca o "encajonada") y falten 2–4 kHz (no se entienden las consonantes). Busca también saturación (muestras cerca de 0 dBFS) y el nivel de ruido.
2. **Si hay varias tomas, arma la mejor ("comping").** Transcribe con confianza por palabra (whisper.cpp `-ojf`), alinea cada toma con el guion y quédate, frase por frase, con la de mejor exactitud y confianza. Corta solo en silencios reales: mide la energía cada 10 ms, porque los tiempos de Whisper se corren entre 0,2 y 0,5 s. Pon fundidos de 15 ms y pausas de 0,12 s. Vuelve a transcribir el resultado para comprobar que no quedan palabras repetidas ni cortadas.
3. **Ecualizar:** `voz/.venv/bin/python voz/ecualizar.py grabacion.wav final.wav`. Aplica el filtro de graves, la reducción de ruido suave, la compresión y la ecualización calculada para esa voz (no fija). Después controla las eses y normaliza a -14 LUFS en dos pasadas.
4. **No uses reducción de ruido con IA si la grabación es limpia** (voz más de 30 dB sobre el fondo): no arregla lo ronco y puede borrar consonantes.

## 6. Comprobar antes de entregar

- Sin cortes: `narrar.py` descarta las tomas con silencios totales dentro de la voz (Chatterbox a veces deja agujeros de 40 a 100 ms), suaviza la entrada y la salida de cada frase y pone un fondo de sala muy bajo para que las pausas no caigan a silencio digital.
- Sin soplido de "tele sin señal": la compresión y el volumen final suben el ruido de fondo unos 10 dB. Por eso `narrar.py` pasa al final `expandir`, que baja ese soplido **solo en pausas reales de más de 120 ms** (un expansor que abre y cierra en cada sílaba hace sonar la voz "con agua", como bocina mojada), y recién después pone el fondo de sala (−72 dB, grave). Nunca se pone el fondo de sala antes de ecualizar. Además, `ecualizar.py --sintetica` corta sobre 11 kHz (Chatterbox genera a 24 kHz: ahí solo hay soplido del vocoder) y apunta a 4–8 kHz en −17 dB y a 8–16 kHz en −30 dB, para que la voz no suene áspera. Comprobación: en las pausas el nivel debe quedar por debajo de −65 dB.
- Whisper reconoce el texto completo, sin frases repetidas ni cortadas. Los nombres propios pueden fallar en Whisper sin que suenen mal.
- Las bandas quedan cerca del objetivo de `ecualizar.py`, sobre todo 2–4 kHz.
- El video final mide -14 ±0,5 LUFS con pico de -1 dBFS o menos: `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`.
- Escúchalo con audífonos y pide a la persona que lo confirme. Ni Claude ni Whisper reemplazan un oído humano para juzgar la naturalidad.

## Qué voz va en cada video (hipótesis del 28 oct, se confirma con datos)
| Voz | Va en | Por qué |
|---|---|---|
| **Hombre grave y pausada** (Kokoro "Alex" o "Santa", o un clon de hombre con permiso) | Biblia épica, historia y guerras, misterios, personajes históricos, mundo antiguo | Los Shorts de referencia de la Biblia y de historia usan voz de hombre grave, tipo tráiler: da peso y suspenso |
| **Mujer cálida y cercana** (Xiomi, Sayra) | Hábitos, psicología y emociones, cuerpo y salud, finanzas del día a día, animales, curiosidades de la vida diaria | Suena a alguien que te explica y te acompaña; nuestros 2 Shorts con más vistas (despertar, lunes) iban con Xiomi |
| Cualquiera de las dos | Ciencia, tecnología, lugares, economía | Se prueban las dos y gana la de más % visto |

- **Kokoro** (Apache 2.0, gratis y con uso comercial): `KPipeline(lang_code="e")`, voces `em_alex` y `em_santa` (hombre) y `ef_dora` (mujer). Instalación aparte: `uv venv -p 3.11` + `kokoro soundfile` + `espeak-ng`. Para que suene grave: `speed=0.85` y luego `rubberband=pitch=0.89:formant=preserved`.
- **Truco:** la salida de Kokoro sirve como referencia de Chatterbox (`voz/referencias/kokoro-alex.wav`). Así la voz de hombre gana la expresión de Chatterbox sin copiar a ninguna persona real.
- Cada voz se mide con el marcador de `docs/mejora-continua.md` (% visto) antes de volverla fija para una categoría.
