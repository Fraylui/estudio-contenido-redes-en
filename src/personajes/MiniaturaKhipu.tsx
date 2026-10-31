// Miniatura con el personaje fijo (lección de Axen, 29 oct): fondo FLUX con colores vivos, el personaje grande con una
// emoción fuerte y 0-3 palabras gigantes. Nunca explica: muestra una situación que da risa, miedo o tensión.
import React from "react";
import { z } from "zod";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Khipu } from "./Khipu";

export const miniaturaKhipuSchema = z.object({
  fondo: z.string(), // nombre en public/assets/ia/<fondo>.jpg
  texto: z.string(), // 0-3 palabras
  color: z.string().optional(), // color de las letras
  cara: z.enum(["normal", "feliz", "asustado", "enojado", "triste", "decidido", "sorprendido"]),
  pose: z.enum(["abajo", "senala", "arriba", "pensando", "cadera"]),
  vestuario: z.enum(["base", "romano", "inca", "biblico", "explorador"]),
  lado: z.enum(["izquierda", "derecha"]).optional(),
});

export const MiniaturaKhipu: React.FC<z.infer<typeof miniaturaKhipuSchema>> = ({ fondo, texto, color = "#FFD23F", cara, pose, vestuario, lado = "izquierda" }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Img src={staticFile(`assets/ia/${fondo}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.25) contrast(1.08)" }} />
    <div style={{
      position: "absolute", top: 30, width: "100%", textAlign: "center", fontFamily: "sans-serif", fontWeight: 900,
      fontSize: 132, lineHeight: 1, color, WebkitTextStroke: "10px #111", paintOrder: "stroke fill",
      textShadow: "0 8px 0 #111", letterSpacing: 2,
    }}>{texto}</div>
    <div style={{ position: "absolute", bottom: -30, [lado === "izquierda" ? "left" : "right"]: 40, filter: "drop-shadow(0 0 6px #fff)" }}>
      <Khipu cara={cara} pose={pose} vestuario={vestuario} alto={640} animado={false} espejo={lado === "derecha"} />
    </div>
  </AbsoluteFill>
);
