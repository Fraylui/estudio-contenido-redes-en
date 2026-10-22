import { Audio } from "@remotion/media";
import {
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";

// Música de fondo opcional: pon el archivo en public/musica/
// y escribe su nombre en el campo "musica" del JSON.
export const Musica: React.FC<{ archivo?: string }> = ({ archivo }) => {
  const { durationInFrames, fps } = useVideoConfig();
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
          [0, 0.35, 0.35, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
  );
};
