// Protagonista fijo del canal (plan del 29 oct): siempre idéntico en todos los videos, dibujado en código.
// Cabeza blanca grande, cuerpo simple y su sello: una bufanda-quipu (cordón rojo con tres cuerdas anudadas).
// Cambia solo la cara, la pose y el vestuario de la época; los fondos los pone FLUX (sin personas).
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export type CaraKhipu = "normal" | "feliz" | "asustado" | "enojado" | "triste" | "decidido" | "sorprendido";
export type PoseKhipu = "abajo" | "senala" | "arriba" | "pensando" | "cadera";
export type VestuarioKhipu = "base" | "romano" | "inca" | "biblico" | "explorador";
export type ObjetoKhipu = "lanza" | "escudo" | "pergamino" | "antorcha" | "bolsa" | "espada";

const TINTA = "#1d1b1a";
const T = 7; // grosor del contorno

const ROPA: Record<VestuarioKhipu, { tunica: string; borde: string }> = {
  base: { tunica: "#2f5d8a", borde: "#244a6e" },
  romano: { tunica: "#b3262b", borde: "#8c1d21" },
  inca: { tunica: "#c8462e", borde: "#e3b23c" },
  biblico: { tunica: "#d8c3a0", borde: "#a8865a" },
  explorador: { tunica: "#8a6a3d", borde: "#6b512c" },
};

const Cara: React.FC<{ cara: CaraKhipu; parpadeo: number; habla: number }> = ({ cara, parpadeo, habla }) => {
  const ojoY = 98;
  const ojos = (() => {
    if (cara === "feliz")
      return (
        <g stroke={TINTA} strokeWidth={6} fill="none" strokeLinecap="round">
          <path d="M70 100 q10 -12 20 0" />
          <path d="M110 100 q10 -12 20 0" />
        </g>
      );
    if (cara === "asustado" || cara === "sorprendido")
      return (
        <g>
          <circle cx={80} cy={ojoY} r={14} fill="#fff" stroke={TINTA} strokeWidth={5} />
          <circle cx={120} cy={ojoY} r={14} fill="#fff" stroke={TINTA} strokeWidth={5} />
          <circle cx={80} cy={ojoY} r={4} fill={TINTA} />
          <circle cx={120} cy={ojoY} r={4} fill={TINTA} />
        </g>
      );
    return (
      <g fill={TINTA}>
        <ellipse cx={80} cy={ojoY} rx={7} ry={9 * parpadeo} />
        <ellipse cx={120} cy={ojoY} rx={7} ry={9 * parpadeo} />
        <circle cx={82} cy={ojoY - 3} r={2.2} fill="#fff" opacity={parpadeo} />
        <circle cx={122} cy={ojoY - 3} r={2.2} fill="#fff" opacity={parpadeo} />
      </g>
    );
  })();
  const cejas: Record<CaraKhipu, string> = {
    normal: "M68 80 l22 -2 M110 78 l22 2",
    feliz: "M68 78 q11 -6 22 0 M110 78 q11 -6 22 0",
    asustado: "M66 74 q12 -10 24 -2 M110 72 q12 -8 24 2",
    sorprendido: "M66 72 q12 -8 24 0 M110 72 q12 -8 24 0",
    enojado: "M66 74 l26 10 M108 84 l26 -10",
    triste: "M68 84 l22 -8 M110 76 l22 8",
    decidido: "M66 80 l26 4 M108 84 l26 -4",
  };
  const bocas: Record<CaraKhipu, React.ReactNode> = {
    normal: <path d="M88 128 q12 8 24 0" />,
    feliz: <path d="M80 122 q20 26 40 0 z" fill={TINTA} />,
    asustado: <ellipse cx={100} cy={132} rx={9} ry={12} fill={TINTA} />,
    sorprendido: <ellipse cx={100} cy={132} rx={11} ry={14} fill={TINTA} />,
    enojado: <path d="M84 134 q16 -12 32 0" />,
    triste: <path d="M86 136 q14 -12 28 0" />,
    decidido: <path d="M88 130 l20 -2 q6 0 8 -6" />,
  };
  return (
    <g>
      {ojos}
      <path d={cejas[cara]} stroke={TINTA} strokeWidth={6} strokeLinecap="round" fill="none" />
      {/* Mientras habla, la boca se abre según el volumen de la voz (no en las caras que ya tienen la boca abierta) */}
      {habla > 0.08 && cara !== "asustado" && cara !== "sorprendido" ? (
        <ellipse cx={100} cy={130} rx={8 + habla * 6} ry={3 + habla * 11} fill={TINTA} />
      ) : (
        <g stroke={TINTA} strokeWidth={5} strokeLinecap="round" fill="none">
          {bocas[cara]}
        </g>
      )}
      {cara === "asustado" && <path d="M150 74 q8 14 0 20 q-8 -6 0 -20" fill="#7cc4f0" stroke={TINTA} strokeWidth={3} />}
      {cara === "triste" && <path d="M78 110 q5 10 0 14 q-5 -4 0 -14" fill="#7cc4f0" stroke={TINTA} strokeWidth={3} />}
      {(cara === "feliz" || cara === "normal") && (
        <g fill="#f29b9b" opacity={0.55}>
          <ellipse cx={64} cy={118} rx={10} ry={6} />
          <ellipse cx={136} cy={118} rx={10} ry={6} />
        </g>
      )}
    </g>
  );
};

