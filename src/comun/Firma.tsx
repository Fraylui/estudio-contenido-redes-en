import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { marca } from "../marca";
import { useEscala } from "./escala";

// Tu @usuario siempre visible y una barra de progreso abajo.
// La barra hace que la gente se quede hasta el final.
export const Firma: React.FC<{ colorTexto?: string; colorBarra?: string }> = ({
  colorTexto = marca.colores.textoSuave,
  colorBarra = marca.colores.primario,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { px, vertical } = useEscala();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: px(vertical ? 110 : 50),
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: marca.fuentes.texto,
          fontWeight: 700,
          fontSize: px(34),
          color: colorTexto,
          letterSpacing: px(1),
        }}
      >
        {marca.usuario}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: px(10),
          width: `${(frame / (durationInFrames - 1)) * 100}%`,
          background: colorBarra,
        }}
      />
    </AbsoluteFill>
  );
};
