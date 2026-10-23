// Catálogo de dibujos de la pizarra. Cada escena del JSON elige uno por su nombre ("dibujo").
// Las coordenadas son de un lienzo de 1100x1080: la mitad izquierda del video horizontal.
import {
  alcancia, billete, billetera, destellos, japon, monigote, polilla, pregunta, type Trazo,
} from "./trazos";

export const DIBUJOS: Record<string, Trazo[]> = {
  "billetera-vacia": [
    ...monigote(420, 300, { cara: "sorpresa", brazos: "adelante", pelo: true }),
    ...billetera(640, 420),
    ...polilla(690, 280), ...polilla(790, 210, 0.8),
  ],
  "a-donde-se-va": [
    ...monigote(360, 330, { cara: "duda", brazos: "cabeza", pelo: true }),
    ...pregunta(560, 200),
    ...billete(720, 420, 1, 1), ...billete(820, 300, 0.9, 2), ...billete(900, 180, 0.8, 3),
    ...destellos(960, 160, 0.7),
  ],
  "metodo-japones": [
    ...monigote(300, 280, { cara: "feliz", brazos: "arriba", pelo: true }),
    ...alcancia(620, 690),
    ...japon(820, 300),
    ...destellos(620, 560),
  ],
};
