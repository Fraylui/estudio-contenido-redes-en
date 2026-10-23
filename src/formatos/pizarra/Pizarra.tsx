// Formato pizarra (estilo DOMINALO / DECIDO VIVIR MEJOR): fondo de papel, un dibujo hecho a mano que
// se traza solo en cada frase y el texto apareciendo palabra por palabra con una palabra en amarillo.
import { Audio } from "@remotion/media";
import { getBoundingBox, getLength } from "@remotion/paths";
import { loadFont } from "@remotion/fonts";
import { useMemo } from "react";
import { z } from "zod";
import {
  AbsoluteFill, CalculateMetadataFunction, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { DIBUJOS } from "./dibujos";
import type { Trazo } from "./trazos";

loadFont({ family: "Mano", url: staticFile("fuentes/PatrickHand.woff2") });

export const pizarraSchema = z.object({
  escenas: z.array(
    z.object({
      dibujo: z.string(),
      texto: z.string(),
      // Palabra (o palabras) que se resaltan en amarillo
      resaltar: z.string().optional(),
      segundos: z.number().optional(),
    }),
  ),
  voz: z.string().optional(),
  frasesVoz: z.array(z.object({ inicio: z.number(), fin: z.number() })).optional(),
  musica: z.string().optional(),
});

type Props = z.infer<typeof pizarraSchema>;
const FPS = 30;

// Cada escena dura lo que su frase de la narración (escena 1 = frase 1, escena 2 = frase 2…)
export const calcularPizarra: CalculateMetadataFunction<Props> = ({ props }) => {
  const f = props.frasesVoz;
  const escenas = f?.length
    ? props.escenas.map((e, i) => {
        const inicio = i === 0 ? 0 : f[i]?.inicio - 0.1;
        const fin = i + 1 < props.escenas.length && f[i + 1] ? f[i + 1].inicio - 0.1 : (f[f.length - 1]?.fin ?? 0) + 1.2;
        return { ...e, segundos: Math.max(1, fin - inicio) };
      })
    : props.escenas.map((e) => ({ ...e, segundos: e.segundos ?? 4 }));
  return {
    durationInFrames: Math.round(escenas.reduce((t, e) => t + (e.segundos ?? 4), 0) * FPS),
    props: { ...props, escenas },
  };
};

export const Pizarra: React.FC<Props> = ({ escenas, voz, musica }) => {
  let desde = 0;
  return (
    <AbsoluteFill>
      <Papel />
      {escenas.map((e, i) => {
        const inicio = desde;
        const duracion = Math.round((e.segundos ?? 4) * FPS);
        desde += duracion;
        return (
          <Sequence key={i} from={inicio} durationInFrames={duracion}>
            <Escena {...e} />
            <Audio src={staticFile("sfx/lapiz.wav")} volume={0.35} />
          </Sequence>
        );
      })}
      {voz ? <Audio src={staticFile(voz)} /> : null}
      {musica ? <Audio src={staticFile(musica)} volume={0.08} loop /> : null}
    </AbsoluteFill>
  );
};

// Papel arrugado: textura de ruido con luz rasante, sin imágenes externas
const Papel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#f3efe6" }}>
    <svg width="100%" height="100%">
      <filter id="arrugas">
        <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="5" seed="3" />
        <feDiffuseLighting lightingColor="#ffffff" surfaceScale="2.2">
          <feDistantLight azimuth="45" elevation="62" />
        </feDiffuseLighting>
      </filter>
      <rect width="100%" height="100%" filter="url(#arrugas)" opacity="0.8" style={{ mixBlendMode: "multiply" }} />
    </svg>
  </AbsoluteFill>
);

