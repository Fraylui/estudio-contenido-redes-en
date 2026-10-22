import { useVideoConfig } from "remotion";

// Las plantillas están diseñadas para 1080 px en el lado corto.
// Así el mismo diseño sirve en vertical (1080x1920) y horizontal (1920x1080).
export const useEscala = () => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  return {
    s,
    vertical: height > width,
    px: (valor: number) => valor * s,
  };
};
