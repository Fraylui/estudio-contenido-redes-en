// Catálogo de dibujos de la pizarra. Cada escena del JSON elige uno por su nombre ("dibujo").
// "trazos": líneas hechas a mano (monigotes, billetera, cajas…) que se dibujan solas.
// "objetos": ilustraciones de public/objetos/ (Fluent Emoji, licencia MIT) con su centro (x, y) y tamaño t.
// "textos": rótulos escritos a mano dentro del dibujo.
// El conjunto se ajusta solo al espacio disponible, así que las coordenadas solo importan entre sí.
import { billeteraAbierta, caja, monigote, type Trazo } from "./trazos";

export type Objeto = { img: string; x: number; y: number; t: number; rot?: number };
export type Rotulo = { texto: string; x: number; y: number; t: number; color?: string; rot?: number };
export type DibujoPizarra = { trazos?: Trazo[]; objetos?: Objeto[]; textos?: Rotulo[] };

const lucia = (x: number, y: number, cara: Parameters<typeof monigote>[2] = {}) => monigote(x, y, { pelo: true, ...cara });
const ROJO = "#d7263d";
const VERDE = "#2e9e4f";

export const DIBUJOS: Record<string, DibujoPizarra> = {
  // --- Gancho ---
  "billetera-vacia": {
    trazos: billeteraAbierta(550, 560),
    objetos: [
      { img: "mosca", x: 540, y: 330, t: 130, rot: -15 },
      { img: "mosca", x: 720, y: 200, t: 105, rot: 20 },
      { img: "mosca", x: 380, y: 180, t: 90, rot: -30 },
    ],
  },
  "a-donde-se-va": {
    trazos: lucia(330, 360, { cara: "duda", brazos: "cabeza" }),
    objetos: [
      { img: "pregunta", x: 540, y: 210, t: 150, rot: 12 },
      { img: "dinero-volando", x: 720, y: 520, t: 170, rot: -10 },
      { img: "dinero-volando", x: 860, y: 340, t: 150, rot: 8 },
      { img: "dinero-volando", x: 980, y: 170, t: 130, rot: -6 },
    ],
  },
  "metodo-japones": {
    trazos: lucia(300, 320, { cara: "feliz", brazos: "arriba" }),
    objetos: [
      { img: "japon", x: 720, y: 260, t: 300 },
      { img: "torii", x: 620, y: 620, t: 200 },
      { img: "bolsa-dinero", x: 860, y: 640, t: 200, rot: 6 },
      { img: "brillos", x: 980, y: 480, t: 110 },
    ],
  },

  // --- La historia de Lucía ---
  "lucia-sueldo": {
    trazos: lucia(400, 330, { cara: "feliz", brazos: "arriba" }),
    objetos: [
      { img: "billete", x: 230, y: 160, t: 140, rot: -20 },
      { img: "billete", x: 580, y: 140, t: 140, rot: 18 },
      { img: "bolsa-dinero", x: 700, y: 560, t: 200 },
      { img: "brillos", x: 640, y: 330, t: 110 },
    ],
    textos: [{ texto: "Lucía", x: 400, y: 790, t: 80 }],
  },
  "lucia-gastos": {
    trazos: lucia(330, 360, { cara: "feliz", brazos: "adelante" }),
    objetos: [
      { img: "cafe", x: 620, y: 200, t: 150, rot: -8 },
      { img: "pizza", x: 820, y: 330, t: 150, rot: 10 },
      { img: "celular-compra", x: 640, y: 520, t: 160 },
      { img: "compras", x: 860, y: 620, t: 190 },
    ],
  },
  "mitad-de-mes": {
    trazos: lucia(330, 360, { cara: "triste", brazos: "abajo" }),
    objetos: [
      { img: "calendario", x: 700, y: 330, t: 230 },
      { img: "equis", x: 760, y: 400, t: 120 },
      { img: "mosca", x: 520, y: 180, t: 90, rot: 20 },
    ],
    textos: [{ texto: "día 15", x: 700, y: 560, t: 70, color: ROJO }],
  },
  "no-sabe": {
    trazos: lucia(330, 360, { cara: "preocupada", brazos: "cabeza" }),
    objetos: [
      { img: "recibo", x: 640, y: 300, t: 170, rot: -12 },
      { img: "recibo", x: 820, y: 420, t: 150, rot: 14 },
      { img: "pregunta", x: 720, y: 150, t: 120 },
    ],
  },

  // --- Qué es el Kakeibo ---
  "motoko-1904": {
    trazos: monigote(330, 360, { mono: true, cara: "normal", brazos: "adelante" }),
    objetos: [
      { img: "cuaderno", x: 620, y: 500, t: 190, rot: -6 },
      { img: "lapiz", x: 720, y: 400, t: 120, rot: 20 },
      { img: "castillo", x: 820, y: 200, t: 200 },
    ],
    textos: [{ texto: "Japón, 1904", x: 600, y: 760, t: 80 }],
  },
  kakeibo: {
    objetos: [
      { img: "cuaderno", x: 500, y: 450, t: 360, rot: -4 },
      { img: "lapiz", x: 760, y: 470, t: 180, rot: 25 },
      { img: "casa", x: 300, y: 250, t: 150 },
    ],
    textos: [{ texto: "Kakeibo", x: 520, y: 760, t: 110 }, { texto: "libro de cuentas del hogar", x: 520, y: 860, t: 60 }],
  },
  "papel-lapiz": {
    objetos: [
      { img: "celular", x: 280, y: 420, t: 230 },
      { img: "equis", x: 280, y: 420, t: 170 },
      { img: "cuaderno", x: 720, y: 420, t: 260 },
      { img: "check", x: 860, y: 270, t: 130 },
    ],
  },
  "a-mano": {
    trazos: lucia(300, 360, { cara: "normal", brazos: "adelante" }),
    objetos: [
      { img: "cuaderno", x: 560, y: 520, t: 190 },
      { img: "lapiz", x: 650, y: 440, t: 110, rot: 20 },
      { img: "cerebro", x: 700, y: 200, t: 180 },
      { img: "brillos", x: 860, y: 140, t: 100 },
    ],
  },

  // --- Las 4 preguntas ---
  "cuatro-preguntas": {
    objetos: [
      { img: "cuaderno", x: 520, y: 470, t: 300 },
      { img: "pregunta", x: 260, y: 220, t: 120, rot: -15 },
      { img: "pregunta", x: 420, y: 160, t: 120, rot: 5 },
      { img: "pregunta", x: 620, y: 160, t: 120, rot: -5 },
      { img: "pregunta", x: 780, y: 220, t: 120, rot: 15 },
    ],
  },
  "pregunta-1": {
    trazos: lucia(320, 360, { cara: "normal", brazos: "jarra" }),
    objetos: [{ img: "bolsa-dinero", x: 700, y: 480, t: 230 }, { img: "moneda", x: 860, y: 600, t: 120 }],
    textos: [{ texto: "1", x: 700, y: 230, t: 200, color: VERDE }],
  },
  "pregunta-2": {
    trazos: lucia(320, 360, { cara: "feliz", brazos: "adelante" }),
    objetos: [{ img: "chancho", x: 700, y: 480, t: 230 }, { img: "moneda", x: 620, y: 300, t: 100, rot: 15 }],
    textos: [{ texto: "2", x: 820, y: 230, t: 200, color: VERDE }],
  },
  "pregunta-3": {
    trazos: lucia(320, 360, { cara: "sorpresa", brazos: "cabeza" }),
    objetos: [{ img: "compras", x: 680, y: 500, t: 210 }, { img: "recibo", x: 860, y: 420, t: 160, rot: 10 }],
    textos: [{ texto: "3", x: 760, y: 220, t: 200, color: VERDE }],
  },
  "pregunta-4": {
    trazos: lucia(320, 360, { cara: "duda", brazos: "menton" }),
    objetos: [{ img: "sube", x: 700, y: 480, t: 230 }, { img: "foco", x: 560, y: 200, t: 140 }],
    textos: [{ texto: "4", x: 840, y: 230, t: 200, color: VERDE }],
  },

  // --- Las 4 cajas ---
  "cuatro-cajas": {
    trazos: [...caja(250, 300), ...caja(650, 300), ...caja(250, 650), ...caja(650, 650)],
    textos: [
      { texto: "1", x: 250, y: 325, t: 90 }, { texto: "2", x: 650, y: 325, t: 90 },
      { texto: "3", x: 250, y: 675, t: 90 }, { texto: "4", x: 650, y: 675, t: 90 },
    ],
  },
  necesidades: {
    trazos: caja(500, 620, 1.6),
    objetos: [{ img: "casa", x: 360, y: 400, t: 170 }, { img: "compras", x: 520, y: 360, t: 160 }, { img: "bus", x: 680, y: 410, t: 160 }],
    textos: [{ texto: "Necesidades", x: 500, y: 660, t: 64 }],
  },
  gustos: {
    trazos: caja(500, 620, 1.6, "#f2b5a0"),
    objetos: [{ img: "pizza", x: 360, y: 400, t: 160 }, { img: "entradas", x: 520, y: 350, t: 160 }, { img: "videojuego", x: 680, y: 410, t: 160 }],
    textos: [{ texto: "Gustos", x: 500, y: 660, t: 70 }],
  },
  cultura: {
    trazos: caja(500, 620, 1.6, "#b9d7a8"),
    objetos: [{ img: "libros", x: 400, y: 380, t: 180 }, { img: "audifonos", x: 620, y: 390, t: 170 }],
    textos: [{ texto: "Cultura", x: 500, y: 660, t: 70 }],
  },
  imprevistos: {
    trazos: caja(500, 620, 1.6, "#bcc8e6"),
    objetos: [{ img: "celular", x: 360, y: 390, t: 160, rot: -18 }, { img: "pastilla", x: 520, y: 360, t: 150 }, { img: "reloj", x: 680, y: 400, t: 150 }],
    textos: [{ texto: "Imprevistos", x: 500, y: 660, t: 64 }],
  },
  "la-mitad": {
    trazos: lucia(300, 360, { cara: "sorpresa", brazos: "cabeza" }),
    objetos: [
      { img: "pizza", x: 620, y: 520, t: 150, rot: -10 }, { img: "cafe", x: 780, y: 560, t: 140 },
      { img: "compras", x: 700, y: 380, t: 160, rot: 8 }, { img: "entradas", x: 880, y: 420, t: 130, rot: -12 },
    ],
    textos: [{ texto: "¡50 %!", x: 760, y: 200, t: 130, color: ROJO }],
  },

  // --- El truco ---
  "lo-necesito": {
    trazos: lucia(300, 360, { cara: "duda", brazos: "menton" }),
    objetos: [{ img: "celular-compra", x: 640, y: 420, t: 230 }, { img: "pregunta", x: 820, y: 220, t: 140, rot: 10 }],
  },
  "24-horas": {
    trazos: lucia(300, 360, { cara: "feliz", brazos: "jarra" }),
    objetos: [{ img: "reloj", x: 680, y: 380, t: 240 }, { img: "check", x: 860, y: 560, t: 130 }],
    textos: [{ texto: "24 h", x: 680, y: 640, t: 110, color: ROJO }],
  },

  // --- Resultado y cierre ---
  ahorrado: {
    trazos: lucia(300, 340, { cara: "feliz", brazos: "arriba" }),
    objetos: [
      { img: "bolsa-dinero", x: 640, y: 520, t: 220 }, { img: "sube", x: 820, y: 330, t: 180 },
      { img: "fiesta", x: 580, y: 200, t: 140, rot: -10 },
    ],
    textos: [{ texto: "mes 3", x: 820, y: 620, t: 80, color: VERDE }],
  },
  mirar: {
    trazos: lucia(300, 360, { cara: "feliz", brazos: "adelante" }),
    objetos: [{ img: "cuaderno", x: 620, y: 470, t: 210 }, { img: "foco", x: 760, y: 220, t: 160 }],
  },
  "esta-semana": {
    objetos: [
      { img: "cuaderno", x: 380, y: 450, t: 280, rot: -5 }, { img: "lapiz", x: 560, y: 470, t: 150, rot: 25 },
      { img: "calendario", x: 780, y: 330, t: 200 }, { img: "check", x: 860, y: 560, t: 130 },
    ],
  },
  suscribete: {
    trazos: lucia(320, 360, { cara: "feliz", brazos: "arriba" }),
    objetos: [{ img: "chancho", x: 700, y: 520, t: 220 }, { img: "brillos", x: 840, y: 330, t: 120 }],
    textos: [{ texto: "¡Suscríbete!", x: 680, y: 220, t: 100, color: ROJO, rot: -6 }],
  },
};
