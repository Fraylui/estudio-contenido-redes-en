import { Audio } from "@remotion/media";
import {
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { useHayVoz } from "./Narracion";

// Música de fondo opcional: pon el archivo en public/musica/
// y escribe su nombre en el campo "musica" del JSON.
export const Musica: React.FC<{ archivo?: string }> = ({ archivo }) => {
  const { durationInFrames, fps } = useVideoConfig();
  // Con narración, la música queda de fondo para que se entienda la voz.
  const nivel = useHayVoz() ? 0.1 : 0.35;
  if (!archivo) {
    return null;
  }

  return (
    <Audio
      src={staticFile(`musica/${archivo}`)}
      loop
      volume={(f) =>
        interpolate(
          f,
          [0, fps, durationInFrames - fps, durationInFrames],
          [0, nivel, nivel, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
  );
};
