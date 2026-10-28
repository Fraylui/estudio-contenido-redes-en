// Escribe src/formatos/pizarra/objetos-ia.gen.ts con los objetos 3D que hay en public/assets/objetos-ia/:
// así una escena que pide el ícono "coin" usa sola la moneda 3D si existe. Correr después de agregar objetos.
import { readdirSync, writeFileSync } from "node:fs";

const nombres = readdirSync("public/assets/objetos-ia").filter((f) => f.endsWith(".png")).map((f) => f.slice(0, -4)).sort();
writeFileSync(
  "src/formatos/pizarra/objetos-ia.gen.ts",
  "// Generado por scripts/listar-objetos-ia.mjs. No editar a mano.\n" +
    `export const OBJETOS_IA = new Set<string>(${JSON.stringify(nombres)});\n`,
);
console.log(`${nombres.length} objetos 3D`);

// Escenarios con mapa de profundidad (imagen/profundidad.py): esos se mueven en 2.5D
const conProfundidad = readdirSync("public/assets/ia").filter((f) => f.endsWith("-prof.png")).map((f) => f.slice(0, -9)).sort();
writeFileSync(
  "src/formatos/pizarra/profundidad.gen.ts",
  "// Generado por scripts/listar-objetos-ia.mjs. No editar a mano.\n" +
    `export const CON_PROFUNDIDAD = new Set<string>(${JSON.stringify(conProfundidad)});\n`,
);
console.log(`${conProfundidad.length} escenarios con profundidad`);
