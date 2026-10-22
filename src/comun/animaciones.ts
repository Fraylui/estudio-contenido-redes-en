import { Easing, interpolate } from "remotion";

const suave = Easing.bezier(0.16, 1, 0.3, 1);

// Entrada desde abajo con desvanecido, empezando en `inicio` (en frames).
export const entrada = (frame: number, inicio: number, duracion = 15) => ({
  opacity: interpolate(frame, [inicio, inicio + duracion], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: suave,
  }),
  translate: interpolate(
    frame,
    [inicio, inicio + duracion],
    ["0px 60px", "0px 0px"],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave },
  ),
});

// Golpe de escala (de grande a normal) para números y revelaciones.
export const golpe = (frame: number, inicio: number, duracion = 12) => ({
  opacity: interpolate(frame, [inicio, inicio + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }),
  scale: interpolate(frame, [inicio, inicio + duracion], [1.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 12 }),
  }),
});
