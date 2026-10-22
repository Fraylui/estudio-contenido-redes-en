import { z } from "zod";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { entrada } from "../comun/animaciones";
import { useEscala } from "../comun/escala";
import { Firma } from "../comun/Firma";
import { Fondo } from "../comun/Fondo";
import { Musica } from "../comun/Musica";
import { marca } from "../marca";

export const fraseSchema = z.object({
  texto: z.string(),
  autor: z.string(),
  // Palabras que se pintan con el color principal
  resaltar: z.array(z.string()),
  musica: z.string().optional(),
});

type Props = z.infer<typeof fraseSchema>;

const FRAMES_POR_PALABRA = 7;

export const calcularFrase: CalculateMetadataFunction<Props> = ({ props }) => {
  const palabras = props.texto.split(/\s+/).length;
  return {
    durationInFrames: Math.max(8 * 30, palabras * FRAMES_POR_PALABRA + 4 * 30),
  };
};

const limpiar = (p: string) =>
  p.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export const Frase: React.FC<Props> = ({ texto, autor, resaltar, musica }) => {
  const frame = useCurrentFrame();
  const { px } = useEscala();
  const palabras = texto.split(/\s+/);
  const claves = resaltar.map(limpiar);
  const finTexto = palabras.length * FRAMES_POR_PALABRA;

  return (
    <AbsoluteFill>
      <Fondo />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: px(100),
        }}
      >
        <div
          style={{
            fontFamily: marca.fuentes.titulo,
            fontSize: px(260),
            lineHeight: 0.6,
            color: marca.colores.acento,
            alignSelf: "flex-start",
            opacity: interpolate(frame, [0, 10], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          “
        </div>
        <div
          style={{
            fontFamily: marca.fuentes.texto,
            fontWeight: 800,
            fontSize: px(84),
            lineHeight: 1.2,
            color: marca.colores.texto,
            display: "flex",
            flexWrap: "wrap",
            columnGap: px(22),
          }}
        >
          {palabras.map((palabra, i) => (
            <span
              key={`${palabra}-${i}`}
              style={{
                ...entrada(frame, 6 + i * FRAMES_POR_PALABRA, 10),
                color: claves.includes(limpiar(palabra))
                  ? marca.colores.primario
                  : marca.colores.texto,
              }}
            >
              {palabra}
            </span>
          ))}
        </div>
        <div
          style={{
            ...entrada(frame, finTexto + 10),
            alignSelf: "flex-end",
            marginTop: px(60),
            fontFamily: marca.fuentes.texto,
            fontWeight: 500,
            fontSize: px(48),
            color: marca.colores.textoSuave,
          }}
        >
          — {autor}
        </div>
      </AbsoluteFill>
      <Firma />
      <Musica archivo={musica} />
    </AbsoluteFill>
  );
};
