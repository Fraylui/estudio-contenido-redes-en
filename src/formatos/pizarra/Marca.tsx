// Identidad del canal "Khipu" (@tu_quipu): foto de perfil (800x800) y banner de YouTube (2560x1440).
// La marca es el khipu (cuerdas con nudos) y el nombre, no un personaje: el canal trata todos los temas.
import { getBoundingBox } from "@remotion/paths";
import { AbsoluteFill } from "remotion";
import { quipu, type Trazo } from "./trazos";
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
// Una "K" grande colgando de un khipu: se lee bien aunque el logo se vea diminuto
export const LogoCanal: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#ffe14d", alignItems: "center", justifyContent: "center" }}>
    <Dibujo trazos={quipu(-260, 260, 0, { largo: 150 })} style={{ position: "absolute", top: 120, width: 480 }} />
    <div style={{ fontFamily: "Titulo", fontSize: 400, lineHeight: 1, color: "#1f1f1f", marginTop: 200 }}>K</div>
  </AbsoluteFill>
);

export const BannerCanal: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: PAPEL }}>
    {/* Cuerdas de quipu de lado a lado, arriba (fuera de la zona segura: solo decoran en TV y escritorio) */}
    <Dibujo trazos={quipu(0, 2560, 30, { largo: 260 })} style={{ position: "absolute", top: 0, left: 0, width: 2560 }} />
    {/* Zona segura de YouTube: 1546x423 al centro; todo lo importante va ahí */}
    <div style={{ position: "absolute", left: 507, top: 508, width: 1546, height: 423, display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center", textAlign: "center" }}>
        <div style={{ fontFamily: "Titulo", fontSize: 170, lineHeight: 0.95, color: "#1f1f1f", letterSpacing: 2 }}>
          <span style={{ background: "#ffe14d", padding: "6px 22px 0", display: "inline-block", lineHeight: 1, transform: "rotate(-2deg)" }}>KHIPU</span>
        </div>
        <div style={{ fontFamily: "Mano", fontSize: 56, color: "#1f1f1f" }}>Lo que nadie te explicó, explicado fácil.</div>
        <div style={{ fontFamily: "Mano", fontSize: 50, color: "#d7263d" }}>Historias · Lugares · Curiosidades · Dinero · Tecnología · Emociones</div>
      </div>
    </div>
  </AbsoluteFill>
);
