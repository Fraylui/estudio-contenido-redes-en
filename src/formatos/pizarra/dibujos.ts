// Catálogo de dibujos de la pizarra. Cada escena del JSON elige uno por su nombre ("dibujo").
// "trazos": líneas hechas a mano (monigotes, billetera, cajas…) que se dibujan solas.
// "objetos": ilustraciones de public/objetos/ (Fluent Emoji, licencia MIT) con su centro (x, y) y tamaño t.
// "textos": rótulos escritos a mano dentro del dibujo.
// El conjunto se ajusta solo al espacio disponible, así que las coordenadas solo importan entre sí.
import { z } from "zod";
import { billeteraAbierta, caja, caricatura, cerebro, icono, LUCIA, MATEO, monigote, type BocaCaricatura, type OjosCaricatura, type Brazos, type Cara, type PoseCerebro, type Trazo } from "./trazos";

export type Objeto = { img: string; x: number; y: number; t: number; rot?: number };
export type Rotulo = { texto: string; x: number; y: number; t: number; color?: string; rot?: number };
export type DibujoPizarra = { trazos?: Trazo[]; objetos?: Objeto[]; textos?: Rotulo[] };

const lucia = (x: number, y: number, cara: Parameters<typeof monigote>[2] = {}) => monigote(x, y, { pelo: true, ...cara });
const ROJO = "#d7263d";
const VERDE = "#2e9e4f";