// Brazos: [hombro → codo → mano] para izquierda y derecha (en coordenadas del dibujo de 200×420)
const BRAZOS: Record<PoseKhipu, [string, string]> = {
  abajo: ["M64 196 q-22 40 -24 86", "M136 196 q22 40 24 86"],
  senala: ["M64 196 q-22 40 -24 86", "M136 196 q40 -10 70 -46"],
  arriba: ["M64 196 q-30 -30 -30 -80", "M136 196 q30 -30 30 -80"],
  pensando: ["M64 196 q-22 40 -24 86", "M136 196 q34 14 -24 -44"],
  cadera: ["M64 196 q-44 22 -6 60", "M136 196 q44 22 6 60"],
};
const MANOS: Record<PoseKhipu, [number, number][]> = {
  abajo: [[40, 284], [160, 284]],
  senala: [[40, 284], [206, 150]],
  arriba: [[34, 116], [166, 116]],
  pensando: [[40, 284], [112, 152]],
  cadera: [[58, 256], [142, 256]],
};

const Sombrero: React.FC<{ v: VestuarioKhipu }> = ({ v }) => {
  if (v === "romano")
    return (
      <g stroke={TINTA} strokeWidth={T} strokeLinejoin="round">
        <path d="M100 -10 q-30 0 -40 26 q40 -14 80 0 q-10 -26 -40 -26 z" fill="#c42a2f" />
        <path d="M34 78 q0 -66 66 -66 q66 0 66 66 l-14 0 q-6 -44 -52 -44 q-46 0 -52 44 z" fill="#d9a63a" />
        <path d="M44 76 l-8 44 l18 -6 l2 -38 z M156 76 l8 44 l-18 -6 l-2 -38 z" fill="#d9a63a" />
      </g>
    );
  if (v === "inca")
    return (
      <g stroke={TINTA} strokeWidth={T} strokeLinejoin="round">
        <path d="M36 74 q0 -64 64 -64 q64 0 64 64 z" fill="#c8462e" />
        <path d="M44 56 h112" stroke="#e3b23c" strokeWidth={10} />
        <path d="M48 40 h104" stroke="#2e8a6b" strokeWidth={8} />
        <path d="M36 74 q-6 40 6 60 l14 -4 q-6 -30 -4 -56 z M164 74 q6 40 -6 60 l-14 -4 q6 -30 4 -56 z" fill="#c8462e" />
        <circle cx={100} cy={6} r={10} fill="#e3b23c" />
        <path d="M42 134 v26 M158 134 v26" stroke={TINTA} strokeWidth={4} />
        <circle cx={42} cy={164} r={6} fill="#e3b23c" />
        <circle cx={158} cy={164} r={6} fill="#e3b23c" />
      </g>
    );
  if (v === "biblico")
    return (
      <g stroke={TINTA} strokeWidth={T} strokeLinejoin="round">
        <path d="M30 96 q-4 -84 70 -84 q74 0 70 84 l-14 70 l-8 -96 q-10 -40 -48 -40 q-38 0 -48 40 l-8 96 z" fill="#efe3c8" />
        <path d="M40 62 q60 -22 120 0" stroke="#a8865a" strokeWidth={9} fill="none" />
      </g>
    );
  if (v === "explorador")
    return (
      <g stroke={TINTA} strokeWidth={T} strokeLinejoin="round">
        <ellipse cx={100} cy={48} rx={86} ry={16} fill="#8a6a3d" />
        <path d="M50 46 q2 -46 50 -46 q48 0 50 46 z" fill="#a07c48" />
        <path d="M52 38 h96" stroke="#5a3f1f" strokeWidth={9} />
      </g>
    );
  return null;
};

