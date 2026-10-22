import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { marca } from "../marca";

// Fondo degradado con dos manchas de color que se mueven despacio,
// para que el video nunca se vea estático.
export const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fondo, fondo2, primario, acento } = marca.colores;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${fondo} 0%, ${fondo2} 100%)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "70%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: acento,
          opacity: 0.18,
          filter: "blur(120px)",
          left: `${interpolate(Math.sin(frame / 90), [-1, 1], [-20, 30])}%`,
          top: `${interpolate(Math.cos(frame / 110), [-1, 1], [-10, 20])}%`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "60%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: primario,
          opacity: 0.12,
          filter: "blur(140px)",
          right: `${interpolate(Math.cos(frame / 80), [-1, 1], [-20, 20])}%`,
          bottom: `${interpolate(Math.sin(frame / 100), [-1, 1], [-15, 15])}%`,
        }}
      />
    </AbsoluteFill>
  );
};
