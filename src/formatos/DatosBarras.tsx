import { z } from "zod";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { entrada } from "../comun/animaciones";
import { useEscala } from "../comun/escala";
import { Firma } from "../comun/Firma";
import { Fondo } from "../comun/Fondo";
import { Musica } from "../comun/Musica";
import { marca } from "../marca";

export const datosBarrasSchema = z.object({
  titulo: z.string(),
  unidad: z.string(),
  fuente: z.string(),
  datos: z.array(
    z.object({
      etiqueta: z.string(),
      valor: z.number(),
    }),
  ),
  decimales: z.number().int().min(0).max(3),
  musica: z.string().optional(),
});

type Props = z.infer<typeof datosBarrasSchema>;

const FRAMES_ENTRE_BARRAS = 12;

export const calcularDatosBarras: CalculateMetadataFunction<Props> = ({
  props,
}) => ({
  durationInFrames: 2 * 30 + props.datos.length * FRAMES_ENTRE_BARRAS + 6 * 30,
});

export const DatosBarras: React.FC<Props> = ({
  titulo,
  unidad,
  fuente,
  datos,
  decimales,
  musica,
}) => {
  const frame = useCurrentFrame();
  const { px, vertical } = useEscala();
  // De menor a mayor: el ganador aparece al final, como en un ranking
  const ordenados = [...datos].sort((a, b) => a.valor - b.valor);
  const maximo = Math.max(...datos.map((d) => d.valor));
  const formato = new Intl.NumberFormat("es", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });

  return (
    <AbsoluteFill>
      <Fondo />
      <AbsoluteFill
        style={{
          padding: `${px(vertical ? 220 : 130)}px ${px(90)}px ${px(vertical ? 200 : 90)}px`,
          flexDirection: "column",
        }}
      >
        <div
          style={{
            ...entrada(frame, 0),
            fontFamily: marca.fuentes.titulo,
            fontSize: px(96),
            lineHeight: 1.05,
            color: marca.colores.texto,
            textTransform: "uppercase",
          }}
        >
          {titulo}
        </div>
        <div
          style={{
            ...entrada(frame, 6),
            fontFamily: marca.fuentes.texto,
            fontWeight: 500,
            fontSize: px(40),
            color: marca.colores.textoSuave,
            marginTop: px(10),
          }}
        >
          En {unidad}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column-reverse",
            justifyContent: "center",
            gap: px(vertical ? 30 : 16),
            marginTop: px(40),
          }}
        >
          {ordenados.map((d, i) => {
            const inicio = 2 * 30 + i * FRAMES_ENTRE_BARRAS;
            const avance = interpolate(frame, [inicio, inicio + 40], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            });
            const esGanador = i === ordenados.length - 1;
            return (
              <div
                key={d.etiqueta}
                style={{
                  opacity: avance > 0 ? 1 : 0,
                  // En horizontal la etiqueta va a la izquierda de la barra para ahorrar alto
                  display: vertical ? "block" : "flex",
                  alignItems: "center",
                  gap: px(24),
                }}
              >
                <div
                  style={{
                    fontFamily: marca.fuentes.texto,
                    fontWeight: 700,
                    fontSize: px(42),
                    color: marca.colores.texto,
                    marginBottom: vertical ? px(8) : 0,
                    width: vertical ? undefined : px(320),
                    flexShrink: 0,
                    textAlign: vertical ? "left" : "right",
                  }}
                >
                  {d.etiqueta}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: px(20),
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      height: px(vertical ? 64 : 44),
                      width: `${(d.valor / maximo) * 75 * avance}%`,
                      borderRadius: px(14),
                      background: esGanador
                        ? marca.colores.primario
                        : marca.colores.acento,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: marca.fuentes.titulo,
                      fontSize: px(52),
                      color: esGanador
                        ? marca.colores.primario
                        : marca.colores.texto,
                    }}
                  >
                    {formato.format(d.valor * avance)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: marca.fuentes.texto,
            fontWeight: 500,
            fontSize: px(30),
            color: marca.colores.textoSuave,
            marginTop: px(30),
          }}
        >
          Fuente: {fuente}
        </div>
      </AbsoluteFill>
      <Firma />
      <Musica archivo={musica} />
    </AbsoluteFill>
  );
};
