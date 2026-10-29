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
