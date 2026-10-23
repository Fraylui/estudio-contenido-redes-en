// Dibujos "a mano" para el formato pizarra: rough.js convierte formas simples en trazos temblorosos,
// siempre iguales gracias a la semilla, así el video no cambia entre un render y otro.
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";

export type Trazo = { d: string; stroke: string; strokeWidth: number; fill?: string };

const gen = rough.generator();
const TINTA = "#1f1f1f";
const base: Options = { roughness: 1.1, bowing: 1.2, stroke: TINTA, strokeWidth: 5, seed: 7 };

// Convierte una forma de rough.js en trazos de SVG
const aTrazos = (forma: ReturnType<typeof gen.line>): Trazo[] =>
  gen.toPaths(forma).map((p) => ({ d: p.d, stroke: p.stroke, strokeWidth: p.strokeWidth, fill: p.fill }));

let semilla = 1;
const o = (extra: Options = {}): Options => ({ ...base, seed: semilla++, ...extra });

export const linea = (x1: number, y1: number, x2: number, y2: number, extra?: Options) =>
  aTrazos(gen.line(x1, y1, x2, y2, o(extra)));
export const circulo = (x: number, y: number, diametro: number, extra?: Options) =>
  aTrazos(gen.circle(x, y, diametro, o(extra)));
export const rect = (x: number, y: number, w: number, h: number, extra?: Options) =>
  aTrazos(gen.rectangle(x, y, w, h, o(extra)));
export const camino = (d: string, extra?: Options) => aTrazos(gen.path(d, o(extra)));

// Relleno rayado a mano, como pintado con plumón
export const pintado = (color: string): Options => ({
  fill: color,
  fillStyle: "solid",
});

export type Cara = "normal" | "feliz" | "triste" | "sorpresa" | "duda" | "preocupada";
export type Brazos = "abajo" | "arriba" | "jarra" | "adelante" | "cabeza" | "menton";

// Monigote de pizarra: cabeza, cuerpo, brazos y piernas. (x, y) es el centro de la cabeza.
export const monigote = (x: number, y: number, { cara = "normal" as Cara, brazos = "abajo" as Brazos, escala = 1, pelo = false, mono = false } = {}) => {
  const s = escala;
  const cuello = y + 55 * s;
  const cadera = y + 210 * s;
  const hombro = y + 85 * s;
  const t: Trazo[] = [];
  t.push(...circulo(x, y, 110 * s));
  if (pelo) {
    // Cabello largo de Lucía
    t.push(...camino(`M ${x - 55 * s} ${y - 5 * s} Q ${x - 70 * s} ${y + 60 * s} ${x - 50 * s} ${y + 95 * s}`));
    t.push(...camino(`M ${x + 55 * s} ${y - 5 * s} Q ${x + 70 * s} ${y + 60 * s} ${x + 50 * s} ${y + 95 * s}`));
    t.push(...camino(`M ${x - 50 * s} ${y - 25 * s} Q ${x} ${y - 75 * s} ${x + 50 * s} ${y - 25 * s}`, pintado("#7a4a2a")));
  }
  if (mono) {
    // Moño japonés tradicional (Hani Motoko, 1904)
    t.push(...circulo(x, y - 75 * s, 55 * s, pintado("#2b2b2b")));
    t.push(...camino(`M ${x - 52 * s} ${y - 10 * s} Q ${x} ${y - 70 * s} ${x + 52 * s} ${y - 10 * s}`, pintado("#2b2b2b")));
  }
  t.push(...cuerpoCara(x, y, cara, s));
  t.push(...linea(x, cuello, x, cadera));
  t.push(...linea(x, cadera, x - 45 * s, cadera + 130 * s), ...linea(x, cadera, x + 45 * s, cadera + 130 * s));
  const b = (dx: number, dy: number, ex: number, ey: number) =>
    camino(`M ${x} ${hombro} Q ${x + dx * s} ${hombro + dy * s} ${x + ex * s} ${hombro + ey * s}`);
  const izq = { abajo: [-40, 50, -60, 110], arriba: [-50, -40, -75, -100], jarra: [-55, 30, -10, 95],
    adelante: [-50, 15, -110, 10], cabeza: [-70, -20, -40, -110], menton: [-40, 40, -60, 110] }[brazos];
  const der = { abajo: [40, 50, 60, 110], arriba: [50, -40, 75, -100], jarra: [55, 30, 10, 95],
    adelante: [50, 15, 110, 10], cabeza: [60, 40, 75, 110], menton: [45, 10, 20, -40] }[brazos];
  t.push(...b(izq[0], izq[1], izq[2], izq[3]), ...b(der[0], der[1], der[2], der[3]));
  return t;
};

