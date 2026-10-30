# Tablero de producción de Khipu
Se actualiza en cada paso. Una sola cola: primero lo que sale antes, después lo demás. **Un proceso pesado a la vez** (una voz y un generador de imágenes como máximo).

## Publicado y programado
| Fecha | Hora | Contenido | Estado |
|---|---|---|---|
| Mié 28 | 10:00 | Short: chasqui (pescado fresco en los Andes) | ✅ Publicado |
| Mié 28 | 12:00 | Short: Goliat | ✅ Publicado |
| Mié 28 | 16:00 | Short: El Dorado | ✅ Programado |
| Mié 28 | 18:00 | **Largo:** el rescate de Atahualpa | ✅ Programado |
| Mié 28 | 20:00 | Short: 30 monedas | ✅ Programado |

## Cola (en este orden)
1. **Largo del viernes 30, 10:00:** Fleming y la penicilina. Voz de Xiomi y 46 tomas en proceso.
2. **Shorts del jueves 29:** Babilonia (7:00), hiperinflación (12:00), Inca Kola (16:00) y el techo de Cafarnaúm (20:00, con la animación por capas).
3. **Largo del domingo 1, 10:00:** los 4 jinetes del Apocalipsis, con su historia real (guion listo, 50 escenas, ~7 min).
4. **Shorts del viernes 30.**

## Reglas de orden
- Antes de empezar algo nuevo se revisa este tablero, y al terminar se actualiza.
- Si el servidor se reinicia, se relanza la cola (`/tmp/claude-0/hoy.sh`), que sigue donde quedó.
- No se editan los scripts mientras corren.

**Decisión del 29 oct:** no se rehace nada de lo anterior. Lo que ya está en producción (los Shorts del jueves y Fleming) sale como está. **Todo contenido nuevo, desde los Shorts del viernes 30, se hace con el flujo mejorado:** FLUX, manhwa o anime para historias con personajes, ficha de personaje, 4 capas, primer cuadro con cara, sonido en cada escena, silencio en el clímax y nada quieto más de 3 s.

## Programado el 29 oct en la noche (Metricool)
- Vie 30: 7:00 jugada 37 (410749501) · 10:00 Fleming largo · 12:00 bacteria (410749532) · 16:00 Maracanazo (410749566) · **20:00 Jesús nació antes de Cristo** (411345683, primer Short con el personaje; rehecho el 30 oct con boca, acciones y objetos; reemplaza a Balaam, que se quedó sin cuota FLUX).
- Sáb 31: 7:00 y 16:00 recortes · **12:00 Esperó 8 años (Le Gentil)** (411345792, personaje; rehecho el 30 oct) · **20:00 burra de Balaam**: falta, se hace el viernes 19:07 con la cuota nueva.
- Dom 1: 10:00 «Tú en el ejército romano» (largo-legionario: guion y voz listos, 7:58; faltan 20 fondos con la cuota del viernes) + recortes 7:00 y 16:00.

## Cola para la cuota del viernes 30 (19:07 Lima), en este orden
1. short-burra-balaam (2D, ~10 fondos) → sábado 20:00.
2. short-dia-de-muertos (2D, 6 fondos, voz lista) → domingo 12:00.
3. largo-legionario (2D, 20 fondos, voz lista, compañeros y objetos) → domingo 10:00. Título: «Cómo era ser soldado romano: de recluta a centurión» (lo más buscado). 3 miniaturas con MiniaturaKhipu.
4. Si sobra cuota: prueba de escenas con monitos dibujados por FLUX (4 imágenes) para mostrar al usuario.
Domingo 20:00 (Biblia) y lunes: pendientes de tema (buscar-pegados).
