// Identidad del canal "Khipu" (@tu_quipu): foto de perfil (800x800) y banner de YouTube (2560x1440).
// La marca es el logotipo "khipu" con la chispa amarilla (public/assets/marca), sin mascota ni motivos de un solo lugar:
// el canal trata todos los temas, y el banner los muestra como tarjetas de colores.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ICONOS } from "./iconos.gen";
import "../../marca";

const NEGRO = "#111111";
const AMARILLO = "#ffd600";

export const LogoCanal: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NEGRO, alignItems: "center", justifyContent: "center" }}>
    <Img src={staticFile("assets/marca/khipu-blanco.png")} style={{ width: 592, marginTop: 16 }} />
  </AbsoluteFill>
);

// Cada tema con su ícono (Tabler, MIT) y su color
const TEMAS = [
  { nombre: "Historias", icono: "history", color: "#ff8fab" },
  { nombre: "Lugares", icono: "map-pin", color: "#7ec8ff" },
  { nombre: "Curiosidades", icono: "bulb", color: "#ffd600" },
  { nombre: "Dinero", icono: "coin", color: "#8be3b0" },
  { nombre: "Tecnología", icono: "cpu", color: "#b9a6ff" },
  { nombre: "Emociones", icono: "heart", color: "#ff9f6b" },
];

const Icono: React.FC<{ nombre: string; tam: number; color?: string; grosor?: number }> = ({ nombre, tam, color = NEGRO, grosor = 2 }) => (
  <svg viewBox="0 0 24 24" width={tam} height={tam} fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round">
    {(ICONOS[nombre] ?? []).map((d, i) => <path key={i} d={d} />)}
  </svg>
);

// Tarjetas flotantes alrededor del centro: [tema, x, y, tamaño, giro]. Las de los costados solo se ven en TV y escritorio.
const TARJETAS: [number, number, number, number, number][] = [
  [0, 250, 330, 230, -10], [1, 2080, 300, 250, 8], [2, 330, 960, 210, 7],
  [3, 2190, 1070, 230, -8], [4, 70, 640, 170, 12], [5, 2330, 640, 180, -12],
  [1, 820, 120, 120, 10], [3, 1660, 140, 130, -9], [5, 900, 1190, 120, -6], [0, 1600, 1180, 130, 9],
];

const chispa = "M0,-1 C0.12,-0.12 0.12,-0.12 1,0 C0.12,0.12 0.12,0.12 0,1 C-0.12,0.12 -0.12,0.12 -1,0 C-0.12,-0.12 -0.12,-0.12 0,-1Z";
const CHISPAS = [[640, 520, 46], [1930, 560, 40], [560, 1140, 30], [2250, 1260, 52], [150, 140, 40], [1280, 110, 28]];

export const BannerCanal: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, #23232e 0%, ${NEGRO} 62%)` }}>
    {/* Manchas de color muy suaves que le dan profundidad */}
    {[["#ffd600", 380, 260], ["#ff8fab", 2180, 260], ["#7ec8ff", 400, 1180], ["#8be3b0", 2160, 1180]].map(([c, x, y], i) => (
      <div key={i} style={{ position: "absolute", left: Number(x) - 380, top: Number(y) - 380, width: 760, height: 760, borderRadius: "50%", background: String(c), opacity: 0.13, filter: "blur(140px)" }} />
    ))}
    <svg width={2560} height={1440} style={{ position: "absolute" }}>
      {CHISPAS.map(([x, y, r], i) => (
        <path key={i} d={chispa} transform={`translate(${x} ${y}) scale(${r})`} fill={AMARILLO} opacity={i % 2 ? 0.45 : 0.9} />
      ))}
    </svg>
    {TARJETAS.map(([t, x, y, tam, giro], i) => (
      <div
        key={i}
        style={{
          position: "absolute", left: x - tam / 2, top: y - tam / 2, width: tam, height: tam, borderRadius: tam * 0.26,
          background: TEMAS[t].color, rotate: `${giro}deg`, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 24px 50px rgba(0,0,0,0.45), inset 0 -8px 0 rgba(0,0,0,0.12)", opacity: tam < 150 ? 0.75 : 1,
        }}
      >
        <Icono nombre={TEMAS[t].icono} tam={tam * 0.56} grosor={2.1} />
      </div>
    ))}
    {/* Zona segura de YouTube: 1546x423 al centro; todo lo importante va ahí */}
    <div style={{ position: "absolute", left: 507, top: 508, width: 1546, height: 423, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}>
      <Img src={staticFile("assets/marca/khipu-blanco.png")} style={{ height: 230 }} />
      <div style={{ fontFamily: "Texto", fontWeight: 800, fontSize: 52, color: "#ffffff", letterSpacing: 0.5 }}>
        Lo que nadie te explicó, <span style={{ color: AMARILLO }}>explicado fácil.</span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {TEMAS.map((t) => (
          <div key={t.nombre} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 16px 6px 8px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: `2px solid ${t.color}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icono nombre={t.icono} tam={24} grosor={2.4} />
            </div>
            <span style={{ fontFamily: "Texto", fontWeight: 700, fontSize: 27, color: "#ffffff" }}>{t.nombre}</span>
          </div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);
