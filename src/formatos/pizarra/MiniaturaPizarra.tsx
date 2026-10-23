// Miniatura de YouTube (1280x720) para los videos de pizarra: dibujos de la biblioteca a la izquierda,
// 2 o 3 palabras gigantes a la derecha y una de ellas en un recuadro rojo. Pocas palabras, cara exagerada.
import { getBoundingBox } from "@remotion/paths";
import { z } from "zod";
import { AbsoluteFill, staticFile } from "remotion";
import { DIBUJOS, type DibujoPizarra } from "./dibujos";
import "../../marca";

export const miniaturaPizarraSchema = z.object({
  dibujo: z.string(),
  linea1: z.string(),
  // Palabra estrella, en blanco sobre rojo
  linea2: z.string(),
  fondo: z.string().optional(),
});

// El dibujo completo y quieto (sin animación), ajustado a su caja
const DibujoQuieto: React.FC<{ dibujo: DibujoPizarra }> = ({ dibujo }) => {
  const trazos = dibujo.trazos ?? [];
  const objetos = dibujo.objetos ?? [];
  const textos = dibujo.textos ?? [];
  const cajas = [
    ...trazos.map((t) => getBoundingBox(t.d)),
    ...objetos.map((o) => ({ x1: o.x - o.t / 2, y1: o.y - o.t / 2, x2: o.x + o.t / 2, y2: o.y + o.t / 2 })),
    ...textos.map((e) => ({ x1: e.x - e.texto.length * e.t * 0.27, y1: e.y - e.t * 0.8, x2: e.x + e.texto.length * e.t * 0.27, y2: e.y + e.t * 0.3 })),
  ];
  const x1 = Math.min(...cajas.map((c) => c.x1)) - 30, y1 = Math.min(...cajas.map((c) => c.y1)) - 30;
  const x2 = Math.max(...cajas.map((c) => c.x2)) + 30, y2 = Math.max(...cajas.map((c) => c.y2)) + 30;
  return (
    <svg viewBox={`${x1} ${y1} ${x2 - x1} ${y2 - y1}`} style={{ width: "100%", height: "100%" }}>
      {trazos.map((t, i) =>
        t.stroke === "none" ? <path key={i} d={t.d} fill={t.fill} /> : (
          <path key={i} d={t.d} stroke={t.stroke} strokeWidth={t.strokeWidth * 1.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ),
      )}
      {objetos.map((o, i) => (
        <image key={`o${i}`} href={staticFile(o.img.startsWith("doodle:") ? `assets/doodles/${o.img.slice(7)}.svg` : `objetos/${o.img}.svg`)}
          x={o.x - o.t / 2} y={o.y - o.t / 2} width={o.t} height={o.t} transform={`rotate(${o.rot ?? 0} ${o.x} ${o.y})`} />
      ))}
      {textos.map((e, i) => (
        <text key={`t${i}`} x={e.x} y={e.y} textAnchor="middle" fontFamily="Mano" fontSize={e.t} fill={e.color ?? "#1f1f1f"}
          transform={`rotate(${e.rot ?? 0} ${e.x} ${e.y})`}>{e.texto}</text>
      ))}
    </svg>
  );
};

export const MiniaturaPizarra: React.FC<z.infer<typeof miniaturaPizarraSchema>> = ({ dibujo, linea1, linea2, fondo }) => (
  <AbsoluteFill style={{ backgroundColor: fondo ?? "#ffe14d", flexDirection: "row", alignItems: "center", padding: "30px 40px" }}>
    <div style={{ width: 640, height: 640 }}>
      <DibujoQuieto dibujo={DIBUJOS[dibujo] ?? {}} />
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, fontFamily: "Titulo", textAlign: "center" }}>
      <div style={{ fontSize: 118, lineHeight: 0.95, color: "#1f1f1f" }}>{linea1}</div>
      <div style={{ fontSize: 132, lineHeight: 1, color: "#ffffff", background: "#d7263d", padding: "10px 26px 0", transform: "rotate(-3deg)", boxShadow: "8px 8px 0 #1f1f1f" }}>
        {linea2}
      </div>
    </div>
  </AbsoluteFill>
);
