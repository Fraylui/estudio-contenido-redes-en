import { Easing, interpolate, useCurrentFrame } from "remotion";
import { marca } from "../../marca";

export type Emocion = "explica" | "senala" | "feliz" | "preocupado" | "sorprendido";

const NEGRO = "#111111";
const TRAZO = 10;

// Ángulo de cada brazo (grados, 0 = colgando) según la emoción
const BRAZOS: Record<Emocion, { izq: number; der: number }> = {
  explica: { izq: 20, der: -130 },
  senala: { izq: 15, der: -115 },
  feliz: { izq: 150, der: -150 },
  preocupado: { izq: 140, der: -140 },
  sorprendido: { izq: 95, der: -95 },
};

// El narrador dibujado: cabeza grande, ojos de punto y cuerpo de palitos.
// Mueve la boca cuando "hablando" es verdadero, parpadea y respira solo.
export const Personaje: React.FC<{
  emocion: Emocion;
  hablando: boolean;
  alto: number;
  // Hacia dónde mira y señala
  mira?: "izquierda" | "derecha";
  // Para imágenes fijas (miniaturas): sin entrada, sin parpadeo
  quieto?: boolean;
}> = ({ emocion, hablando, alto, mira = "derecha", quieto = false }) => {
  const frameActual = useCurrentFrame();
  const frame = quieto ? 40 : frameActual;
  const camisa = marca.personaje.camisa;

  // Entra rebotando desde abajo
  const entrada = interpolate(frame, [0, 16], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 10 }),
  });
  const respira = Math.sin(frame / 12) * 4;
  // Parpadea ~cada 3 segundos durante 4 fotogramas
  const parpadeo = frame % 95 < 4;
  const mirada = mira === "derecha" ? 6 : -6;

  // Boca hablando: se abre y cierra con un ritmo irregular, como al pronunciar sílabas
  const apertura = hablando
    ? Math.max(0, Math.sin(frame * 1.1) * 0.6 + Math.sin(frame * 0.53) * 0.4)
    : 0;

  const b = BRAZOS[emocion];
  const saludo = emocion === "explica" ? Math.sin(frame / 5) * 12 : 0;
  const brazoDer = (mira === "derecha" ? b.der : -b.izq) + (mira === "derecha" ? saludo : 0);
  const brazoIzq = (mira === "derecha" ? b.izq : -b.der) + (mira === "derecha" ? 0 : -saludo);

  const cejas: Record<Emocion, { y: number; angulo: number }> = {
    explica: { y: 0, angulo: 0 },
    senala: { y: -4, angulo: 0 },
    feliz: { y: -10, angulo: -8 },
    preocupado: { y: 2, angulo: 18 },
    sorprendido: { y: -18, angulo: -4 },
  };
  const c = cejas[emocion];

  const boca = () => {
    if (apertura > 0.12) {
      return (
        <ellipse
          cx={200}
          cy={232}
          rx={22 + apertura * 6}
          ry={6 + apertura * 20}
          fill={NEGRO}
        />
      );
    }
    switch (emocion) {
      case "feliz":
        return <path d="M160 220 Q200 268 240 220 Z" fill={NEGRO} />;
      case "preocupado":
        return (
          <path d="M168 240 Q200 214 232 240" stroke={NEGRO} strokeWidth={TRAZO} fill="none" strokeLinecap="round" />
        );
      case "sorprendido":
        return <ellipse cx={200} cy={236} rx={18} ry={24} fill={NEGRO} />;
      default:
        return (
          <path d="M172 226 Q200 246 228 226" stroke={NEGRO} strokeWidth={TRAZO} fill="none" strokeLinecap="round" />
        );
    }
  };

  const brazo = (x: number, angulo: number) => (
    <g transform={`rotate(${angulo} ${x} 330)`}>
      <line x1={x} y1={330} x2={x} y2={470} stroke={NEGRO} strokeWidth={TRAZO + 2} strokeLinecap="round" />
      <circle cx={x} cy={478} r={16} fill="#ffffff" stroke={NEGRO} strokeWidth={TRAZO - 2} />
    </g>
  );

  return (
    <svg
      viewBox="0 0 400 640"
      style={{
        height: alto,
        overflow: "visible",
        translate: `0px ${entrada * alto * 0.6}px`,
      }}
    >
      <g transform={`translate(0 ${respira})`}>
        {/* Piernas */}
        <line x1={175} y1={520} x2={165} y2={625} stroke={NEGRO} strokeWidth={TRAZO + 2} strokeLinecap="round" />
        <line x1={225} y1={520} x2={235} y2={625} stroke={NEGRO} strokeWidth={TRAZO + 2} strokeLinecap="round" />
        {/* Brazos detrás del cuerpo */}
        {brazo(140, brazoIzq)}
        {brazo(260, brazoDer)}
        {/* Camiseta */}
        <path
          d="M140 320 Q200 296 260 320 L276 528 Q200 548 124 528 Z"
          fill={camisa}
          stroke={NEGRO}
          strokeWidth={TRAZO}
          strokeLinejoin="round"
        />
        {/* Cabeza */}
        <circle cx={200} cy={170} r={140} fill="#ffffff" stroke={NEGRO} strokeWidth={TRAZO} />
        {emocion === "feliz" ? (
          <>
            <circle cx={118} cy={210} r={18} fill="#ff9aa8" opacity={0.7} />
            <circle cx={282} cy={210} r={18} fill="#ff9aa8" opacity={0.7} />
          </>
        ) : null}
        {/* Cejas */}
        <line
          x1={140}
          x2={180}
          y1={110 + c.y}
          y2={110 + c.y}
          stroke={NEGRO}
          strokeWidth={TRAZO - 2}
          strokeLinecap="round"
          transform={`rotate(${c.angulo} 160 ${110 + c.y})`}
        />
        <line
          x1={220}
          x2={260}
          y1={110 + c.y}
          y2={110 + c.y}
          stroke={NEGRO}
          strokeWidth={TRAZO - 2}
          strokeLinecap="round"
          transform={`rotate(${-c.angulo} 240 ${110 + c.y})`}
        />
        {/* Ojos */}
        <ellipse cx={160 + mirada} cy={160} rx={15} ry={parpadeo ? 2 : emocion === "sorprendido" ? 24 : 20} fill={NEGRO} />
        <ellipse cx={240 + mirada} cy={160} rx={15} ry={parpadeo ? 2 : emocion === "sorprendido" ? 24 : 20} fill={NEGRO} />
        {boca()}
        {/* Gota de sudor cuando se preocupa */}
        {emocion === "preocupado" ? (
          <path
            d="M318 96 Q330 122 318 132 Q306 122 318 96 Z"
            fill="#7cc6ff"
            stroke={NEGRO}
            strokeWidth={4}
            transform={`translate(0 ${(frame % 40) * 0.8})`}
            opacity={interpolate(frame % 40, [0, 30, 40], [1, 1, 0])}
          />
        ) : null}
      </g>
    </svg>
  );
};