const Escena: React.FC<Props["escenas"][number]> = ({ dibujo, texto, resaltar, segundos }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const horizontal = width > height;
  const total = (segundos ?? 4) * FPS;
  // Zoom lento de cámara, como en los videos de pizarra
  const zoom = interpolate(frame, [0, total], [1, 1.05]);
  return (
    <AbsoluteFill style={{ flexDirection: horizontal ? "row" : "column", transform: `scale(${zoom})` }}>
      <div style={{ flex: horizontal ? 1.05 : 1.2, position: "relative" }}>
        <Dibujo trazos={DIBUJOS[dibujo] ?? []} duracion={Math.min(total * 0.55, 2.2 * FPS)} />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: horizontal ? "0 90px 0 0" : "0 70px 160px" }}>
        <Texto texto={texto} resaltar={resaltar} duracion={total * 0.5} />
      </div>
    </AbsoluteFill>
  );
};

// Traza cada línea en orden, como si una mano la dibujara
const Dibujo: React.FC<{ trazos: Trazo[]; duracion: number }> = ({ trazos, duracion }) => {
  const frame = useCurrentFrame();
  const largos = useMemo(() => trazos.map((t) => getLength(t.d)), [trazos]);
  // El dibujo se ajusta solo al espacio disponible, sea grande o chico
  const vista = useMemo(() => {
    const cajas = trazos.map((t) => getBoundingBox(t.d));
    const x1 = Math.min(...cajas.map((c) => c.x1)), y1 = Math.min(...cajas.map((c) => c.y1));
    const x2 = Math.max(...cajas.map((c) => c.x2)), y2 = Math.max(...cajas.map((c) => c.y2));
    return trazos.length ? `${x1 - 50} ${y1 - 50} ${x2 - x1 + 100} ${y2 - y1 + 100}` : "0 0 100 100";
  }, [trazos]);
  const totalLargo = largos.reduce((a, b) => a + b, 0) || 1;
  let acumulado = 0;
  const avance = interpolate(frame, [0, duracion], [0, totalLargo], { extrapolateRight: "clamp" });
  return (
    <svg viewBox={vista} style={{ width: "100%", height: "100%", padding: "70px 40px 70px 90px", boxSizing: "border-box" }}>
      {trazos.map((t, i) => {
        const largo = largos[i];
        const visible = Math.min(Math.max(avance - acumulado, 0), largo);
        acumulado += largo;
        if (visible <= 0) return null;
        return (
          <path key={i} d={t.d} stroke={t.stroke} strokeWidth={t.strokeWidth} fill="none"
            strokeLinecap="round" strokeLinejoin="round" strokeDasharray={largo} strokeDashoffset={largo - visible} />
        );
      })}
    </svg>
  );
};

// Texto que aparece palabra por palabra; las palabras de "resaltar" llevan marcador amarillo
const Texto: React.FC<{ texto: string; resaltar?: string; duracion: number }> = ({ texto, resaltar, duracion }) => {
  const frame = useCurrentFrame();
  const palabras = texto.split(/\s+/);
  const claves = new Set((resaltar ?? "").toLowerCase().split(/\s+/).filter(Boolean));
  const limpia = (p: string) => p.toLowerCase().replace(/[¿?¡!.,:;…"]/g, "");
  return (
    <div style={{ fontFamily: "Mano", fontSize: 76, lineHeight: 1.25, color: "#1f1f1f", textAlign: "center" }}>
      {palabras.map((p, i) => {
        const aparece = (i / palabras.length) * duracion;
        const o = interpolate(frame, [aparece, aparece + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const marcada = claves.has(limpia(p));
        const pinta = interpolate(frame, [aparece + 3, aparece + 12], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <span key={i} style={{
            opacity: o, display: "inline-block", margin: "0 9px", padding: "0 10px",
            transform: `translateY(${(1 - o) * 14}px)`,
            background: marcada
              ? `linear-gradient(90deg, #ffe14d ${pinta}%, rgba(255,255,255,0.92) ${pinta}%)`
              : "rgba(255,255,255,0.92)",
          }}>
            {p}
          </span>
        );
      })}
    </div>
  );
};
