// Identidad del canal "Khipu" (@tu_quipu): foto de perfil (800x800) y banner de YouTube (2560x1440).
// La marca es el logotipo "khipu" con la chispa amarilla (public/assets/marca), sin mascota ni motivos de un solo lugar:
// el canal trata todos los temas.
import { AbsoluteFill, Img, staticFile } from "remotion";
import "../../marca";

const NEGRO = "#111111";
const AMARILLO = "#ffd600";

export const LogoCanal: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NEGRO, alignItems: "center", justifyContent: "center" }}>
    <Img src={staticFile("assets/marca/khipu-blanco.png")} style={{ width: 592, marginTop: 16 }} />
  </AbsoluteFill>
);

// Chispas de cuatro puntas como la del logotipo, repartidas fuera de la zona segura (solo decoran en TV y escritorio)
const CHISPAS = [
  [180, 260, 90], [420, 1120, 60], [760, 180, 40], [2380, 300, 80], [2150, 1180, 70], [1820, 140, 45], [300, 760, 35], [2440, 820, 40],
];
const chispa = "M0,-1 C0.12,-0.12 0.12,-0.12 1,0 C0.12,0.12 0.12,0.12 0,1 C-0.12,0.12 -0.12,0.12 -1,0 C-0.12,-0.12 -0.12,-0.12 0,-1Z";

export const BannerCanal: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NEGRO }}>
    <svg width={2560} height={1440} style={{ position: "absolute" }}>
      {CHISPAS.map(([x, y, r], i) => (
        <path key={i} d={chispa} transform={`translate(${x} ${y}) scale(${r})`} fill={AMARILLO} opacity={i % 2 ? 0.35 : 0.8} />
      ))}
    </svg>
    {/* Zona segura de YouTube: 1546x423 al centro; todo lo importante va ahí */}
    <div style={{ position: "absolute", left: 507, top: 508, width: 1546, height: 423, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
      <Img src={staticFile("assets/marca/khipu-blanco.png")} style={{ height: 210 }} />
      <div style={{ fontFamily: "Texto", fontWeight: 800, fontSize: 54, color: "#ffffff" }}>Lo que nadie te explicó, explicado fácil.</div>
      <div style={{ fontFamily: "Texto", fontWeight: 700, fontSize: 40, color: AMARILLO, letterSpacing: 1 }}>
        Historias · Lugares · Curiosidades · Dinero · Tecnología · Emociones
      </div>
    </div>
  </AbsoluteFill>
);
