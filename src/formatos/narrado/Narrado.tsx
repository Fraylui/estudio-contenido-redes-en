import { z } from "zod";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { entrada, golpe } from "../../comun/animaciones";
import { useEscala } from "../../comun/escala";
import { Firma } from "../../comun/Firma";
import { marca } from "../../marca";
import { Escena } from "./Escena";
import { ESTILOS, Estilo } from "./estilos";
import { COLORES_CLAVE, Presentador } from "./Presentador";
import {
  paginaProvisional,
  PaginasEnElTiempo,
  SubtituloAbajo,
  usePalabras,
} from "./Subtitulos";

export const narradoSchema = z.object({
  id: z.string(),
  estilo: z.enum(["misterio", "dibujo"]),
  titulo: z.string(),
  subtitulo: z.string(),
  cta: z.string(),
  musica: z.string(),
  escenas: z.array(
    z.object({
      texto: z.string(),
      prompt: z.string(),
      efecto: z.enum(["acercar", "alejar", "izquierda", "derecha"]),
      // Solo estilo dibujo: cara del personaje y palabra grande de la escena
      emocion: z.enum(["explica", "senala", "feliz", "preocupado", "sorprendido"]).optional(),
      clave: z.string().optional(),
      colorClave: z.enum(Object.keys(COLORES_CLAVE) as [keyof typeof COLORES_CLAVE]).optional(),
      // Estos los completa "npm run preparar" a partir de tu grabación
      inicio: z.number().optional(),
      imagen: z.string().optional(),
    }),
  ),
  // Textos grandes de la miniatura de YouTube (ver Miniatura.tsx)
  miniatura: z
    .object({
      texto: z.string(),
      color: z.enum(Object.keys(COLORES_CLAVE) as [keyof typeof COLORES_CLAVE]),
      texto2: z.string().optional(),
      color2: z.enum(Object.keys(COLORES_CLAVE) as [keyof typeof COLORES_CLAVE]).optional(),
      emocion: z.enum(["explica", "senala", "feliz", "preocupado", "sorprendido"]).optional(),
      escena: z.number().int().min(1).optional(),
    })
    .optional(),
  voz: z.string().optional(),
  subtitulos: z.string().optional(),
  duracion: z.number().optional(),
});

export type NarradoProps = z.infer<typeof narradoSchema>;
type Props = NarradoProps;

const FPS = 30;
const CIERRE = 3;
const FUNDIDO = 12;
// Ritmo de narración para la vista previa antes de grabar
const PALABRAS_POR_SEGUNDO = 2.4;

const contarPalabras = (t: string) => t.split(/\s+/).filter(Boolean).length;

// Momento (en segundos) en que empieza cada escena y cuánto dura la narración
const calcularTiempos = (props: Props) => {
  const conVoz = Boolean(props.voz && props.duracion);
  let acumulado = 0;
  const inicios = props.escenas.map((e) => {
    const estimado = acumulado / PALABRAS_POR_SEGUNDO;
    acumulado += contarPalabras(e.texto);
    return conVoz && e.inicio !== undefined ? e.inicio : estimado;
  });
  const narracion = conVoz ? props.duracion! : acumulado / PALABRAS_POR_SEGUNDO;
  return { inicios, narracion, conVoz };
};

export const calcularNarrado: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: Math.ceil((calcularTiempos(props).narracion + CIERRE) * FPS),
});

