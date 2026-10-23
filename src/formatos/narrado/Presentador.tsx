import { Caption } from "@remotion/captions";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useEscala } from "../../comun/escala";
import { marca } from "../../marca";
import { Estilo } from "./estilos";
import { Emocion, Personaje } from "./Personaje";
import {
  estaHablando,
  PaginasEnElTiempo,
  paginaProvisional,
  TextoPagina,
} from "./Subtitulos";

export const COLORES_CLAVE = {
  rojo: "#e63946",
  verde: "#2bb24c",
  amarillo: "#ffcc00",
  azul: "#1e88e5",
  negro: "#111111",
} as const;
export type ColorClave = keyof typeof COLORES_CLAVE;

export type EscenaEnTiempo = {
  desde: number;
  hasta: number;
  texto: string;
  emocion: Emocion;
  clave?: string;
  colorClave: ColorClave;
};

// Estilo dibujo: el personaje narra con un globo de diálogo y cada escena
// puede mostrar una palabra clave grande (como "CARO" o "BARATO").
export const Presentador: React.FC<{
  escenas: EscenaEnTiempo[];
  captions: Caption[] | null;
  finNarracion: number;
  estilo: Estilo;
}> = ({ escenas, captions, finNarracion, estilo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { px, vertical } = useEscala();
  const ms = (frame / fps) * 1000;

  const actual = escenas.find((e) => frame >= e.desde && frame < e.hasta) ?? escenas[escenas.length - 1];
  const hablando = frame < finNarracion && (captions ? estaHablando(captions, ms) : true);
  const finTitulo = Math.round(2.8 * fps);

  return (
    <AbsoluteFill>
      {escenas.map((e, i) =>
        e.clave ? (
          <Sequence
            key={`clave-${i}`}
            name={`Clave ${i + 1}`}
            from={Math.max(e.desde + 6, i === 0 ? finTitulo : 0)}
            durationInFrames={e.hasta - Math.max(e.desde + 6, i === 0 ? finTitulo : 0)}
            layout="none"
          >
            <Clave texto={e.clave} color={COLORES_CLAVE[e.colorClave]} numero={i} />
          </Sequence>
        ) : null,
      )}

      {/* Globo de diálogo con lo que se está diciendo */}
      {captions ? (
        <PaginasEnElTiempo captions={captions}>
          {(page) => (
            <Globo>
              <TextoPagina page={page} estilo={estilo} tamano={vertical ? 58 : 50} />
            </Globo>
          )}
        </PaginasEnElTiempo>
      ) : (
        escenas.map((e, i) => (
          <Sequence key={`globo-${i}`} from={e.desde} durationInFrames={e.hasta - e.desde} layout="none">
            <Globo>
              <TextoPagina page={paginaProvisional(e.texto)} estilo={estilo} tamano={vertical ? 38 : 32} />
            </Globo>
          </Sequence>
        ))
      )}

      <div
        style={{
          position: "absolute",
          bottom: px(vertical ? 40 : 10),
          ...(vertical ? { left: px(10) } : { right: px(150) }),
        }}
      >
        <Personaje
          emocion={actual.emocion}
          hablando={hablando}
          alto={px(vertical ? 640 : 500)}
          mira={vertical ? "derecha" : "izquierda"}
        />
      </div>
    </AbsoluteFill>
  );
};

// Globo de cómic al lado del personaje
const Globo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { px, vertical } = useEscala();
  const borde = `${px(8)}px solid ${"#111111"}`;
  return (
    <div
      style={{
        position: "absolute",
        ...(vertical
          ? { left: px(390), right: px(40), bottom: px(470), minHeight: px(220) }
          : { right: px(60), width: px(700), top: px(190), minHeight: px(200) }),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: px(30),
        background: "#ffffff",
        border: borde,
        borderRadius: px(40),
        boxShadow: `${px(10)}px ${px(10)}px 0 #111111`,
        scale: interpolate(frame, [0, 6], [0.92, 1], { extrapolateRight: "clamp" }),
      }}
    >
      {children}
      {/* Colita del globo apuntando al personaje */}
      <div
        style={{
          position: "absolute",
          width: px(44),
          height: px(44),
          background: "#ffffff",
          borderRight: borde,
          borderBottom: borde,
          ...(vertical
            ? { left: px(-25), bottom: px(40), rotate: "135deg" }
            : { bottom: px(-27), right: px(260), rotate: "45deg" }),
        }}
      />
    </div>
  );
};

// Palabra clave grande con borde y sombra, como en las miniaturas
const Clave: React.FC<{ texto: string; color: string; numero: number }> = ({
  texto,
  color,
  numero,
}) => {
  const frame = useCurrentFrame();
  const { px, vertical } = useEscala();
  return (
    <div
      style={{
        position: "absolute",
        ...(vertical
          ? { top: px(175), left: 0, right: 0 }
          : { top: px(40), right: px(60), width: px(700) }),
        textAlign: "center",
        whiteSpace: "nowrap",
        fontFamily: marca.fuentes.titulo,
        // Las palabras largas se achican para caber en una línea
        fontSize: px(Math.min(vertical ? 130 : 100, (vertical ? 940 : 680) / (texto.length * 0.5))),
        lineHeight: 1,
        textTransform: "uppercase",
        color,
        WebkitTextStroke: `${px(12)}px #111111`,
        paintOrder: "stroke fill",
        textShadow: `${px(8)}px ${px(8)}px 0 #111111`,
        rotate: `${numero % 2 ? 3 : -3}deg`,
        scale: interpolate(frame, [0, 12], [2.2, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 9 }),
        }),
        opacity: interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      {texto}
    </div>
  );
};
