import { z } from "zod";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { entrada, golpe } from "../comun/animaciones";
import { useEscala } from "../comun/escala";
import { Firma } from "../comun/Firma";
import { Fondo } from "../comun/Fondo";
import { Musica } from "../comun/Musica";
import { marca } from "../marca";
import { Cierre } from "./TopLista";

export const triviaSchema = z.object({
  pregunta: z.string(),
  opciones: z.array(z.string()).min(2).max(4),
  correcta: z.number().int().min(0),
  segundosParaPensar: z.number().min(2),
  explicacion: z.string(),
  cta: z.string(),
  musica: z.string().optional(),
});

type Props = z.infer<typeof triviaSchema>;

const PRESENTAR = 2.5;
const REVELAR = 4;
const CIERRE = 3;

export const calcularTrivia: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: Math.round(
    (PRESENTAR + props.segundosParaPensar + REVELAR + CIERRE) * 30,
  ),
});

const LETRAS = ["A", "B", "C", "D"];

export const Trivia: React.FC<Props> = ({
  pregunta,
  opciones,
  correcta,
  segundosParaPensar,
  explicacion,
  cta,
  musica,
}) => {
  const frame = useCurrentFrame();
  const { px } = useEscala();
  const inicioCuenta = PRESENTAR * 30;
  const inicioRevelar = inicioCuenta + segundosParaPensar * 30;
  const inicioCierre = inicioRevelar + REVELAR * 30;
  const revelado = frame >= inicioRevelar;
  const restante = Math.max(
    0,
    Math.ceil(segundosParaPensar - (frame - inicioCuenta) / 30),
  );

  return (
    <AbsoluteFill>
      <Fondo />
      <Sequence name="Pregunta" durationInFrames={inicioCierre} layout="none">
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: px(90),
            gap: px(28),
          }}
        >
          <div
            style={{
              ...entrada(frame, 0),
              fontFamily: marca.fuentes.titulo,
              fontSize: px(96),
              lineHeight: 1.1,
              color: marca.colores.texto,
              textAlign: "center",
              marginBottom: px(30),
            }}
          >
            {pregunta}
          </div>
          {opciones.map((opcion, i) => {
            const esCorrecta = i === correcta;
            return (
              <div
                key={opcion}
                style={{
                  ...entrada(frame, 10 + i * 6),
                  width: "100%",
                  maxWidth: px(900),
                  display: "flex",
                  alignItems: "center",
                  gap: px(28),
                  padding: `${px(26)}px ${px(36)}px`,
                  borderRadius: px(28),
                  background:
                    revelado && esCorrecta
                      ? marca.colores.correcto
                      : "rgba(255,255,255,0.1)",
                  border: `${px(4)}px solid ${
                    revelado && esCorrecta
                      ? marca.colores.correcto
                      : "rgba(255,255,255,0.25)"
                  }`,
                  fontFamily: marca.fuentes.texto,
                  fontWeight: 700,
                  fontSize: px(54),
                  color: marca.colores.texto,
                  ...(revelado && !esCorrecta ? { opacity: 0.35 } : {}),
                  ...(revelado && esCorrecta
                    ? { scale: golpe(frame, inicioRevelar).scale }
                    : {}),
                }}
              >
                <span style={{ color: marca.colores.primario }}>{LETRAS[i]}</span>
                {opcion}
              </div>
            );
          })}
          <div style={{ height: px(170), marginTop: px(30) }}>
            {!revelado && frame >= inicioCuenta ? (
              <div
                key={restante}
                style={{
                  fontFamily: marca.fuentes.titulo,
                  fontSize: px(150),
                  lineHeight: 1,
                  color: marca.colores.primario,
                  scale: interpolate(
                    (frame - inicioCuenta) % 30,
                    [0, 10],
                    [1.4, 1],
                    { extrapolateRight: "clamp" },
                  ),
                }}
              >
                {restante}
              </div>
            ) : null}
            {revelado ? (
              <div
                style={{
                  ...entrada(frame, inicioRevelar + 8),
                  fontFamily: marca.fuentes.texto,
                  fontWeight: 500,
                  fontSize: px(46),
                  color: marca.colores.textoSuave,
                  textAlign: "center",
                  maxWidth: px(900),
                }}
              >
                {explicacion}
              </div>
            ) : null}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence name="Cierre" from={inicioCierre}>
        <Cierre cta={cta} />
      </Sequence>
      <Firma />
      <Musica archivo={musica} />
    </AbsoluteFill>
  );
};
