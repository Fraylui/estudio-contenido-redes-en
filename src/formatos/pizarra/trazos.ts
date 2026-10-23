// Dibujos "a mano" para el formato pizarra: rough.js convierte formas simples en trazos temblorosos,
// siempre iguales gracias a la semilla, así el video no cambia entre un render y otro.
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";
import svgpath from "svgpath";
import { ICONOS } from "./iconos.gen";

// "parte" marca a qué parte del personaje pertenece el trazo (cabeza, ojos, boca, brazo-izq, brazo-der),
// para animarlas por separado: parpadeo, cabeza que se inclina, brazos que gesticulan
export type Trazo = { d: string; stroke: string; strokeWidth: number; fill?: string; parte?: string };
const parte = (trazos: Trazo[], nombre: string) => trazos.map((t) => ({ ...t, parte: nombre }));

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
  } else t.push(...parte([...ojo(-38), ...ojo(38)], "ojos"));
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
  t.push(...parte(camino(brazos[0], { strokeWidth: 6 }), "brazo-izq"), ...parte(camino(brazos[1], { strokeWidth: 6 }), "brazo-der"));
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

// Quipu inca: cuerda principal con cuerdas de colores colgando y sus nudos (identidad del canal "Quipu")
export const quipu = (x1: number, x2: number, y: number, { largo = 220, colores = ["#d7263d", "#f6c445", "#2e9e4f", "#4d8fe0", "#ff8fab", "#8b5a2b"] } = {}) => {
  const t: Trazo[] = [...camino(`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y + 25} ${x2} ${y}`, { strokeWidth: 8, stroke: "#6e3b1f" })];
  const n = Math.max(3, Math.round((x2 - x1) / 45));
  for (let i = 1; i < n; i++) {
    const x = x1 + ((x2 - x1) * i) / n;
    const color = colores[i % colores.length];
    const l = largo * (0.7 + ((i * 37) % 30) / 100);
    const yc = y + 12 * Math.sin((Math.PI * i) / n);
    t.push(...camino(`M ${x} ${yc} Q ${x + 10} ${yc + l / 2} ${x - 4} ${yc + l}`, { strokeWidth: 6, stroke: color }));
    // Nudos: cada cuerda guarda un número
    for (let k = 1; k <= 1 + (i % 3); k++) t.push(...circulo(x + 2, yc + (l * k) / (2 + (i % 3)), 16, pintado(color)));
  }
  return t;
};

// Ícono de línea (Tabler, MIT) redibujado a mano con rough.js, con una mancha de color detrás como si lo
// hubieran pintado con plumón. Así los objetos tienen el mismo trazo que los monigotes y no parecen emojis.
// (x, y) es el centro y t el tamaño; los nombres disponibles están en scripts/generar-iconos.mjs.
export const icono = (nombre: string, x: number, y: number, t: number, color = "#ffe14d") => {
  const k = t / 24;
  const trazos: Trazo[] = [
    ...circulo(x + t * 0.06, y + t * 0.06, t * 0.82, { fill: color, fillStyle: "solid", stroke: "none" }),
  ];
  for (const d of ICONOS[nombre] ?? []) {
    trazos.push(...camino(svgpath(d).scale(k).translate(x - t / 2, y - t / 2).toString(), { strokeWidth: Math.max(4, k * 1.5), roughness: 0.7 }));
  }
  return trazos;
};

// Personaje de caricatura estilo Aprendiz Financiero: contorno negro grueso, colores planos, ojos grandes.
// (x, y) es el punto entre los pies. Ropa, pelo y piel se pueden cambiar para tener varios personajes fijos.
export type OjosCaricatura = "normal" | "dinero" | "cansado" | "sorpresa" | "feliz" | "preocupado";
export type BocaCaricatura = "sonrisa" | "abierta" | "chica" | "ondulada" | "o";
export type ModeloCaricatura = { piel: string; pelo: string; polo: string; pantalon: string; zapatos: string; pelo_largo?: boolean };
export const MATEO: ModeloCaricatura = { piel: "#f6c9a0", pelo: "#7a4a2a", polo: "#c0432f", pantalon: "#3f5a45", zapatos: "#333333" };
export const LUCIA: ModeloCaricatura = { piel: "#f6c9a0", pelo: "#f2a33a", polo: "#2f7fc0", pantalon: "#5a4a9a", zapatos: "#333333", pelo_largo: true };

