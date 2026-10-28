import { Audio } from "@remotion/media";
import { z } from "zod";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { marca } from "../../marca";
import { duracionToma, Tomas, tomaSchema } from "./Tomas";

// Reel de noticia hecho con videos reales: tomas cortas, gancho al inicio, subtítulos palabra
// por palabra, logo fijo y la presentadora en una esquina mientras habla la narradora.
// La narración (props.narracion) la genera voz/narrar.py; npm run lote completa voz, palabras y volumen.
export const noticiaSchema = z.object({
  etiqueta: z.string(),
  titular: z.string(),
  // Logo de texto arriba a la derecha: [parte negra, parte blanca] sobre fondo rojo
  logo: z.tuple([z.string(), z.string()]),
  colorLogo: z.string().default("#d7141a"),
  tomas: z.array(tomaSchema),
  volumenVideo: z.number().default(0.1),
  claves: z.array(z.string()).default([]),
  // Imágenes de la presentadora con la boca cerrada, media y abierta (vacío = sin presentadora)
  presentadora: z.array(z.string()).default([]),
  narracion: z.array(
    z.union([
      z.string(),
      z.object({
        texto: z.string(),
        estilo: z.string().optional(),
        gancho: z.boolean().optional(),
        en: z.number().optional(),
        pausa: z.number().optional(),
      }),
    ]),
  ),
  // Los completa npm run lote
  voz: z.string().optional(),
  duracionVoz: z.number().optional(),
  frasesVoz: z.array(z.object({ inicio: z.number(), fin: z.number() })).optional(),
  palabrasVoz: z.array(z.object({ p: z.string(), i: z.number(), f: z.number() })).optional(),
  volumenVoz: z.array(z.number()).optional(),
  tamanos: z.record(z.string(), z.object({ ancho: z.number(), alto: z.number() })).default({}),
});
type Props = z.infer<typeof noticiaSchema>;

const NEGRO = "#0b0b0d";
const AMARILLO = "#FFE14D";
const VERDE = "#3DF58C";

export const calcularNoticia: CalculateMetadataFunction<Props> = ({ props }) => {
  const tomas = props.tomas.reduce((s, t) => s + duracionToma(t, 30), 0);
  const voz = props.duracionVoz ? Math.ceil((props.duracionVoz + 0.6) * 30) : 0;
  return { durationInFrames: Math.max(voz || tomas, 60) };
};

// Fin del gancho: la frase marcada con "gancho" (o la primera).
const finGancho = (p: Props) => {
  const i = Math.max(0, p.narracion.findIndex((f) => typeof f !== "string" && f.gancho));
  return p.frasesVoz?.[i]?.fin ?? 2.5;
};

type Palabra = { p: string; i: number; f: number };
type Bloque = { palabras: Palabra[]; inicio: number; fin: number };

// Bloques cortos (hasta 4 palabras o 22 letras) que se cortan en pausas y puntos.
const agrupar = (ws: Palabra[]): Bloque[] => {
  const grupos: Bloque[] = [];
  let actual: Palabra[] = [];
  const cerrar = () => {
    if (actual.length) {
      grupos.push({ palabras: actual, inicio: actual[0].i, fin: actual[actual.length - 1].f });
    }
    actual = [];
  };
  for (const w of ws) {
    const previa = actual[actual.length - 1];
    const texto = [...actual.map((x) => x.p), w.p].join(" ");
    if (
      previa &&
      (actual.length >= 4 || texto.length > 22 || w.i - previa.f > 0.35 || /[.!?]$/.test(previa.p))
    ) {
      cerrar();
    }
    actual.push(w);
  }
  cerrar();
  return grupos;
};

const Logo: React.FC<{ logo: [string, string]; color: string }> = ({ logo, color }) => (
  // Fijo desde el primer cuadro y siempre visible
  <div
    style={{
      position: "absolute",
      top: 70,
      right: 50,
      background: color,
      borderRadius: 18,
      padding: "14px 30px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
      fontFamily: marca.fuentes.texto,
      fontWeight: 800,
      fontSize: 54,
      letterSpacing: -0.5,
      zIndex: 8,
    }}
  >
    <span style={{ color: NEGRO }}>{logo[0]}</span> <span style={{ color: "#fff" }}>{logo[1]}</span>
  </div>
);

// Titular abajo solo mientras la narradora dice el gancho.
const Gancho: React.FC<{ etiqueta: string; titular: string; fin: number; color: string }> = ({
  etiqueta,
  titular,
  fin,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hasta = Math.round((fin + 0.25) * fps);
  if (frame > hasta + 10) {
    return null;
  }
  const entra = spring({ frame, fps, config: { damping: 13 } });
  const sale = interpolate(frame, [hasta, hasta + 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top: 1290,
        textAlign: "center",
        zIndex: 6,
        opacity: sale,
        transform: `translateY(${interpolate(entra, [0, 1], [120, 0]) + (1 - sale) * 60}px) scale(${interpolate(entra, [0, 1], [0.8, 1])})`,
      }}
    >
      <div
        style={{
          display: "inline-block",
          background: color,
          color: "#fff",
          fontFamily: marca.fuentes.texto,
          fontWeight: 800,
          fontSize: 36,
          padding: "6px 20px",
          letterSpacing: 3,
          borderRadius: 8,
        }}
      >
        {etiqueta}
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: marca.fuentes.titulo,
          fontSize: 92,
          lineHeight: 1.05,
          color: "#ffd400",
          textTransform: "uppercase",
          WebkitTextStroke: "12px #000",
          paintOrder: "stroke fill",
          textShadow: "0 6px 18px rgba(0,0,0,0.7)",
        }}
      >
        {titular}
      </div>
    </div>
  );
};

