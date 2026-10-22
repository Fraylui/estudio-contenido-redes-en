import {
  AbsoluteFill,
  Easing,
  getRemotionEnvironment,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useEscala } from "../../comun/escala";
import { marca } from "../../marca";
import { Estilo } from "./estilos";

export type Efecto = "acercar" | "alejar" | "izquierda" | "derecha";

const MOVIMIENTO: Record<Efecto, { escala: [number, number]; x: [number, number] }> = {
  acercar: { escala: [1, 1.15], x: [0, 0] },
  alejar: { escala: [1.15, 1], x: [0, 0] },
  izquierda: { escala: [1.12, 1.12], x: [4, -4] },
  derecha: { escala: [1.12, 1.12], x: [-4, 4] },
};

// Una escena: imagen con movimiento lento (efecto Ken Burns) que entra con un fundido.
// Mientras no haya imagen, muestra un fondo provisional para poder revisar los tiempos.
export const Escena: React.FC<{
  numero: number;
  imagen?: string;
  efecto: Efecto;
  estilo: Estilo;
  fundido: number;
}> = ({ numero, imagen, efecto, estilo, fundido }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { px, vertical } = useEscala();
  const m = MOVIMIENTO[efecto];
  const avance = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const dur = Math.max(durationInFrames, fundido + 1);

  const contenido = imagen ? (
    <Img
      src={staticFile(imagen)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : (
    <Provisional numero={numero} estilo={estilo} />
  );

  if (estilo.imagen === "tarjeta") {
    // Estilo dibujo: la imagen "salta" a escena dentro de un cuadro con borde grueso
    return (
      <AbsoluteFill
        style={{
          backgroundColor: estilo.fondo,
          // En horizontal el cuadro sube para dejar espacio a los subtítulos
          justifyContent: vertical ? "center" : "flex-start",
          alignItems: "center",
          padding: px(70),
          paddingTop: px(vertical ? 70 : 120),
        }}
      >
        <div
          style={{
            ...(vertical ? { width: "100%" } : { height: "64%" }),
            aspectRatio: "4 / 3",
            border: `${px(10)}px solid ${estilo.subtituloBorde}`,
            borderRadius: px(18),
            overflow: "hidden",
            boxShadow: `${px(14)}px ${px(14)}px 0 ${estilo.subtituloBorde}`,
            scale: interpolate(frame, [0, 14], [0.6, 1], {
              ...avance,
              easing: Easing.spring({ damping: 11 }),
            }),
            rotate: interpolate(frame, [0, 14], [numero % 2 ? "-4deg" : "4deg", "0deg"], avance),
            opacity: interpolate(frame, [0, 6], [0, 1], avance),
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              scale: interpolate(frame, [0, dur], [1, 1.06], avance),
            }}
          >
            {contenido}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: estilo.fondo,
        opacity: fundido > 0 ? interpolate(frame, [0, fundido], [0, 1], avance) : 1,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          scale: interpolate(frame, [0, dur], m.escala, {
            ...avance,
            easing: Easing.inOut(Easing.quad),
          }),
          translate: interpolate(frame, [0, dur], [`${m.x[0]}% 0%`, `${m.x[1]}% 0%`], avance),
        }}
      >
        {contenido}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Provisional: React.FC<{ numero: number; estilo: Estilo }> = ({ numero, estilo }) => {
  const { px } = useEscala();
  const oscuro = estilo.imagen === "cine";
  return (
    <AbsoluteFill
      style={{
        background: oscuro
          ? `radial-gradient(ellipse at ${30 + ((numero * 23) % 40)}% 40%, #1c3a3a 0%, #0a1416 45%, #020304 100%)`
          : `linear-gradient(135deg, #fff6d6 0%, #ffe08a 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Solo se ve en Remotion Studio, nunca en el video final */}
      {getRemotionEnvironment().isStudio ? (
        <div
          style={{
            fontFamily: marca.fuentes.texto,
            fontWeight: 700,
            fontSize: px(36),
            color: oscuro ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
          }}
        >
          Imagen pendiente · escena {String(numero).padStart(2, "0")}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