const cuerpoCara = (x: number, y: number, cara: Cara, s: number): Trazo[] => {
  const ojos = [...circulo(x - 18 * s, y - 8 * s, 9 * s, pintado(TINTA)), ...circulo(x + 18 * s, y - 8 * s, 9 * s, pintado(TINTA))];
  const boca = {
    normal: `M ${x - 15 * s} ${y + 25 * s} Q ${x} ${y + 30 * s} ${x + 15 * s} ${y + 25 * s}`,
    feliz: `M ${x - 22 * s} ${y + 18 * s} Q ${x} ${y + 42 * s} ${x + 22 * s} ${y + 18 * s}`,
    triste: `M ${x - 18 * s} ${y + 32 * s} Q ${x} ${y + 15 * s} ${x + 18 * s} ${y + 32 * s}`,
    sorpresa: "",
    duda: `M ${x - 15 * s} ${y + 28 * s} L ${x + 15 * s} ${y + 22 * s}`,
    preocupada: `M ${x - 18 * s} ${y + 28 * s} Q ${x - 9 * s} ${y + 20 * s} ${x} ${y + 28 * s} Q ${x + 9 * s} ${y + 36 * s} ${x + 18 * s} ${y + 28 * s}`,
  }[cara];
  const t = [...ojos];
  if (cara === "sorpresa") t.push(...circulo(x, y + 28 * s, 22 * s));
  else t.push(...camino(boca));
  if (cara === "preocupada" || cara === "triste") {
    t.push(...linea(x - 30 * s, y - 30 * s, x - 10 * s, y - 24 * s), ...linea(x + 30 * s, y - 30 * s, x + 10 * s, y - 24 * s));
  }
  if (cara === "duda") t.push(...linea(x + 8 * s, y - 32 * s, x + 30 * s, y - 38 * s));
  return t;
};

// Signo de pregunta dibujado
export const pregunta = (x: number, y: number, s = 1) => [
  ...camino(`M ${x - 22 * s} ${y - 20 * s} Q ${x - 20 * s} ${y - 55 * s} ${x} ${y - 55 * s} Q ${x + 25 * s} ${y - 55 * s} ${x + 22 * s} ${y - 28 * s} Q ${x + 18 * s} ${y - 10 * s} ${x} ${y} L ${x} ${y + 15 * s}`, { strokeWidth: 6 }),
  ...circulo(x, y + 38 * s, 8 * s, pintado(TINTA)),
];

// Billetera abierta (vacía si no se indica dinero)
export const billetera = (x: number, y: number, { dinero = false, s = 1 } = {}) => {
  const t = [...rect(x - 80 * s, y - 50 * s, 160 * s, 100 * s, pintado("#8b5a2b")), ...rect(x - 80 * s, y - 20 * s, 160 * s, 12 * s)];
  if (dinero) t.push(...rect(x - 60 * s, y - 85 * s, 120 * s, 50 * s, pintado("#3fa34d")));
  return t;
};

// Billetera abierta y vacía en primer plano, sostenida por dos manos (como la foto de referencia)
export const billeteraAbierta = (x: number, y: number, s = 1) => {
  const P = (px: number, py: number) => `${x + px * s} ${y + py * s}`;
  const cafe = { ...pintado("#6e3b1f"), hachureGap: 7 };
  const interior = { ...pintado("#d29a62"), hachureGap: 11, hachureAngle: 60 };
  return [
    // Interior vacío (el bolsillo de los billetes abierto)
    ...camino(`M ${P(-230, -40)} Q ${P(-110, -95)} ${P(0, -70)} Q ${P(110, -95)} ${P(230, -40)} L ${P(15, 20)} L ${P(-15, 20)} Z`, interior),
    // Pliegue del medio: se ve el fondo vacío
    ...camino(`M ${P(-15, 20)} Q ${P(0, -30)} ${P(0, -70)} Q ${P(0, -30)} ${P(15, 20)}`, { strokeWidth: 4 }),
    // Las dos tapas de cuero
    ...camino(`M ${P(-230, -40)} L ${P(-15, 20)} L ${P(-15, 140)} L ${P(-235, 75)} Z`, cafe),
    ...camino(`M ${P(15, 20)} L ${P(230, -40)} L ${P(235, 75)} L ${P(15, 140)} Z`, cafe),
    // Ranuras de las tarjetas, vacías
    ...linea(x - 210 * s, y - 5 * s, x - 35 * s, y + 45 * s), ...linea(x - 210 * s, y + 25 * s, x - 35 * s, y + 75 * s),
    // Mano izquierda abajo, sosteniendo
    ...camino(`M ${P(-420, 260)} L ${P(-250, 110)} Q ${P(-200, 80)} ${P(-150, 110)} Q ${P(-110, 135)} ${P(-60, 150)} Q ${P(-40, 175)} ${P(-80, 185)} Q ${P(-170, 175)} ${P(-200, 190)} L ${P(-330, 320)}`, pintado("#f1c9a5")),
    // Mano derecha arriba, abriendo la tapa
    ...camino(`M ${P(420, -260)} L ${P(260, -110)} Q ${P(215, -70)} ${P(225, -30)} Q ${P(232, 0)} ${P(255, 0)} Q ${P(285, -10)} ${P(290, -60)} Q ${P(330, -100)} ${P(380, -110)} L ${P(470, -200)}`, pintado("#f1c9a5")),
  ];
};