// Subtítulos chicos palabra por palabra: la que suena en amarillo y las palabras clave en verde.
const Subtitulos: React.FC<{ bloques: Bloque[]; claves: Set<string>; finGancho: number }> = ({
  bloques,
  claves,
  finGancho: fg,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const b = bloques.find((x) => t >= x.inicio && t < x.fin + 0.12);
  if (!b) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: t < fg + 0.35 ? 1120 : 1360,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "0 16px",
        zIndex: 5,
      }}
    >
      {b.palabras.map((w, i) => {
        if (t < w.i) {
          return null;
        }
        const pop = spring({
          frame: frame - Math.round(w.i * fps),
          fps,
          config: { damping: 9, mass: 0.45, stiffness: 220 },
        });
        const actual = i === b.palabras.length - 1 || t < b.palabras[i + 1].i;
        const clave = claves.has(w.p.toLowerCase().replace(/[¡!¿?.,:;"]/g, ""));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: "0 8px",
              fontFamily: marca.fuentes.texto,
              fontWeight: 900,
              fontSize: clave ? 66 : 60,
              lineHeight: 1.08,
              letterSpacing: -1,
              textTransform: "uppercase",
              color: clave ? VERDE : actual ? AMARILLO : "#ffffff",
              WebkitTextStroke: "7px #000",
              paintOrder: "stroke fill",
              textShadow: "0 5px 0 rgba(0,0,0,0.85), 0 10px 20px rgba(0,0,0,0.5)",
              transformOrigin: "center bottom",
              transform: `scale(${interpolate(Math.min(pop, 1), [0, 1], [0.4, actual ? 1.04 : 1])}) rotate(${clave ? -3 : 0}deg)`,
              opacity: interpolate(pop, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            {w.p}
          </span>
        );
      })}
    </div>
  );
};

const Progreso: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 10,
        width: `${(frame / durationInFrames) * 100}%`,
        background: `linear-gradient(90deg, ${color}, #ff5a3c)`,
        zIndex: 9,
      }}
    />
  );
};

// La presentadora entra por la izquierda y mueve la boca según el volumen de la voz.
const Presentadora: React.FC<{ imagenes: string[]; volumen: number[] }> = ({ imagenes, volumen }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = volumen[frame] ?? 0;
  const [cerrada, media, abierta] = imagenes;
  const boca = v > 0.55 ? (abierta ?? cerrada) : v > 0.18 ? (media ?? cerrada) : cerrada;
  const entra = spring({ frame: frame - 6, fps, config: { damping: 15 } });
  const respira = Math.sin(frame / 22) * 4;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 300,
        width: 400,
        height: 700,
        overflow: "hidden",
        WebkitMaskImage: "linear-gradient(180deg, #000 78%, transparent 100%)",
        transform: `translateX(${interpolate(entra, [0, 1], [-600, 0])}px) translateY(${respira - Math.min(v, 1) * 5}px)`,
        filter: "drop-shadow(0 0 18px rgba(0,0,0,0.55))",
        zIndex: 4,
      }}
    >
      <Img src={staticFile(boca)} style={{ width: "100%" }} />
    </div>
  );
};

export const Noticia: React.FC<Props> = (props) => {
  const fg = finGancho(props);
  const iGancho = Math.max(0, props.narracion.findIndex((f) => typeof f !== "string" && f.gancho));
  const ganchoVoz = props.frasesVoz?.[iGancho];
  // El gancho ya está en pantalla como titular: sus palabras no se repiten en los subtítulos
  const palabras = (props.palabrasVoz ?? []).filter(
    (w) => !ganchoVoz || w.i < ganchoVoz.inicio - 0.05 || w.i > ganchoVoz.fin,
  );
  const bloques = agrupar(palabras);
  const claves = new Set(props.claves.map((c) => c.toLowerCase()));
  return (
    <AbsoluteFill style={{ backgroundColor: NEGRO }}>
      <Tomas tomas={props.tomas} volumen={props.volumenVideo} tamanos={props.tamanos} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.7) 100%)",
        }}
      />
      <Gancho etiqueta={props.etiqueta} titular={props.titular} fin={fg} color={props.colorLogo} />
      <Logo logo={props.logo} color={props.colorLogo} />
      <Subtitulos bloques={bloques} claves={claves} finGancho={fg} />
      <Progreso color={props.colorLogo} />
      {props.presentadora.length > 0 ? (
        <Presentadora imagenes={props.presentadora} volumen={props.volumenVoz ?? []} />
      ) : null}
      {props.voz ? <Audio src={staticFile(props.voz)} /> : null}
    </AbsoluteFill>
  );
};