export const Narrado: React.FC<Props> = (props) => {
  const { escenas, voz, subtitulos, musica } = props;
  const estilo: Estilo = ESTILOS[props.estilo];
  const { fps, durationInFrames } = useVideoConfig();
  const { inicios, narracion, conVoz } = calcularTiempos(props);
  const finNarracion = Math.round(narracion * fps);
  const captions = usePalabras(conVoz ? subtitulos : undefined);
  const tramos = escenas.map((e, i) => ({
    desde: Math.round(inicios[i] * fps),
    hasta: i + 1 < escenas.length ? Math.round(inicios[i + 1] * fps) : finNarracion,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: estilo.fondo }}>
      {escenas.map((escena, i) => {
        const desde = Math.round(inicios[i] * fps);
        const hasta = i + 1 < escenas.length ? Math.round(inicios[i + 1] * fps) : durationInFrames;
        return (
          <Sequence
            key={i}
            name={`Escena ${i + 1}`}
            from={desde}
            durationInFrames={hasta - desde + FUNDIDO}
          >
            <Escena
              numero={i + 1}
              imagen={escena.imagen}
              efecto={escena.efecto}
              estilo={estilo}
              fundido={i === 0 ? 0 : FUNDIDO}
            />
            {!conVoz && !estilo.personaje ? (
              <Sequence durationInFrames={hasta - desde} layout="none">
                <SubtituloAbajo page={paginaProvisional(escena.texto)} estilo={estilo} pequeno />
              </Sequence>
            ) : null}
          </Sequence>
        );
      })}

      {estilo.vineta ? <Vineta /> : null}
      {estilo.grano ? <Grano /> : null}

      <Sequence name="Título" durationInFrames={Math.round(2.8 * fps)} layout="none">
        <Titulo titulo={props.titulo} subtitulo={props.subtitulo} estilo={estilo} />
      </Sequence>

      {estilo.personaje ? (
        <Presentador
          escenas={escenas.map((e, i) => ({
            ...tramos[i],
            texto: e.texto,
            emocion: e.emocion ?? "explica",
            clave: e.clave,
            colorClave: e.colorClave ?? "rojo",
          }))}
          captions={captions}
          finNarracion={finNarracion}
          estilo={estilo}
        />
      ) : captions ? (
        <PaginasEnElTiempo captions={captions}>
          {(page) => <SubtituloAbajo page={page} estilo={estilo} />}
        </PaginasEnElTiempo>
      ) : null}

      <Sequence name="Cierre" from={finNarracion} layout="none">
        <Cierre cta={props.cta} estilo={estilo} />
      </Sequence>

      <Firma colorTexto={estilo.textoSuave} colorBarra={estilo.resaltado} />

      {conVoz && voz ? <Audio src={staticFile(voz)} /> : null}
      {musica ? (
        <Audio
          src={staticFile(`musica/${musica}`)}
          loop
          // La música va bajita mientras hablas y sube un poco en el cierre
          volume={(f) =>
            interpolate(
              f,
              [0, fps, finNarracion, finNarracion + fps, durationInFrames - fps, durationInFrames],
              [0, 0.12, 0.12, 0.3, 0.3, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};

const Titulo: React.FC<{ titulo: string; subtitulo: string; estilo: Estilo }> = ({
  titulo,
  subtitulo,
  estilo,
}) => {
  const frame = useCurrentFrame();
  const { px, vertical } = useEscala();
  const tarjeta = estilo.imagen === "tarjeta";
  return (
    <AbsoluteFill
      style={{
        justifyContent: vertical ? "flex-start" : "center",
        alignItems: "center",
        paddingTop: px(vertical ? (tarjeta ? 200 : 260) : 0),
        opacity: interpolate(frame, [60, 84], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div
        style={{
          ...golpe(frame, 0, 16),
          fontFamily: marca.fuentes.titulo,
          fontSize: px(tarjeta ? 110 : 150),
          lineHeight: 1,
          maxWidth: "88%",
          textTransform: "uppercase",
          textAlign: "center",
          color: tarjeta ? estilo.texto : "#ffffff",
          padding: tarjeta ? `${px(10)}px ${px(40)}px` : 0,
          background: tarjeta ? estilo.resaltado : "transparent",
          border: tarjeta ? `${px(8)}px solid ${estilo.subtituloBorde}` : "none",
          textShadow: tarjeta ? "none" : `0 0 ${px(40)}px rgba(255,40,40,0.65)`,
        }}
      >
        {titulo}
      </div>
      <div
        style={{
          ...entrada(frame, 10),
          marginTop: px(24),
          fontFamily: marca.fuentes.texto,
          fontWeight: 700,
          fontSize: px(44),
          color: tarjeta ? estilo.texto : estilo.textoSuave,
          textShadow: tarjeta ? "none" : `0 ${px(4)}px ${px(12)}px #000`,
        }}
      >
        {subtitulo}
      </div>
    </AbsoluteFill>
  );
};

const Cierre: React.FC<{ cta: string; estilo: Estilo }> = ({ cta, estilo }) => {
  const frame = useCurrentFrame();
  const { px } = useEscala();
  const tarjeta = estilo.imagen === "tarjeta";
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: px(90),
        backgroundColor: tarjeta ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.6)",
        opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
      }}
    >
      <div
        style={{
          ...golpe(frame, 4),
          fontFamily: marca.fuentes.titulo,
          fontSize: px(110),
          lineHeight: 1.1,
          textAlign: "center",
          textTransform: "uppercase",
          color: tarjeta ? estilo.texto : "#ffffff",
        }}
      >
        {cta}
      </div>
      <div
        style={{
          ...entrada(frame, 14),
          marginTop: px(40),
          padding: `${px(20)}px ${px(50)}px`,
          borderRadius: px(999),
          background: estilo.resaltado,
          border: tarjeta ? `${px(6)}px solid ${estilo.subtituloBorde}` : "none",
          fontFamily: marca.fuentes.texto,
          fontWeight: 800,
          fontSize: px(50),
          color: "#111111",
        }}
      >
        {marca.usuario}
      </div>
    </AbsoluteFill>
  );
};

// Oscurece los bordes para dirigir la mirada al centro
const Vineta: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.75) 100%)",
    }}
  />
);

// Grano de película que cambia en cada fotograma, como en el cine
const Grano: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.13, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="grano">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 30} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grano)" />
      </svg>
    </AbsoluteFill>
  );
};