// Cerebro mascota estilo kawaii (como en DECIDO VIVIR MEJOR o Simio Alpha): rosado, ojos grandes,
// brazos y piernas de palito con zapatillas azules. (x, y) es el centro del cerebro.
export type PoseCerebro = "musculos" | "abajo" | "menton" | "arriba";
export const cerebro = (x: number, y: number, { cara = "feliz" as Cara, pose = "abajo" as PoseCerebro, s = 1 } = {}) => {
  const P = (px: number, py: number) => `${x + px * s} ${y + py * s}`;
  const rosa = pintado("#ff8fab");
  const t: Trazo[] = [
    // Contorno de nube con lóbulos
    ...camino(`M ${P(-150, 30)} C ${P(-190, -10)} ${P(-160, -90)} ${P(-110, -95)} C ${P(-100, -150)} ${P(-20, -160)} ${P(10, -125)}
      C ${P(50, -165)} ${P(130, -150)} ${P(130, -95)} C ${P(185, -85)} ${P(195, 5)} ${P(150, 35)}
      C ${P(170, 90)} ${P(100, 125)} ${P(60, 100)} C ${P(20, 135)} ${P(-60, 130)} ${P(-80, 95)} C ${P(-140, 115)} ${P(-185, 70)} ${P(-150, 30)} Z`, rosa),
    // Pliegues del cerebro
    ...camino(`M ${P(-110, -60)} Q ${P(-80, -40)} ${P(-100, -10)}`, { strokeWidth: 3.5 }),
    ...camino(`M ${P(90, -70)} Q ${P(60, -45)} ${P(95, -20)}`, { strokeWidth: 3.5 }),
    ...camino(`M ${P(0, -120)} Q ${P(-15, -95)} ${P(5, -75)}`, { strokeWidth: 3.5 }),
    ...camino(`M ${P(-120, 60)} Q ${P(-95, 45)} ${P(-75, 70)}`, { strokeWidth: 3.5 }),
    ...camino(`M ${P(120, 50)} Q ${P(95, 40)} ${P(85, 70)}`, { strokeWidth: 3.5 }),
  ];
  // Ojos grandes: blanco con pupila
  const ojo = (ox: number) => [...circulo(x + ox * s, y - 5 * s, 52 * s, pintado("#ffffff")), ...circulo(x + (ox + 4) * s, y - 2 * s, 20 * s, pintado("#1f1f1f"))];
  if (cara === "feliz") {
    t.push(...camino(`M ${P(-55, -5)} Q ${P(-38, -25)} ${P(-20, -5)}`), ...camino(`M ${P(20, -5)} Q ${P(38, -25)} ${P(55, -5)}`));
  } else t.push(...ojo(-38), ...ojo(38));
  t.push(...camino({
    feliz: `M ${P(-25, 30)} Q ${P(0, 55)} ${P(25, 30)}`, normal: `M ${P(-15, 38)} Q ${P(0, 44)} ${P(15, 38)}`,
    triste: `M ${P(-20, 48)} Q ${P(0, 30)} ${P(20, 48)}`, sorpresa: `M ${P(-12, 40)} Q ${P(0, 20)} ${P(12, 40)} Q ${P(0, 60)} ${P(-12, 40)}`,
    duda: `M ${P(-18, 42)} L ${P(18, 36)}`, preocupada: `M ${P(-20, 42)} Q ${P(-10, 34)} ${P(0, 42)} Q ${P(10, 50)} ${P(20, 42)}`,
  }[cara]));
  // Mejillas
  t.push(...circulo(x - 75 * s, y + 30 * s, 24 * s, pintado("#ff5c8a")), ...circulo(x + 75 * s, y + 30 * s, 24 * s, pintado("#ff5c8a")));
  // Brazos según la pose
  const brazos = {
    musculos: [`M ${P(-155, 20)} Q ${P(-230, 10)} ${P(-225, -70)}`, `M ${P(155, 20)} Q ${P(230, 10)} ${P(225, -70)}`],
    abajo: [`M ${P(-150, 40)} Q ${P(-190, 90)} ${P(-185, 150)}`, `M ${P(150, 40)} Q ${P(190, 90)} ${P(185, 150)}`],
    menton: [`M ${P(-150, 40)} Q ${P(-190, 90)} ${P(-185, 150)}`, `M ${P(150, 40)} Q ${P(110, 120)} ${P(40, 70)}`],
    arriba: [`M ${P(-150, -20)} Q ${P(-210, -80)} ${P(-200, -160)}`, `M ${P(150, -20)} Q ${P(210, -80)} ${P(200, -160)}`],
  }[pose];
  t.push(...camino(brazos[0], { strokeWidth: 6 }), ...camino(brazos[1], { strokeWidth: 6 }));
  if (pose === "musculos") {
    // Bíceps marcados
    t.push(...circulo(x - 205 * s, y - 15 * s, 42 * s, rosa), ...circulo(x + 205 * s, y - 15 * s, 42 * s, rosa));
  }
  // Piernas con zapatillas azules
  t.push(...linea(x - 45 * s, y + 110 * s, x - 55 * s, y + 210 * s, { strokeWidth: 6 }), ...linea(x + 45 * s, y + 105 * s, x + 55 * s, y + 210 * s, { strokeWidth: 6 }));
  t.push(...camino(`M ${P(-95, 225)} Q ${P(-95, 195)} ${P(-55, 200)} Q ${P(-30, 205)} ${P(-30, 228)} Z`, pintado("#4d8fe0")));
  t.push(...camino(`M ${P(30, 228)} Q ${P(30, 205)} ${P(55, 200)} Q ${P(95, 195)} ${P(95, 225)} Z`, pintado("#4d8fe0")));
  return t;
};

