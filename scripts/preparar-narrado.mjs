// Prepara un video narrado a partir de tu grabación:
//   1. Mejora tu voz (quita ruido y retumbos, le da presencia y la deja al volumen de redes)
//   2. Genera los subtítulos palabra por palabra con Whisper (en tu computadora, gratis)
//   3. Alinea tu voz con el guion: subtítulos sin faltas y cada escena en su momento
//
//   npm run preparar -- el-tunche                    → usa grabaciones/el-tunche.(m4a|mp3|wav|…)
//   npm run preparar -- el-tunche --modelo medium    → subtítulos más precisos (más lento)
//   npm run preparar -- el-tunche --pausas-naturales → no acorta las pausas largas
//
// Necesita ffmpeg instalado. La primera vez descarga Whisper (~500 MB).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";

const WHISPER_VERSION = "1.5.5";
const CARPETA_WHISPER = resolve(".whisper");

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--") && !/^(tiny|base|small|medium)/.test(a));
const iModelo = args.indexOf("--modelo");
const modelo = iModelo === -1 ? "small" : args[iModelo + 1];
const acortarPausas = !args.includes("--pausas-naturales");

const salir = (mensaje) => {
  console.log(mensaje);
  process.exit(1);
};

if (!id) salir("Uso: npm run preparar -- <id>   (por ejemplo: npm run preparar -- el-tunche)");

const rutaContenido = join("contenido", `narrado-${id}.json`);
if (!existsSync(rutaContenido)) salir(`No encontré ${rutaContenido}.`);

const grabacion = readdirSync("grabaciones").find((f) => f.startsWith(`${id}.`));
if (!grabacion) {
  salir(`No encontré tu grabación. Guárdala como grabaciones/${id}.m4a (o .mp3, .wav, .ogg).`);
}

// Ejecuta ffmpeg/ffprobe y devuelve stdout y stderr (ahí escribe ffmpeg sus mediciones)
const correr = (programa, parametros) => {
  const r = spawnSync(programa, parametros, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error) {
    salir(
      `Falta ${programa}. Instala ffmpeg:\n` +
        "  Windows: winget install ffmpeg\n" +
        "  Mac:     brew install ffmpeg\n" +
        "  Linux:   sudo apt install ffmpeg",
    );
  }
  if (r.status !== 0) salir(`${programa} falló:\n${r.stderr.slice(-2000)}`);
  return r;
};

const duracionDe = (archivo) =>
  Number(
    correr("ffprobe", [
      "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", archivo,
    ]).stdout.trim(),
  );

// ---------- 1. Mejorar la voz ----------
const entrada = join("grabaciones", grabacion);
console.log(`\n🎙  1/3 Mejorando la voz de ${entrada}…`);

const filtros = [
  "aformat=channel_layouts=mono",
  "highpass=f=80", // retumbos y golpes al micrófono
  "afftdn=nr=10:nf=-45:tn=1", // ruido de fondo constante, suave para no sonar robótico
  ...(acortarPausas
    ? // Las pausas de más de 1 s quedan en 0,7 s: hay suspenso pero no tiempos muertos
      ["silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=-42dB:stop_silence=0.7"]
    : []),
  "equalizer=f=120:t=q:w=1:g=2", // cuerpo y calidez, voz de narrador
  "equalizer=f=300:t=q:w=1.2:g=-3", // quita el sonido "encerrado"
  "equalizer=f=3500:t=q:w=1.5:g=3", // presencia: se entiende mejor en el celular
  "equalizer=f=10000:t=q:w=1:g=1.5", // aire
  "deesser=i=0.4",
  "acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2",
].join(",");

// Primera pasada: medir. Segunda: normalizar a -16 LUFS (la música irá por debajo).
const medicion = correr("ffmpeg", [
  "-hide_banner", "-i", entrada,
  "-af", `${filtros},loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json`,
  "-f", "null", "-",
]).stderr;
const m = JSON.parse(medicion.slice(medicion.lastIndexOf("{"), medicion.lastIndexOf("}") + 1));

mkdirSync("public/voz", { recursive: true });
const voz = join("public/voz", `${id}.m4a`);
correr("ffmpeg", [
  "-hide_banner", "-y", "-i", entrada,
  "-af",
  `${filtros},loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}` +
    `:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}` +
    ":linear=true,aresample=48000",
  "-c:a", "aac", "-b:a", "192k", voz,
]);

const duracionOriginal = duracionDe(entrada);
const duracion = duracionDe(voz);
console.log(
  `   Volumen: ${Number(m.input_i).toFixed(1)} → -16 LUFS · ` +
    `Duración: ${duracionOriginal.toFixed(1)} s → ${duracion.toFixed(1)} s`,
);

// ---------- 2. Subtítulos con Whisper ----------
console.log(`\n📝 2/3 Generando subtítulos (modelo ${modelo})…`);
await installWhisperCpp({ to: CARPETA_WHISPER, version: WHISPER_VERSION, printOutput: false });
await downloadWhisperModel({ model: modelo, folder: CARPETA_WHISPER, printOutput: false });

const wav16k = join(CARPETA_WHISPER, `${id}-16k.wav`);
correr("ffmpeg", ["-hide_banner", "-y", "-i", voz, "-ar", "16000", "-ac", "1", wav16k]);
const salidaWhisper = await transcribe({
  inputPath: wav16k,
  whisperPath: CARPETA_WHISPER,
  whisperCppVersion: WHISPER_VERSION,
  model: modelo,
  language: "Spanish",
  tokenLevelTimestamps: true,
  splitOnWord: true,
  printOutput: false,
});
rmSync(wav16k);
const { captions: transcritos } = toCaptions({ whisperCppOutput: salidaWhisper });

