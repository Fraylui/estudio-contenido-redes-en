// Copia a src/formatos/pizarra/iconos.gen.ts los trazos de los íconos de línea de Tabler (licencia MIT)
// que usa la pizarra. Luego rough.js los redibuja "a mano", así no parecen emojis.
//   node scripts/generar-iconos.mjs        (después de agregar nombres a la lista)
import { readFileSync, writeFileSync } from "node:fs";

const ICONOS = [
  "car", "credit-card", "building-bank", "chart-line", "cash-banknote", "device-laptop", "basket", "beer", "cup", "brand-netflix",
  "truck-delivery", "motorbike", "package", "scale", "arrow-big-up", "arrow-big-down", "plus", "minus", "chart-pie", "school", "tools", "soup",
  "world", "map-pin", "cpu", "rocket", "plane", "camera", "history", "telescope", "wallet", "coin", "cash", "pig-money", "moneybag", "bulb", "brain", "notebook", "pencil", "home", "shopping-bag",
  "coffee", "pizza", "ticket", "device-gamepad-2", "books", "headphones", "pill", "device-mobile", "calendar",
  "confetti", "question-mark", "trending-up", "trending-down", "receipt", "bus", "torii", "alarm", "sparkles",
  "check", "x", "shopping-cart", "clock", "zzz", "bed", "sun", "moon", "heart", "heart-broken", "mood-happy",
  "mood-sad", "alarm-snooze", "run", "book", "barbell", "apple", "droplet", "flame",
  "sunrise", "sunset", "window", "glass-full", "bolt", "battery-1", "battery-4", "walk", "stretching", "repeat",
  "calendar-week", "device-tv", "hand-stop", "hourglass", "bell-ringing", "moon-stars", "cup", "clock-hour-7",
  "mood-smile-beam", "mood-sick", "dna", "wave-sine", "stairs-up", "target",
];

// Convierte cada elemento del SVG (path, circle, rect, line, polyline) en un "d" de path
const aD = (tag, a) => {
  const n = (k) => Number(a[k] ?? 0);
  if (tag === "path") return a.d;
  if (tag === "circle") return `M ${n("cx") - n("r")} ${n("cy")} a ${n("r")} ${n("r")} 0 1 0 ${2 * n("r")} 0 a ${n("r")} ${n("r")} 0 1 0 ${-2 * n("r")} 0`;
  if (tag === "ellipse") return `M ${n("cx") - n("rx")} ${n("cy")} a ${n("rx")} ${n("ry")} 0 1 0 ${2 * n("rx")} 0 a ${n("rx")} ${n("ry")} 0 1 0 ${-2 * n("rx")} 0`;
  if (tag === "rect") return `M ${n("x")} ${n("y")} h ${n("width")} v ${n("height")} h ${-n("width")} Z`;
  if (tag === "line") return `M ${n("x1")} ${n("y1")} L ${n("x2")} ${n("y2")}`;
  if (tag === "polyline" || tag === "polygon") return `M ${a.points}${tag === "polygon" ? " Z" : ""}`;
  return null;
};

const salida = {};
for (const nombre of ICONOS) {
  const svg = readFileSync(`node_modules/@tabler/icons/icons/outline/${nombre}.svg`, "utf8");
  const trazos = [];
  for (const m of svg.matchAll(/<(path|circle|ellipse|rect|line|polyline|polygon)\s([^>]*?)\/?>/g)) {
    const attrs = Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
    // Tabler incluye un rect invisible de 24x24 como caja: se descarta
    if (attrs.stroke === "none" || attrs.d === "M0 0h24v24H0z") continue;
    const d = aD(m[1], attrs);
    if (d) trazos.push(d);
  }
  salida[nombre] = trazos;
}
// Íconos propios que Tabler no tiene, en la misma cuadrícula de 24x24 y con el mismo trazo
salida.hormiga = [
  "M 2.8 10 a 2.2 2.2 0 1 0 4.4 0 a 2.2 2.2 0 1 0 -4.4 0",
  "M 7.6 11 a 2.4 1.8 0 1 0 4.8 0 a 2.4 1.8 0 1 0 -4.8 0",
  "M 12.5 12 a 4 3 0 1 0 8 0 a 4 3 0 1 0 -8 0",
  "M 9 12.5 L 7 16", "M 10 12.8 L 10 17", "M 11 12.6 L 13 16.5",
  "M 9 9.5 L 7.5 6.5", "M 10.5 9.3 L 11 6", "M 11.5 9.6 L 13.5 7",
  "M 4 8.2 C 3.5 6 2.5 5 1.5 5", "M 5.8 8 C 6 5.8 5.5 4.5 4.5 3.8",
];

writeFileSync(
  "src/formatos/pizarra/iconos.gen.ts",
  "// Generado por scripts/generar-iconos.mjs a partir de @tabler/icons (MIT). No editar a mano.\n" +
    `export const ICONOS: Record<string, string[]> = ${JSON.stringify(salida)};\n`,
);
console.log(`${Object.keys(salida).length} íconos`);
