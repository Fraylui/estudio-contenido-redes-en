// Identidad del canal "Tu Quipu": foto de perfil (800x800) y banner de YouTube (2560x1440).
// Usa la misma mascota cerebro y los mismos colores que los videos de pizarra.
import { getBoundingBox } from "@remotion/paths";
import { AbsoluteFill } from "remotion";
import { cerebro, quipu, type Trazo } from "./trazos";
import "../../marca";

const Dibujo: React.FC<{ trazos: Trazo[]; style?: React.CSSProperties }> = ({ trazos, style }) => {
  const cajas = trazos.map((t) => getBoundingBox(t.d));
  const x1 = Math.min(...cajas.map((c) => c.x1)) - 20, y1 = Math.min(...cajas.map((c) => c.y1)) - 20;
  const x2 = Math.max(...cajas.map((c) => c.x2)) + 20, y2 = Math.max(...cajas.map((c) => c.y2)) + 20;
  return (
    <svg viewBox={`${x1} ${y1} ${x2 - x1} ${y2 - y1}`} style={style}>
      {trazos.map((t, i) =>
        t.stroke === "none" ? <path key={i} d={t.d} fill={t.fill} /> : (
          <path key={i} d={t.d} stroke={t.stroke} strokeWidth={t.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ),
      )}
    </svg>
  );
};

const PAPEL = "#f3efe6";
// La mascota sacando bíceps, parada sobre un quipu
const mascota = [...cerebro(0, 0, { cara: "feliz", pose: "musculos" }), ...quipu(-250, 250, 262, { largo: 110 })];

export const LogoCanal: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#ffe14d", alignItems: "center", justifyContent: "center" }}>
    <Dibujo trazos={mascota} style={{ width: 640, height: 640 }} />
  </AbsoluteFill>
);

export const BannerCanal: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: PAPEL }}>
    {/* Cuerdas de quipu de lado a lado, arriba (fuera de la zona segura: solo decoran en TV y escritorio) */}
    <Dibujo trazos={quipu(0, 2560, 30, { largo: 260 })} style={{ position: "absolute", top: 0, left: 0, width: 2560 }} />
    {/* Zona segura de YouTube: 1546x423 al centro; todo lo importante va ahí */}
    <div style={{ position: "absolute", left: 507, top: 508, width: 1546, height: 423, display: "flex", alignItems: "center", gap: 50 }}>
      <Dibujo trazos={cerebro(0, 0, { cara: "feliz", pose: "musculos" })} style={{ height: 400, width: 420, flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontFamily: "Titulo", fontSize: 190, lineHeight: 0.95, color: "#1f1f1f", letterSpacing: 2 }}>
          TU <span style={{ background: "#ffe14d", padding: "6px 22px 0", display: "inline-block", lineHeight: 1, transform: "rotate(-2deg)" }}>QUIPU</span>
        </div>
        <div style={{ fontFamily: "Mano", fontSize: 62, color: "#1f1f1f" }}>Lo que nadie te explicó, explicado fácil.</div>
        <div style={{ fontFamily: "Mano", fontSize: 46, color: "#d7263d" }}>Mente · Dinero · Amor · Curiosidades · Nuevo video cada semana</div>
      </div>
    </div>
  </AbsoluteFill>
);
