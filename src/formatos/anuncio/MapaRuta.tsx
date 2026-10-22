import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useEscala } from "../../comun/escala";
import { marca } from "../../marca";

// Mapa esquemático (no a escala): la ruta baja desde la sierra (origen) hasta la selva,
// y los destinos aparecen uno por uno con un check. No depende de mapas externos.
export const MapaRuta: React.FC<{
  origen: string;
  destinos: string[];
  color: string;
  acento: string;
  // Foto de fondo opcional (por ejemplo, del lugar de destino) en lugar de las montañas dibujadas
  fondo?: string;
}> = ({ origen, destinos, color, acento, fondo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { px, vertical } = useEscala();
  const recorrido = interpolate(frame, [6, 1.6 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const inicioDestinos = 1.4 * fps;
  const pasoDestino = Math.max(2, Math.floor((2.6 * fps) / destinos.length));
  const columnas = vertical ? 2 : 3;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #dfe9f5 0%, #dfe9f5 32%, #2f8f46 32%, #1f6b33 100%)" }}>
      {fondo ? (
        <AbsoluteFill style={{ scale: interpolate(frame, [0, 6 * fps], [1.05, 1.18]) }}>
          <Img
            src={staticFile(fondo)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              // Un poco de desenfoque disimula fotos de baja resolución y hace legibles los textos
              filter: "blur(3px) brightness(0.8) saturate(1.2)",
            }}
          />
        </AbsoluteFill>
      ) : null}
      {/* Montañas de la sierra con nieve */}
      {fondo ? null : <svg
        viewBox="0 0 1080 700"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: vertical ? "37%" : "45%" }}
        preserveAspectRatio="none"
      >
        <path d="M0 620 L180 300 L300 460 L470 180 L640 470 L780 300 L1080 620 Z" fill="#8a93a3" />
        <path d="M470 180 L420 270 L470 250 L520 280 Z M180 300 L145 365 L190 345 L225 380 Z M780 300 L745 360 L790 345 L825 370 Z" fill="#ffffff" />
      </svg>}

      {/* Carretera que baja serpenteando */}
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none">
        <path
          d="M540 260 C 300 420, 820 560, 540 700 S 260 980, 540 1080"
          fill="none"
          stroke="#333333"
          strokeWidth={46}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={recorrido}
        />
        <path
          d="M540 260 C 300 420, 820 560, 540 700 S 260 980, 540 1080"
          fill="none"
          stroke={acento}
          strokeWidth={8}
          strokeDasharray="0.02 0.02"
          pathLength={1}
          // Las líneas amarillas del centro aparecen cuando la carretera ya está dibujada
          opacity={recorrido < 0.01 ? 1 : 0}
        />
      </svg>

      {/* Origen */}
      <Pin texto={origen} top={vertical ? "9%" : "8%"} color={color} />

      {/* Destinos */}
      <div
        style={{
          position: "absolute",
          left: px(50),
          right: px(50),
          top: vertical ? "58%" : "48%",
          display: "grid",
          gridTemplateColumns: `repeat(${columnas}, 1fr)`,
          gap: px(16),
        }}
      >
        {destinos.map((d, i) => {
          const desde = inicioDestinos + i * pasoDestino;
          return (
            <div
              key={d}
              style={{
                display: "flex",
                alignItems: "center",
                gap: px(12),
                padding: `${px(12)}px ${px(20)}px`,
                borderRadius: px(999),
                background: "#ffffff",
                border: `${px(5)}px solid ${color}`,
                fontFamily: marca.fuentes.texto,
                fontWeight: 800,
                fontSize: px(vertical ? 38 : 30),
                color: "#111111",
                whiteSpace: "nowrap",
                opacity: interpolate(frame, [desde, desde + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                scale: interpolate(frame, [desde, desde + 8], [0.4, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.spring({ damping: 10 }),
                }),
              }}
            >
              <span style={{ color: "#2bb24c", fontSize: px(vertical ? 40 : 32) }}>✓</span>
              {d}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Pin: React.FC<{ texto: string; top: string; color: string }> = ({ texto, top, color }) => {
  const frame = useCurrentFrame();
  const { px } = useEscala();
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        scale: interpolate(frame, [0, 10], [0, 1], {
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 9 }),
        }),
      }}
    >
      <div
        style={{
          padding: `${px(14)}px ${px(34)}px`,
          borderRadius: px(20),
          background: color,
          color: "#ffffff",
          fontFamily: marca.fuentes.titulo,
          fontSize: px(64),
          textTransform: "uppercase",
          boxShadow: `0 ${px(8)}px 0 rgba(0,0,0,0.35)`,
        }}
      >
        📍 {texto}
      </div>
    </div>
  );
};