// Caja de cartón abierta dibujada a mano (las 4 cajas del gasto)
export const caja = (x: number, y: number, s = 1, color = "#e8c48f") => [
  ...rect(x - 120 * s, y - 70 * s, 240 * s, 150 * s, pintado(color)),
  ...camino(`M ${x - 120 * s} ${y - 70 * s} L ${x - 160 * s} ${y - 120 * s}`),
  ...camino(`M ${x + 120 * s} ${y - 70 * s} L ${x + 160 * s} ${y - 120 * s}`),
];

// Polilla que sale de la billetera vacía (el clásico chiste)
export const polilla = (x: number, y: number, s = 1) => [
  ...camino(`M ${x} ${y} Q ${x - 25 * s} ${y - 30 * s} ${x - 35 * s} ${y + 5 * s} Z`, pintado("#9a9a9a")),
  ...camino(`M ${x} ${y} Q ${x + 25 * s} ${y - 30 * s} ${x + 35 * s} ${y + 5 * s} Z`, pintado("#9a9a9a")),
  ...linea(x, y - 8 * s, x, y + 12 * s),
];

// Billete con el signo de soles
export const billete = (x: number, y: number, s = 1, rot = 0) =>
  rect(x - 55 * s, y - 28 * s, 110 * s, 56 * s, { ...pintado("#3fa34d"), seed: 900 + rot });

// Alcancía (chanchito) amarilla para que no se confunda con el rosado de la piel
export const alcancia = (x: number, y: number, s = 1) => [
  ...camino(`M ${x - 110 * s} ${y} C ${x - 110 * s} ${y - 110 * s} ${x + 110 * s} ${y - 110 * s} ${x + 110 * s} ${y} C ${x + 110 * s} ${y + 90 * s} ${x - 110 * s} ${y + 90 * s} ${x - 110 * s} ${y} Z`, pintado("#f6c445")),
  ...rect(x - 30 * s, y - 85 * s, 60 * s, 10 * s, pintado(TINTA)),
  ...circulo(x + 70 * s, y - 20 * s, 10 * s, pintado(TINTA)),
  ...linea(x - 60 * s, y + 70 * s, x - 60 * s, y + 105 * s), ...linea(x + 60 * s, y + 70 * s, x + 60 * s, y + 105 * s),
  ...circulo(x + 120 * s, y + 5 * s, 34 * s, pintado("#f6c445")),
];

// Bandera de Japón
export const japon = (x: number, y: number, s = 1) => [
  ...linea(x - 70 * s, y - 50 * s, x - 70 * s, y + 140 * s, { strokeWidth: 6 }),
  ...rect(x - 70 * s, y - 50 * s, 150 * s, 100 * s),
  ...circulo(x + 5 * s, y, 50 * s, pintado("#d7263d")),
];

// Flechas y destellos de énfasis
export const destellos = (x: number, y: number, s = 1) => [
  ...linea(x, y - 40 * s, x, y - 70 * s), ...linea(x + 30 * s, y - 30 * s, x + 52 * s, y - 52 * s), ...linea(x - 30 * s, y - 30 * s, x - 52 * s, y - 52 * s),
];
