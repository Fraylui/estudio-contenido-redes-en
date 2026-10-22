import { z } from "zod";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Series,
  useCurrentFrame,
} from "remotion";
import { entrada, golpe } from "../comun/animaciones";
import { useEscala } from "../comun/escala";
import { Firma } from "../comun/Firma";
import { Fondo } from "../comun/Fondo";
import { Musica } from "../comun/Musica";
import { marca } from "../marca";

export const topListaSchema = z.object({
  titulo: z.string(),
  subtitulo: z.string(),
  items: z.array(
    z.object({
      emoji: z.string(),
      nombre: z.string(),
      detalle: z.string(),
    }),
  ),
  segundosPorItem: z.number().min(1),
  cta: z.string(),
  musica: z.string().optional(),
});

type Props = z.infer<typeof topListaSchema>;

const INTRO = 3;
const CIERRE = 3;

export const calcularTopLista: CalculateMetadataFunction<Props> = ({
  props,
}) => ({
  durationInFrames: Math.round(
    (INTRO + props.items.length * props.segundosPorItem + CIERRE) * 30,
  ),
});

const Portada: React.FC<{ titulo: string; subtitulo: string; total: number }> = ({
  titulo,
  subtitulo,
  total,
}) => {
  const frame = useCurrentFrame();
  const { px } = useEscala();
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: px(90),
        textAlign: "center",
      }}
    >
      <div
        style={{
          ...golpe(frame, 0),
          fontFamily: marca.fuentes.titulo,
          fontSize: px(260),
          color: marca.colores.primario,
          lineHeight: 1,
        }}
      >
        TOP {total}
      </div>
      <div
        style={{
          ...entrada(frame, 8),
          fontFamily: marca.fuentes.titulo,
          fontSize: px(110),
          color: marca.colores.texto,
          lineHeight: 1.05,
          marginTop: px(30),
          textTransform: "uppercase",
        }}
      >
        {titulo}
      </div>
      <div
        style={{
          ...entrada(frame, 16),
          fontFamily: marca.fuentes.texto,
          fontWeight: 500,
          fontSize: px(46),
          color: marca.colores.textoSuave,
          marginTop: px(30),
        }}
      >
        {subtitulo}
      </div>
    </AbsoluteFill>
  );
};

const Item: React.FC<{
  posicion: number;
  emoji: string;
  nombre: string;
  detalle: string;
}> = ({ posicion, emoji, nombre, detalle }) => {
  const frame = useCurrentFrame();
  const { px } = useEscala();
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: px(90),
        textAlign: "center",
      }}
    >
      <div
        style={{
          ...golpe(frame, 0),
          fontFamily: marca.fuentes.titulo,
          fontSize: px(300),
          lineHeight: 1,
          color: posicion === 1 ? marca.colores.primario : marca.colores.acento,
        }}
      >
        #{posicion}
      </div>
      <div style={{ ...entrada(frame, 6), fontSize: px(170), marginTop: px(20) }}>
        {emoji}
      </div>
      <div
        style={{
          ...entrada(frame, 10),
          fontFamily: marca.fuentes.titulo,
          fontSize: px(120),
          color: marca.colores.texto,
          lineHeight: 1.05,
          marginTop: px(20),
          textTransform: "uppercase",
        }}
      >
        {nombre}
      </div>
      <div
        style={{
          ...entrada(frame, 16),
          fontFamily: marca.fuentes.texto,
          fontWeight: 500,
          fontSize: px(50),
          color: marca.colores.textoSuave,
          marginTop: px(24),
          maxWidth: px(900),
        }}
      >
        {detalle}
      </div>
    </AbsoluteFill>
  );
};

export const Cierre: React.FC<{ cta: string }> = ({ cta }) => {
  const frame = useCurrentFrame();
  const { px } = useEscala();
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: px(90),
        textAlign: "center",
      }}
    >
      <div
        style={{
          ...golpe(frame, 0),
          fontFamily: marca.fuentes.titulo,
          fontSize: px(120),
          color: marca.colores.texto,
          lineHeight: 1.1,
          textTransform: "uppercase",
        }}
      >
        {cta}
      </div>
      <div
        style={{
          ...entrada(frame, 12),
          marginTop: px(50),
          padding: `${px(24)}px ${px(60)}px`,
          borderRadius: px(999),
          background: marca.colores.acento,
          fontFamily: marca.fuentes.texto,
          fontWeight: 800,
          fontSize: px(52),
          color: marca.colores.texto,
        }}
      >
        Sígueme {marca.usuario}
      </div>
    </AbsoluteFill>
  );
};

export const TopLista: React.FC<Props> = ({
  titulo,
  subtitulo,
  items,
  segundosPorItem,
  cta,
  musica,
}) => {
  const total = items.length;
  return (
    <AbsoluteFill>
      <Fondo />
      <Series>
        <Series.Sequence name="Portada" durationInFrames={INTRO * 30}>
          <Portada titulo={titulo} subtitulo={subtitulo} total={total} />
        </Series.Sequence>
        {/* Cuenta regresiva: del último puesto al #1 */}
        {[...items].reverse().map((item, i) => (
          <Series.Sequence
            key={item.nombre}
            name={`#${total - i}`}
            durationInFrames={Math.round(segundosPorItem * 30)}
          >
            <Item posicion={total - i} {...item} />
          </Series.Sequence>
        ))}
        <Series.Sequence name="Cierre" durationInFrames={CIERRE * 30}>
          <Cierre cta={cta} />
        </Series.Sequence>
      </Series>
      <Firma />
      <Musica archivo={musica} />
    </AbsoluteFill>
  );
};
