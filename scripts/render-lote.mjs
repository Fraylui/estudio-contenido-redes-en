// Renderiza en lote todos los JSON de la carpeta contenido/.
//
//   npm run lote                      → todos los archivos, en vertical
//   npm run lote -- --horizontal      → todos, en horizontal (YouTube)
//   npm run lote -- --ambos           → todos, en los dos tamaños
//   npm run lote -- trivia            → solo los archivos cuyo nombre contiene "trivia"
//
// Los videos quedan en out/<nombre-del-archivo>-<Tamaño>.mp4
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const args = process.argv.slice(2);
const tamanos = args.includes("--ambos")
  ? ["Vertical", "Horizontal"]
  : args.includes("--horizontal")
    ? ["Horizontal"]
    : ["Vertical"];
const filtro = args.find((a) => !a.startsWith("--"));

const carpeta = "contenido";
const archivos = readdirSync(carpeta)
  .filter((f) => f.endsWith(".json"))
  .filter((f) => !filtro || f.includes(filtro));

if (archivos.length === 0) {
  console.log("No hay archivos en contenido/ que coincidan.");
  process.exit(1);
}

mkdirSync("out/.props", { recursive: true });

for (const archivo of archivos) {
  const { formato, props } = JSON.parse(readFileSync(join(carpeta, archivo), "utf8"));
  const nombre = basename(archivo, ".json");

  // Si el JSON tiene "narracion", primero se genera la voz (solo si cambió el texto).
  if (props.narracion) {
    const audio = `public/voz/${nombre}.wav`;
    const json = join(carpeta, archivo);
    if (!existsSync(audio) || statSync(audio).mtimeMs < statSync(json).mtimeMs) {
      console.log(`\n🎙  Narrando ${archivo}…`);
      execFileSync("voz/.venv/bin/python", ["voz/narrar.py", json, audio], { stdio: "inherit" });
    }
    props.voz = `${nombre}.wav`;
    props.duracionVoz = JSON.parse(readFileSync(`public/voz/${nombre}.json`, "utf8")).duracion;
  }
  const rutaProps = join("out/.props", archivo);
  writeFileSync(rutaProps, JSON.stringify(props));

  for (const tamano of tamanos) {
    const salida = `out/${nombre}-${tamano}.mp4`;
    console.log(`\n▶ ${archivo} → ${salida}`);
    execFileSync(
      "npx",
      ["remotion", "render", `${formato}-${tamano}`, salida, `--props=${rutaProps}`],
      { stdio: "inherit" },
    );
  }
}

console.log("\n✅ Listo. Revisa la carpeta out/");
