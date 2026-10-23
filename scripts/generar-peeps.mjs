// Genera caras de reacción con Open Peeps (dibujos de Pablo Stanley, CC0) mediante DiceBear (MIT), sin internet.
// Quedan en public/assets/peeps/<persona>-<cara>.svg y se usan en la pizarra como { "img": "peep:lucia-miedo" }.
//   node scripts/generar-peeps.mjs
import { createAvatar } from "@dicebear/core";
import * as openPeeps from "@dicebear/open-peeps";
import { mkdirSync, writeFileSync } from "node:fs";

// Personas fijas del canal (siempre el mismo pelo, piel y ropa)
const PERSONAS = {
  lucia: { head: ["long"], headContrastColor: ["5c3317"], skinColor: ["d08b5b"], clothingColor: ["e78276"], accessoriesProbability: 0 },
  mateo: { head: ["short2"], headContrastColor: ["2c1b18"], skinColor: ["ae5d29"], clothingColor: ["78e185"], accessoriesProbability: 0 },
  abuela: { head: ["grayBun"], headContrastColor: ["c9c9c9"], skinColor: ["d08b5b"], clothingColor: ["9ddadb"], accessories: ["glasses"], accessoriesProbability: 100 },
};
// Emociones con nombre en español
const CARAS = {
  feliz: "smileBig", sonrisa: "smile", risa: "smileLOL", enamorada: "lovingGrin1", miedo: "fear", preocupada: "concerned",
  cansada: "tired", enojada: "rage", sorprendida: "awe", sospecha: "suspicious", explicando: "explaining", calma: "calm",
  seria: "serious", tierna: "cute", estresada: "hectic", comiendo: "eatingHappy",
};

mkdirSync("public/assets/peeps", { recursive: true });
let n = 0;
for (const [persona, opciones] of Object.entries(PERSONAS)) {
  for (const [nombre, face] of Object.entries(CARAS)) {
    const svg = createAvatar(openPeeps, { ...opciones, face: [face], facialHairProbability: 0, maskProbability: 0, seed: persona }).toString();
    writeFileSync(`public/assets/peeps/${persona}-${nombre}.svg`, svg);
    n++;
  }
}
writeFileSync(
  "public/assets/peeps/LEEME.md",
  "# Open Peeps\n\nDibujos de Pablo Stanley (https://www.openpeeps.com), dominio público (CC0), generados con DiceBear (MIT) por `scripts/generar-peeps.mjs`.\nEn la pizarra: `{ \"img\": \"peep:lucia-miedo\", \"x\": 500, \"y\": 400, \"t\": 300 }`.\n",
);
console.log(`${n} caras`);