export const DIBUJOS: Record<string, DibujoPizarra> = {
  // --- Prueba de personajes de caricatura ---
  "prueba-caricatura": {
    trazos: [
      ...caricatura(250, 900, { ojos: "dinero", boca: "abierta", brazo: "adelante" }),
      ...caricatura(750, 900, { modelo: LUCIA, ojos: "preocupado", boca: "ondulada", brazo: "cadera" }),
    ],
  },
  "prueba-caricatura-2": {
    trazos: [
      ...caricatura(250, 900, { ojos: "cansado", boca: "chica", brazo: "abajo" }),
      ...caricatura(750, 900, { modelo: LUCIA, ojos: "feliz", boca: "sonrisa", brazo: "arriba" }),
    ],
  },

  // --- Prueba de íconos a mano ---
  "prueba-iconos": {
    trazos: [
      ...icono("pig-money", 150, 150, 220, "#ffd6a5"), ...icono("wallet", 450, 150, 220, "#cdb4db"),
      ...icono("bulb", 750, 150, 220, "#ffe14d"), ...icono("alarm", 150, 450, 220, "#ffadad"),
      ...icono("bed", 450, 450, 220, "#a2d2ff"), ...icono("coffee", 750, 450, 220, "#e9c46a"),
    ],
  },

  // --- Miniaturas ---
  "mini-kakeibo": {
    trazos: cerebro(330, 420, { cara: "sorpresa", pose: "arriba", s: 1.25 }),
    objetos: [
      { img: "japon", x: 720, y: 200, t: 230 },
      { img: "bolsa-dinero", x: 720, y: 560, t: 250, rot: 8 },
      { img: "brillos", x: 860, y: 400, t: 110 },
    ],
  },

  // --- Mascota cerebro (videos de mente y hábitos) ---
  "cerebro-fuerte": { trazos: cerebro(500, 450, { cara: "feliz", pose: "musculos" }) },
  "cerebro-duda": { trazos: cerebro(500, 450, { cara: "duda", pose: "menton" }), objetos: [{ img: "pregunta", x: 780, y: 220, t: 150, rot: 12 }] },
  "cerebro-idea": { trazos: cerebro(500, 450, { cara: "sorpresa", pose: "arriba" }), objetos: [{ img: "foco", x: 820, y: 190, t: 170 }] },
  "cerebro-cansado": { trazos: cerebro(500, 450, { cara: "triste", pose: "abajo" }), objetos: [{ img: "reloj-arena", x: 820, y: 250, t: 150 }] },

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

// Escena armada desde el JSON, sin escribir coordenadas: un personaje a la izquierda, de 1 a 4 íconos a mano
// a la derecha y un rótulo opcional. Así cada video nuevo no necesita tocar este archivo.
//   personaje: "peep:mateo-cansada" · "cerebro:duda:menton" · "monigote:triste:abajo" · "lucia:feliz:arriba"
//   iconos:    [["alarm", "#ffadad"], ["bed"]]   (nombre de Tabler y color de la mancha)
export const composicionSchema = z.object({
  personaje: z.string().optional(),
  iconos: z.array(z.tuple([z.string()]).rest(z.string())).optional(),
  rotulo: z.string().optional(),
  colorRotulo: z.string().optional(),
});
export type Composicion = z.infer<typeof composicionSchema>;

const PASTELES = ["#ffe14d", "#a2d2ff", "#ffadad", "#caffbf", "#ffd6a5", "#cdb4db"];
const POSICIONES: Record<number, [number, number, number][]> = {
  1: [[760, 430, 320]],
  2: [[700, 280, 240], [820, 600, 240]],
  3: [[650, 230, 210], [880, 430, 210], [680, 650, 210]],
  4: [[650, 240, 190], [880, 240, 190], [650, 560, 190], [880, 560, 190]],
};
const POSICIONES_SOLAS: Record<number, [number, number, number][]> = {
  1: [[550, 430, 420]],
  2: [[330, 430, 320], [770, 430, 320]],
  3: [[230, 430, 270], [550, 430, 270], [870, 430, 270]],
  4: [[330, 250, 250], [770, 250, 250], [330, 620, 250], [770, 620, 250]],
};

export const componer = (c: Composicion): DibujoPizarra => {
  const trazos: Trazo[] = [];
  const objetos: Objeto[] = [];
  const textos: Rotulo[] = [];
  const [tipo, a, b] = (c.personaje ?? "").split(":");
  if (tipo === "peep") objetos.push({ img: `peep:${a}`, x: 290, y: 440, t: 480 });
  else if (tipo === "cerebro") trazos.push(...cerebro(290, 430, { cara: (a || "feliz") as Cara, pose: (b || "abajo") as PoseCerebro }));
  else if (tipo === "caricatura") {
    // "caricatura:mateo:dinero:abierta:adelante" → modelo, ojos, boca y brazos
    const [, modelo, ojos, boca, brazo] = (c.personaje ?? "").split(":");
    trazos.push(...caricatura(290, 900, {
      modelo: modelo === "lucia" ? LUCIA : MATEO,
      ojos: (ojos || "normal") as OjosCaricatura, boca: (boca || "sonrisa") as BocaCaricatura,
      brazo: (brazo || "abajo") as "abajo" | "arriba" | "adelante" | "cadera",
    }));
  } else if (tipo === "monigote" || tipo === "lucia") {
    trazos.push(...monigote(290, 300, { cara: (a || "normal") as Cara, brazos: (b || "abajo") as Brazos, pelo: tipo === "lucia" }));
  }
  const iconos = c.iconos ?? [];
  const lugares = (tipo ? POSICIONES : POSICIONES_SOLAS)[Math.min(iconos.length, 4)] ?? [];
  iconos.slice(0, 4).forEach(([nombre, color], i) => {
    const [x, y, t] = lugares[i];
    trazos.push(...icono(nombre, x, y, t, color ?? PASTELES[i % PASTELES.length]));
  });
  if (c.rotulo) {
    textos.push({ texto: c.rotulo, x: tipo ? 760 : 550, y: tipo ? 880 : 860, t: 100, color: c.colorRotulo ?? ROJO });
  }
  return { trazos, objetos, textos };
};

export const resolverDibujo = (d: string | Composicion): DibujoPizarra => (typeof d === "string" ? DIBUJOS[d] ?? {} : componer(d));
