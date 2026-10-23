// Renderiza en lote todos los JSON de la carpeta contenido/.
//
//   npm run lote                      → todos los archivos, en vertical
//   npm run lote -- --horizontal      → todos, en horizontal (YouTube)
//   npm run lote -- --ambos           → todos, en los dos tamaños
//   npm run lote -- trivia            → solo los archivos cuyo nombre contiene "trivia"
//
// Los videos quedan en out/<nombre-del-archivo>-<Tamaño>.mp4
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
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
  const json = join(carpeta, archivo);
  const { formato, props, voz = {} } = JSON.parse(readFileSync(json, "utf8"));
  const nombre = basename(archivo, ".json");

  // Si el JSON tiene "narracion", primero se genera la voz. Es opcional: sin la voz
  // instalada o sin la grabación de referencia, el video sale igual, sin narración.
  if (props.narracion) {
    const python = "voz/.venv/bin/python";
    const referencia = voz.referencia ?? "voz/referencias/xiomi.wav";
    const audio = `public/voz/${nombre}.wav`;
    const datosVoz = `public/voz/${nombre}.json`;
    // Solo se vuelve a narrar si cambió el texto narrado o la configuración de la voz.
    const huella = createHash("sha1")
      .update(JSON.stringify({ narracion: props.narracion, voz }))
      .digest("hex");
    const anterior = existsSync(datosVoz) ? JSON.parse(readFileSync(datosVoz, "utf8")) : null;
    const lista = existsSync(audio) && anterior?.huella === huella;

    if (!lista && (!existsSync(python) || !existsSync(referencia))) {
      console.log(
        `\n⚠️  ${archivo}: sin voz (falta instalar voz/ o la referencia ${referencia}); se genera sin narración.`,
      );
    } else {
      if (!lista) {
        console.log(`\n🎙  Narrando ${archivo}…`);
        execFileSync(python, ["voz/narrar.py", json, audio, huella], { stdio: "inherit" });
      }
      props.voz = `${nombre}.wav`;
      props.duracionVoz = JSON.parse(readFileSync(datosVoz, "utf8")).duracion;
    }
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
