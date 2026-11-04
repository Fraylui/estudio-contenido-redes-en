// Fichas para aprobar el personaje: todas sus caras y vestuarios, y una prueba sobre un fondo FLUX.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Khipu, type CaraKhipu, type PoseKhipu, type VestuarioKhipu } from "./Khipu";

const CARAS: CaraKhipu[] = ["normal", "feliz", "sorprendido", "asustado", "enojado", "triste", "decidido"];
const VESTUARIOS: [VestuarioKhipu, PoseKhipu, string][] = [
  ["base", "senala", "Base"],
  ["romano", "cadera", "Roma"],
  ["inca", "arriba", "Inca"],
  ["biblico", "pensando", "Tiempos bíblicos"],
  ["explorador", "abajo", "Explorador"],
];
const texto: React.CSSProperties = { fontFamily: "sans-serif", fontWeight: 800, color: "#3a2e22", textAlign: "center" };

export const FichaKhipu: React.FC = () => (
  <AbsoluteFill style={{ background: "#f3e7cf", padding: 40 }}>
    <div style={{ ...texto, fontSize: 64 }}>KHIPU · personaje fijo</div>
    <div style={{ display: "flex", justifyContent: "space-around", marginTop: 20 }}>
      {CARAS.map((c) => (
        <div key={c}>
          <Khipu cara={c} alto={360} animado={false} />
          <div style={{ ...texto, fontSize: 30 }}>{c}</div>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "space-around", marginTop: 30 }}>
      {VESTUARIOS.map(([v, p, n]) => (
        <div key={v}>
          <Khipu vestuario={v} pose={p} cara={v === "romano" ? "decidido" : v === "inca" ? "feliz" : "normal"} alto={440} animado={false} />
          <div style={{ ...texto, fontSize: 32 }}>{n}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

export const KhipuEnEscena: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Img src={staticFile("assets/ia/ata05-caminos.jpg")} style={{ height: "100%", objectFit: "cover", objectPosition: "60% 50%", filter: "sepia(0.35) saturate(0.9)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(transparent 55%, rgba(0,0,0,0.45))" }} />
    <div style={{ position: "absolute", top: 230, width: "100%", ...texto, color: "#fff", fontSize: 76, lineHeight: 1.1, textShadow: "0 4px 12px #000" }}>
      Tienes 7 días para
      <br />
      <span style={{ color: "#FFD23F" }}>cruzar los Andes</span>
    </div>
    <div style={{ position: "absolute", bottom: 120, left: 120 }}>
      <Khipu vestuario="inca" pose="senala" cara="asustado" alto={1050} animado={false} />
    </div>
  </AbsoluteFill>
);
