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
  fillStyle: "hachure",
  hachureGap: 9,
  fillWeight: 3.5,
});

export type Cara = "normal" | "feliz" | "triste" | "sorpresa" | "duda" | "preocupada";
export type Brazos = "abajo" | "arriba" | "jarra" | "adelante" | "cabeza" | "menton";

// Monigote de pizarra: cabeza, cuerpo, brazos y piernas. (x, y) es el centro de la cabeza.
export const monigote = (x: number, y: number, { cara = "normal" as Cara, brazos = "abajo" as Brazos, escala = 1, pelo = false } = {}) => {
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