// Objeto en la mano derecha (coordenadas de la mano de cada pose)
const Objeto: React.FC<{ o: ObjetoKhipu; x: number; y: number }> = ({ o, x, y }) => {
  const g = { stroke: TINTA, strokeWidth: 5, strokeLinejoin: "round" as const };
  if (o === "lanza") return <g {...g}><path d={`M${x} ${y + 90} L${x} ${y - 150}`} strokeWidth={8} /><path d={`M${x - 12} ${y - 140} L${x} ${y - 185} L${x + 12} ${y - 140} z`} fill="#c9ccd1" /></g>;
  if (o === "espada") return <g {...g}><path d={`M${x} ${y} L${x + 8} ${y - 95}`} strokeWidth={11} stroke="#c9ccd1" /><path d={`M${x - 16} ${y - 4} L${x + 18} ${y - 8}`} strokeWidth={8} /></g>;
  if (o === "escudo") return <g {...g}><rect x={x - 38} y={y - 60} width={76} height={110} rx={12} fill="#b3262b" /><circle cx={x} cy={y - 5} r={13} fill="#d9a63a" /></g>;
  if (o === "pergamino") return <g {...g}><rect x={x - 26} y={y - 34} width={52} height={60} fill="#f1e2bd" /><rect x={x - 32} y={y - 40} width={64} height={11} rx={5} fill="#c9a66b" /><rect x={x - 32} y={y + 22} width={64} height={11} rx={5} fill="#c9a66b" /></g>;
  if (o === "antorcha") return <g {...g}><path d={`M${x} ${y + 40} L${x} ${y - 40}`} strokeWidth={10} stroke="#6b4a2b" /><path d={`M${x} ${y - 90} q-24 30 0 50 q24 -20 0 -50`} fill="#ff9a1f" /></g>;
  return <g {...g}><path d={`M${x - 24} ${y + 4} q24 -30 48 0 l6 44 q-30 12 -60 0 z`} fill="#a07c48" /><path d={`M${x - 12} ${y - 2} h24`} /></g>;
};

