// Catálogo de dibujos de la pizarra. Cada escena del JSON elige uno por su nombre ("dibujo").
// "trazos": líneas hechas a mano (monigotes, billetera…) que se dibujan solas.
// "objetos": ilustraciones de public/objetos/ (Fluent Emoji, licencia MIT) con su centro (x, y) y tamaño t.
// El conjunto se ajusta solo al espacio disponible, así que las coordenadas solo importan entre sí.
import { billeteraAbierta, monigote, type Trazo } from "./trazos";

export type Objeto = { img: string; x: number; y: number; t: number; rot?: number };
export type DibujoPizarra = { trazos?: Trazo[]; objetos?: Objeto[] };

export const DIBUJOS: Record<string, DibujoPizarra> = {
  "billetera-vacia": {
    trazos: billeteraAbierta(550, 560),
    objetos: [
      { img: "mosca", x: 540, y: 330, t: 130, rot: -15 },
      { img: "mosca", x: 720, y: 200, t: 105, rot: 20 },
      { img: "mosca", x: 380, y: 180, t: 90, rot: -30 },
    ],
  },
  "a-donde-se-va": {
    trazos: monigote(330, 360, { cara: "duda", brazos: "cabeza", pelo: true }),
    objetos: [
      { img: "pregunta", x: 540, y: 210, t: 150, rot: 12 },
      { img: "dinero-volando", x: 720, y: 520, t: 170, rot: -10 },
      { img: "dinero-volando", x: 860, y: 340, t: 150, rot: 8 },
      { img: "dinero-volando", x: 980, y: 170, t: 130, rot: -6 },
    ],
  },
  "metodo-japones": {
    trazos: monigote(300, 320, { cara: "feliz", brazos: "arriba", pelo: true }),
    objetos: [
      { img: "japon", x: 720, y: 260, t: 300 },
      { img: "torii", x: 620, y: 620, t: 200 },
      { img: "bolsa-dinero", x: 860, y: 640, t: 200, rot: 6 },
      { img: "brillos", x: 980, y: 480, t: 110 },
    ],
  },
};
