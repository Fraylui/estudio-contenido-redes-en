// Renderiza en lote todos los JSON de la carpeta contenido/.
//
//   npm run lote                      → todos los archivos, en vertical
//   npm run lote -- --horizontal      → todos, en horizontal (YouTube)
//   npm run lote -- --ambos           → todos, en los dos tamaños
//   npm run lote -- trivia            → solo los archivos cuyo nombre contiene "trivia"
//
// Los videos quedan en out/<nombre-del-archivo>-<Tamaño>.mp4 (y las miniaturas en .png)
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
    const python = "voz/.venv/bin/python";
    const referencia = JSON.parse(readFileSync(json, "utf8")).voz?.referencia ?? "voz/referencias/xiomi.wav";
    const desactualizada = !existsSync(audio) || statSync(audio).mtimeMs < statSync(json).mtimeMs;
    if (desactualizada && (!existsSync(python) || !existsSync(referencia))) {
      // La voz es opcional: sin instalarla o sin grabación de referencia, el video sale sin narración
      console.log(`\n⚠️  ${archivo}: falta instalar voz/ o la referencia ${referencia}; se genera sin narración.`);
    } else if (desactualizada) {
      console.log(`\n🎙  Narrando ${archivo}…`);
      execFileSync(python, ["voz/narrar.py", json, audio], { stdio: "inherit" });
    }
  }
  if (props.narracion && existsSync(`public/voz/${nombre}.json`)) {
    // Anuncio y Narrado leen la voz con su ruta dentro de public/; los demás formatos, desde public/voz/
    props.voz = formato === "Anuncio" || formato === "Narrado" ? `voz/${nombre}.wav` : `${nombre}.wav`;
    const tiemposVoz = JSON.parse(readFileSync(`public/voz/${nombre}.json`, "utf8"));
    props.duracionVoz = tiemposVoz.duracion;
    // Los anuncios usan los tiempos de cada frase para sincronizar sus escenas
    props.frasesVoz = tiemposVoz.frases.map(({ inicio, fin }) => ({ inicio, fin }));
  }
  const rutaProps = join("out/.props", archivo);
  writeFileSync(rutaProps, JSON.stringify(props));

  // Los videos narrados también llevan su miniatura de YouTube (PNG de 1280x720)
  if (formato === "Narrado") {
    const miniatura = `out/${nombre}-miniatura.png`;
    console.log(`\n▶ ${archivo} → ${miniatura}`);
    execFileSync("npx", ["remotion", "still", "Miniatura", miniatura, `--props=${rutaProps}`], {
      stdio: "inherit",
    });
  }

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
