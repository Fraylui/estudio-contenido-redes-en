import { Audio, Video } from "@remotion/media";
import { z } from "zod";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Una toma es un tramo de un video original (o una foto: .jpg/.png, con desde 0 y hasta = segundos en pantalla) que se muestra a pantalla completa en vertical.
//   desde/hasta: segundos del video original · velocidad: 0.6 = cámara lenta
//   zoom: [inicio, fin] · foco: altura (0 arriba, 1 abajo) o [inicio, fin] para un paneo vertical
//   x: posición horizontal (0 izquierda, 1 derecha) de lo importante en la imagen
//   libre: muestra el video entero y rellena con el mismo video desenfocado
export const tomaSchema = z.object({
  video: z.string(),
  desde: z.number(),
  hasta: z.number(),
  velocidad: z.number().optional(),
  zoom: z.tuple([z.number(), z.number()]).default([1.05, 1.15]),
  foco: z.union([z.number(), z.tuple([z.number(), z.number()])]).default(0.5),
  x: z.number().default(0.5),
  libre: z.boolean().optional(),
  silencio: z.boolean().optional(),
});
export type Toma = z.infer<typeof tomaSchema>;

// Cuadros que dura cada toma en el reel (la cámara lenta la alarga).
export const duracionToma = (t: Toma, fps: number) =>
  Math.round(((t.hasta - t.desde) / (t.velocidad ?? 1)) * fps);

const UnaToma: React.FC<{ toma: Toma; duracion: number; volumen: number; ancho: number; alto: number }> = ({
  toma,
  duracion,
  volumen,
  ancho: anchoVideo,
  alto: altoVideo,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vel = toma.velocidad ?? 1;
  const zoom = interpolate(frame, [0, duracion], toma.zoom, { extrapolateRight: "clamp" });
  const alto = height * zoom;
  const ancho = alto * (anchoVideo / altoVideo);
  const foco = Array.isArray(toma.foco)
    ? interpolate(frame, [0, duracion], toma.foco, {
        easing: (x) => x * x * (3 - 2 * x),
        extrapolateRight: "clamp",
      })
    : toma.foco;
  const left = Math.min(0, Math.max(width - ancho, width / 2 - toma.x * ancho));
  const top = toma.libre
    ? Math.min(170, height / 2 - foco * alto)
    : Math.min(0, Math.max(height - alto, height / 2 - foco * alto));
  const relleno = top + alto < height || top > 0 || ancho < width;
  const esFoto = /\.(jpe?g|png|webp)$/i.test(toma.video);
  const fuente = {
    src: staticFile(toma.video),
    trimBefore: Math.round(toma.desde * fps),
    playbackRate: vel,
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {relleno ? (
        <AbsoluteFill style={{ transform: "scale(1.25)", filter: "blur(38px) brightness(0.55)" }}>
          {esFoto ? (
            <Img src={fuente.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Video {...fuente} muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
          )}
        </AbsoluteFill>
      ) : null}
      <div style={{ position: "absolute", left, top, width: ancho, height: alto, overflow: "hidden" }}>
        {esFoto ? (
          <Img src={fuente.src} style={{ width: "100%", height: "100%" }} />
        ) : (
          <Video
            {...fuente}
            volume={toma.silencio ? 0 : volumen}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

// Destello blanco corto en cada corte.
const Destello = () => {
  const frame = useCurrentFrame();
  const opacidad = interpolate(frame, [0, 3, 10], [0, 0.85, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: opacidad }} />;
};

export const Tomas: React.FC<{
  tomas: Toma[];
  volumen: number;
  tamanos: Record<string, { ancho: number; alto: number }>;
}> = ({ tomas, volumen, tamanos }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const duraciones = tomas.map((t) => duracionToma(t, fps));
  const inicios = duraciones.map((_, i) => duraciones.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {tomas.map((t, i) => {
        const ultima = i === tomas.length - 1;
        const tam = tamanos[t.video] ?? { ancho: 1080, alto: 1920 };
        return (
          <Sequence
            key={i}
            from={inicios[i]}
            durationInFrames={ultima ? Math.max(1, durationInFrames - inicios[i]) : duraciones[i]}
          >
            <UnaToma toma={t} duracion={duraciones[i]} volumen={volumen} ancho={tam.ancho} alto={tam.alto} />
          </Sequence>
        );
      })}
      {inicios.slice(1).map((ini, i) => (
        <Sequence key={`d${i}`} from={ini - 3} durationInFrames={12}>
          <Destello />
        </Sequence>
      ))}
      {inicios.slice(1).map((ini, i) => (
        <Sequence key={`w${i}`} from={Math.max(0, ini - 9)} durationInFrames={20}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