// ---------- 3. Alinear con el guion ----------
// Whisper a veces escucha mal una palabra. Como ya sabemos qué dijiste (el guion),
// emparejamos cada palabra del guion con la del audio y usamos el texto del guion
// con los tiempos del audio. Así los subtítulos salen sin faltas de ortografía.
console.log("\n🎬 3/3 Alineando tu voz con el guion…");
const normalizar = (t) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

const contenido = JSON.parse(readFileSync(rutaContenido, "utf8"));
const { escenas } = contenido.props;
const guion = escenas.flatMap((e, escena) =>
  e.texto
    .split(/\s+/)
    .filter((p) => normalizar(p))
    .map((texto) => ({ texto, n: normalizar(texto), escena })),
);
const audio = transcritos
  .map((c) => ({ ...c, n: normalizar(c.text) }))
  .filter((c) => c.n);

// Parecido entre dos palabras (0 a 1), para aceptar "abudo" ≈ "agudo"
const parecido = (a, b) => {
  if (a === b) return 1;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[a.length][b.length] / Math.max(a.length, b.length);
};

// Alineación de secuencias (como un "diff" de palabras)
const G = guion.length;
const A = audio.length;
const costo = Array.from({ length: G + 1 }, () => new Float64Array(A + 1));
for (let i = 1; i <= G; i++) costo[i][0] = i;
for (let j = 1; j <= A; j++) costo[0][j] = j;
for (let i = 1; i <= G; i++)
  for (let j = 1; j <= A; j++)
    costo[i][j] = Math.min(
      costo[i - 1][j] + 1,
      costo[i][j - 1] + 1,
      costo[i - 1][j - 1] + (1 - parecido(guion[i - 1].n, audio[j - 1].n)) * 1.5,
    );
const pareja = new Array(G).fill(null);
for (let i = G, j = A; i > 0 && j > 0; ) {
  const diag = costo[i - 1][j - 1] + (1 - parecido(guion[i - 1].n, audio[j - 1].n)) * 1.5;
  if (Math.abs(costo[i][j] - diag) < 1e-9) {
    pareja[i - 1] = audio[j - 1];
    i--;
    j--;
  } else if (Math.abs(costo[i][j] - (costo[i - 1][j] + 1)) < 1e-9) i--;
  else j--;
}

// Palabras del guion que Whisper no oyó: tiempo interpolado entre sus vecinas
let emparejadas = 0;
const subtitulos = guion.map((g, i) => {
  if (pareja[i]) {
    emparejadas++;
    return { text: ` ${g.texto}`, startMs: pareja[i].startMs, endMs: pareja[i].endMs };
  }
  return { text: ` ${g.texto}`, startMs: null, endMs: null };
});
subtitulos.forEach((s, i) => {
  if (s.startMs !== null) return;
  const antes = subtitulos.slice(0, i).reverse().find((x) => x.startMs !== null);
  const despues = subtitulos.slice(i + 1).find((x) => x.startMs !== null);
  s.startMs = antes ? antes.endMs : 0;
  s.endMs = despues ? Math.max(s.startMs + 1, despues.startMs) : s.startMs + 300;
});
const captions = subtitulos.map((s) => ({ ...s, timestampMs: s.startMs, confidence: 1 }));
captions[0].text = captions[0].text.trimStart();

mkdirSync("public/subtitulos", { recursive: true });
const rutaSubtitulos = join("public/subtitulos", `${id}.json`);
writeFileSync(rutaSubtitulos, JSON.stringify(captions, null, 2));
const porcentaje = Math.round((emparejadas / G) * 100);
console.log(`   ${porcentaje}% de las palabras del guion encontradas en tu audio → ${rutaSubtitulos}`);
if (porcentaje < 80) {
  console.log("   ⚠️  Tu grabación se parece poco al guion. Revisa que leíste el texto del JSON.");
}

// Cada escena empieza cuando dices su primera palabra
escenas.forEach((escena, i) => {
  const primera = captions[guion.findIndex((g) => g.escena === i)];
  escena.inicio = i === 0 ? 0 : Number(Math.max(0, primera.startMs / 1000 - 0.15).toFixed(2));

  // Si existe public/imagenes/<id>/01.jpg (o .png/.webp) para esta escena, se usa sola
  const numero = String(i + 1).padStart(2, "0");
  const imagen = ["jpg", "jpeg", "png", "webp"]
    .map((ext) => `imagenes/${id}/${numero}.${ext}`)
    .find((ruta) => existsSync(join("public", ruta)));
  if (imagen) escena.imagen = imagen;
});

contenido.props.voz = `voz/${id}.m4a`;
contenido.props.subtitulos = `subtitulos/${id}.json`;
contenido.props.duracion = Number(duracion.toFixed(2));
writeFileSync(rutaContenido, JSON.stringify(contenido, null, 2) + "\n");

escenas.forEach((e, i) =>
  console.log(`   ${String(i + 1).padStart(2)} · ${e.inicio.toFixed(1).padStart(5)} s · ${e.imagen ?? "(sin imagen)"}`),
);
console.log(`\n✅ Listo. Mira el resultado con "npm run dev" o genera el video con "npm run lote -- ${id} --ambos"`);