export const caricatura = (
  x: number, y: number,
  { modelo = MATEO, ojos = "normal" as OjosCaricatura, boca = "sonrisa" as BocaCaricatura, brazo = "abajo" as "abajo" | "arriba" | "adelante" | "cadera", s = 1 } = {},
) => {
  const P = (px: number, py: number) => `${x + px * s} ${y + py * s}`;
  // La cabeza va 30 % más grande que el cuerpo, como en las caricaturas: se escala alrededor del cuello
  const K = 1.3;
  const H = (px: number, py: number) => `${x + px * K * s} ${y + (-540 + (py + 540) * K) * s}`;
  const hx = (px: number) => x + px * K * s;
  const hy = (py: number) => y + (-540 + (py + 540) * K) * s;
  const linea_ = { strokeWidth: 7, roughness: 0.45, bowing: 0.6 };
  const relleno = (c: string) => ({ ...linea_, fill: c, fillStyle: "solid" as const });
  const t: Trazo[] = [];
  // Pelo largo detrás de la cabeza
  if (modelo.pelo_largo) t.push(...camino(`M ${H(-95, -640)} Q ${H(-140, -520)} ${P(-130, -330)} L ${P(130, -330)} Q ${H(140, -520)} ${H(95, -640)} Z`, relleno(modelo.pelo)));
  // Zapatos y piernas
  t.push(...camino(`M ${P(-120, 0)} Q ${P(-130, -40)} ${P(-70, -45)} L ${P(-20, -40)} Q ${P(-10, 0)} ${P(-30, 0)} Z`, relleno(modelo.zapatos)));
  t.push(...camino(`M ${P(30, 0)} Q ${P(10, -40)} ${P(40, -45)} L ${P(100, -45)} Q ${P(140, -30)} ${P(120, 0)} Z`, relleno(modelo.zapatos)));
  t.push(...camino(`M ${P(-95, -280)} L ${P(-80, -40)} L ${P(-25, -40)} L ${P(0, -200)} L ${P(30, -40)} L ${P(90, -42)} L ${P(95, -280)} Z`, relleno(modelo.pantalon)));
  // Torso (polo de manga larga)
  t.push(...camino(`M ${P(-95, -290)} Q ${P(-120, -420)} ${P(-80, -500)} Q ${P(0, -530)} ${P(80, -500)} Q ${P(120, -420)} ${P(95, -290)} Z`, relleno(modelo.polo)));
  // Brazos
  const brazos = {
    abajo: [`M ${P(-80, -490)} Q ${P(-150, -420)} ${P(-140, -320)}`, `M ${P(80, -490)} Q ${P(150, -420)} ${P(140, -320)}`, [-140, -310], [140, -310]],
    arriba: [`M ${P(-80, -490)} Q ${P(-210, -560)} ${P(-230, -700)}`, `M ${P(80, -490)} Q ${P(210, -560)} ${P(230, -700)}`, [-232, -716], [232, -716]],
    adelante: [`M ${P(-80, -490)} Q ${P(-150, -420)} ${P(-140, -320)}`, `M ${P(80, -490)} Q ${P(190, -470)} ${P(250, -520)}`, [-140, -310], [262, -530]],
    cadera: [`M ${P(-80, -490)} Q ${P(-170, -400)} ${P(-90, -330)}`, `M ${P(80, -490)} Q ${P(170, -400)} ${P(90, -330)}`, [-85, -325], [85, -325]],
  }[brazo] as [string, string, number[], number[]];
  t.push(...parte([...camino(brazos[0], { ...linea_, strokeWidth: 44, stroke: modelo.polo }), ...camino(brazos[0], { ...linea_, strokeWidth: 7 }),
    ...circulo(x + brazos[2][0] * s, y + brazos[2][1] * s, 62 * s, relleno(modelo.piel))], "brazo-izq"));
  t.push(...parte([...camino(brazos[1], { ...linea_, strokeWidth: 44, stroke: modelo.polo }), ...camino(brazos[1], { ...linea_, strokeWidth: 7 }),
    ...circulo(x + brazos[3][0] * s, y + brazos[3][1] * s, 62 * s, relleno(modelo.piel))], "brazo-der"));
  // Cuello, cabeza y orejas
  t.push(...rect(x - 22 * s, y - 545 * s, 44 * s, 40 * s, relleno(modelo.piel)));
  t.push(...parte([...circulo(hx(-98), hy(-650), 42 * K * s, relleno(modelo.piel)), ...circulo(hx(98), hy(-650), 42 * K * s, relleno(modelo.piel))], "cabeza"));
  t.push(...parte(camino(`M ${H(-95, -700)} Q ${H(-100, -560)} ${H(0, -540)} Q ${H(100, -560)} ${H(95, -700)} Q ${H(90, -790)} ${H(0, -795)} Q ${H(-90, -790)} ${H(-95, -700)} Z`, relleno(modelo.piel)), "cabeza"));
  // Pelo de arriba (despeinado)
  t.push(...parte(camino(`M ${H(-100, -700)} Q ${H(-110, -820)} ${H(-20, -830)} Q ${H(30, -860)} ${H(70, -820)} Q ${H(120, -800)} ${H(100, -690)} Q ${H(60, -760)} ${H(0, -745)} Q ${H(-60, -770)} ${H(-100, -700)} Z`, relleno(modelo.pelo)), "cabeza"));
  // Ojos grandes
  const sBase = s;
  const ojo = (ox: number) => {
    const cx = hx(ox), cy = hy(-670);
    const s = sBase * K;
    if (ojos === "feliz") return camino(`M ${cx - 30 * s} ${cy + 8 * s} Q ${cx} ${cy - 30 * s} ${cx + 30 * s} ${cy + 8 * s}`, linea_);
    const blanco = circulo(cx, cy, 78 * s, relleno("#ffffff"));
    if (ojos === "dinero") return [...blanco, ...camino(`M ${cx + 12 * s} ${cy - 22 * s} Q ${cx - 18 * s} ${cy - 26 * s} ${cx - 14 * s} ${cy - 6 * s} Q ${cx + 16 * s} ${cy + 4 * s} ${cx + 12 * s} ${cy + 20 * s} Q ${cx - 10 * s} ${cy + 28 * s} ${cx - 18 * s} ${cy + 16 * s} M ${cx} ${cy - 34 * s} L ${cx} ${cy + 34 * s}`, { ...linea_, stroke: "#2e9e4f", strokeWidth: 8 })];
    const pupila = ojos === "sorpresa" ? 18 : 36;
    const t2 = [...blanco, ...circulo(cx + 6 * s, cy + 4 * s, pupila * s, relleno("#1f1f1f"))];
    if (ojos === "cansado") t2.push(...camino(`M ${cx - 40 * s} ${cy - 6 * s} Q ${cx} ${cy - 50 * s} ${cx + 40 * s} ${cy - 6 * s} Z`, relleno(modelo.piel)));
    if (ojos === "preocupado") t2.push(...linea(cx - 30 * s, cy - 58 * s, cx + 20 * s, cy - (ox < 0 ? 48 : 68) * s, linea_));
    return t2;
  };
  t.push(...parte([...ojo(-38), ...ojo(38)], "ojos"));
  // Boca
  const by = hy(-590);
  const sb = s;
  {
  const s = sb * K;
  t.push(...parte({
    sonrisa: camino(`M ${x - 30 * s} ${by} Q ${x} ${by + 25 * s} ${x + 30 * s} ${by}`, linea_),
    abierta: camino(`M ${x - 35 * s} ${by - 8 * s} Q ${x} ${by + 55 * s} ${x + 35 * s} ${by - 8 * s} Z`, relleno("#7a1f2b")),
    chica: camino(`M ${x - 12 * s} ${by + 6 * s} L ${x + 12 * s} ${by + 6 * s}`, linea_),
    ondulada: camino(`M ${x - 30 * s} ${by + 5 * s} Q ${x - 15 * s} ${by - 8 * s} ${x} ${by + 5 * s} Q ${x + 15 * s} ${by + 18 * s} ${x + 30 * s} ${by + 5 * s}`, linea_),
    o: circulo(x, by + 8 * s, 26 * s, relleno("#7a1f2b")),
  }[boca], "boca"));
  }
  return t;
};