export const Khipu: React.FC<{
  cara?: CaraKhipu;
  pose?: PoseKhipu;
  vestuario?: VestuarioKhipu;
  alto?: number; // alto en píxeles
  animado?: boolean; // respira y parpadea
  espejo?: boolean; // mira a la izquierda
  habla?: number; // 0-1: apertura de la boca según el volumen de la voz
  paso?: number; // fase de caminar (radianes); undefined = quieto
  objeto?: ObjetoKhipu;
  secundario?: boolean; // otro personaje de la escena: sin la bufanda-quipu (esa es solo del protagonista)
}> = ({ cara = "normal", pose = "abajo", vestuario = "base", alto = 600, animado = true, espejo = false, habla = 0, paso, objeto, secundario = false }) => {
  const f = useCurrentFrame();
  const respira = animado ? Math.sin(f / 14) * 3 : 0;
  const parpadeo = animado ? interpolate(f % 96, [0, 3, 6], [1, 0.1, 1], { extrapolateRight: "clamp" }) : 1;
  const ropa = ROPA[vestuario];
  const [bi, bd] = BRAZOS[pose];
  return (
    <svg viewBox="-50 -20 300 460" height={alto} style={{ overflow: "visible", transform: espejo ? "scaleX(-1)" : undefined }}>
      <ellipse cx={100} cy={420} rx={70} ry={12} fill="#000" opacity={0.22} />
      {/* piernas */}
      {[[84, -8, 1], [116, 8, -1]].map(([x, dx, lado], i) => {
        const giro = paso === undefined ? 0 : Math.sin(paso) * 26 * lado; // piernas en tijera al caminar
        return (
          <g key={i} transform={`rotate(${giro} ${x} 320)`}>
            <path d={`M${x} 320 l${dx} 92`} stroke={TINTA} strokeWidth={14} strokeLinecap="round" fill="none" />
            <ellipse cx={x + dx * 1.75} cy={414} rx={18} ry={9} fill={vestuario === "romano" || vestuario === "inca" ? "#5a3f1f" : TINTA} />
          </g>
        );
      })}
      <g transform={`translate(0 ${respira})`}>
        {/* túnica */}
        <path
          d="M68 186 q32 -14 64 0 l20 140 q-52 14 -104 0 z"
          fill={ropa.tunica}
          stroke={TINTA}
          strokeWidth={T}
          strokeLinejoin="round"
        />
        <path d="M52 314 q48 12 96 0" stroke={ropa.borde} strokeWidth={9} fill="none" />
        {vestuario === "romano" && <path d="M60 262 h80" stroke="#5a3f1f" strokeWidth={10} />}
        {vestuario === "inca" && (
          <g fill="#e3b23c" stroke={TINTA} strokeWidth={3}>
            <rect x={86} y={236} width={12} height={12} />
            <rect x={102} y={236} width={12} height={12} fill="#2e8a6b" />
            <rect x={94} y={258} width={12} height={12} />
          </g>
        )}
        {/* bufanda-quipu: el sello del personaje en todas las épocas */}
        <g stroke={TINTA} strokeWidth={4} opacity={secundario ? 0 : 1}>
          <path d="M70 182 q30 14 60 0 l2 12 q-32 16 -64 0 z" fill="#d63a2f" />
          {[
            [92, "#d63a2f"],
            [102, "#e3b23c"],
            [112, "#2e8a6b"],
          ].map(([x, c], i) => (
            <g key={i}>
              <path d={`M${x} 196 q${(i - 1) * 4} 30 ${(i - 1) * 6} 58`} stroke={c as string} strokeWidth={6} fill="none" />
              <circle cx={(x as number) + (i - 1) * 3} cy={222} r={5} fill={c as string} />
              <circle cx={(x as number) + (i - 1) * 5} cy={242} r={5} fill={c as string} />
            </g>
          ))}
        </g>
        {/* brazos (delante de la túnica) */}
        <g stroke={TINTA} strokeWidth={13} strokeLinecap="round" fill="none">
          <path d={bi} />
          <path d={bd} />
        </g>
        {objeto ? <Objeto o={objeto} x={MANOS[pose][1][0]} y={MANOS[pose][1][1]} /> : null}
        {MANOS[pose].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={11} fill="#fff" stroke={TINTA} strokeWidth={5} />
        ))}
        {/* cabeza */}
        <circle cx={100} cy={100} r={68} fill="#fffaf2" stroke={TINTA} strokeWidth={T} />
        <Cara cara={cara} parpadeo={parpadeo} habla={habla} />
        <Sombrero v={vestuario} />
      </g>
    </svg>
  );
};
