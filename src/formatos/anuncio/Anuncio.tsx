import { z } from "zod";
import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  Img,
  interpolate,
  Sequence,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useEscala } from "../../comun/escala";
import { marca } from "../../marca";
import { MapaRuta } from "./MapaRuta";
import catalogoSfx from "../../../public/sfx/efectos/sfx.json";

type Efecto = NonNullable<Props["efectos"]>[number];
const CATALOGO = catalogoSfx as Record<
  string,
  { archivo: string; impacto_s: number; ganancia_db_sugerida: number }
>;

// Archivo, adelanto (para que el golpe caiga en el segundo pedido) y volumen de un efecto
const resolverEfecto = (e: Efecto) => {
  const c = e.sonido ? CATALOGO[e.sonido] : undefined;
  if (e.sonido && !c) throw new Error(`Efecto desconocido: ${e.sonido}. Mira public/sfx/efectos/sfx.json`);
  if (!c) return { archivo: e.archivo ?? "", adelanto: 0, volumen: e.volumen ?? 0.35 };
  return {
    archivo: `sfx/efectos/${c.archivo}`,
    adelanto: c.impacto_s,
    volumen: e.volumen ?? Math.pow(10, (e.db ?? c.ganancia_db_sugerida) / 20),
  };
};

export const anuncioSchema = z.object({
  negocio: z.object({
    logo: z.string(),
    color: z.string(),
    acento: z.string(),
    eslogan: z.string(),
    whatsapp: z.string(),
    direccion: z.string(),
    llamada: z.string(),
  }),
  escenas: z.array(
    z.object({
      // cielo: la cámara baja del cielo a la imagen (gancho)
      // mapa: ruta animada con destinos · video / foto: material con texto · cierre: logo y contacto
      tipo: z.enum(["cielo", "mapa", "video", "foto", "cierre"]),
      segundos: z.number().min(0.5),
      // Texto grande en pantalla. Lo que va entre *asteriscos* sale resaltado.
      texto: z.string().optional(),
      // Segundo texto que reemplaza al primero a los `cambio` segundos (para seguir la voz)
      texto2: z.string().optional(),
      cambio: z.number().optional(),
      archivo: z.string().optional(),
      // Videos horizontales: "tarjeta" los muestra completos sobre un fondo desenfocado
      encaje: z.enum(["cubrir", "tarjeta"]).optional(),
      origen: z.string().optional(),
      destinos: z.array(z.string()).optional(),
      // Fotos: acercar a un detalle. zoom 1 = foto completa; centro = punto en % ("52% 45%")
      zoom: z.number().min(1).optional(),
      centro: z.string().optional(),
      // Con narración generada: la escena empieza cuando la voz dice esa frase (1 = la primera)
      frase: z.number().int().min(1).optional(),
      // y su segundo texto aparece cuando dice esta otra frase
      fraseCambio: z.number().int().min(1).optional(),
    }),
  ),
  voz: z.string().optional(),
  // Tiempos de cada frase de la narración (los completa npm run lote desde public/voz/<id>.json)
  frasesVoz: z.array(z.object({ inicio: z.number(), fin: z.number() })).optional(),
  musica: z.string().optional(),
  // Efectos de sonido (archivos en public/sfx/) en un segundo exacto del anuncio
  efectos: z
    .array(
      z.object({
        // Un efecto del catálogo de la skill video-sfx (public/sfx/efectos/sfx.json): cae justo en su golpe
        sonido: z.string().optional(),
        // o cualquier archivo de public/ (sin alinear el golpe)
        archivo: z.string().optional(),
        segundo: z.number(),
        volumen: z.number().optional(),
        // Ganancia en dB para los efectos del catálogo (por defecto, la sugerida de cada uno)
        db: z.number().optional(),
        // Si se indica, "segundo" se cuenta desde el inicio de esa escena (1 = la primera)
        escena: z.number().int().min(1).optional(),
      }),
    )
    .optional(),
});

type Props = z.infer<typeof anuncioSchema>;
type Escena = Props["escenas"][number];
type Negocio = Props["negocio"];

const FPS = 30;

// Ajusta la duración de cada escena a la frase de la narración con la que empieza.
// Las escenas sin "frase" conservan sus segundos; la última dura hasta 1 s después de la voz.
const sincronizar = (props: Props): Props["escenas"] => {
  const frases = props.frasesVoz;
  if (!frases?.length || !props.escenas.some((e) => e.frase)) return props.escenas;
  const inicioDe = (n?: number) => (n && frases[n - 1] ? Math.max(0, frases[n - 1].inicio - 0.12) : null);
  const finVoz = frases[frases.length - 1].fin + 1;
  // Momento en que empieza cada escena
  const inicios: number[] = [];
  props.escenas.forEach((e, i) => {
    const fijo = i === 0 ? 0 : inicioDe(e.frase);
    inicios.push(fijo ?? inicios[i - 1] + props.escenas[i - 1].segundos);
  });
  return props.escenas.map((e, i) => {
    const fin = i + 1 < props.escenas.length ? inicios[i + 1] : Math.max(finVoz, inicios[i] + e.segundos);
    const cambio = inicioDe(e.fraseCambio);
    return {
      ...e,
      segundos: Math.max(0.5, fin - inicios[i]),
      ...(cambio !== null ? { cambio: Math.max(0.3, cambio - inicios[i]) } : {}),
    };
  });
};

export const calcularAnuncio: CalculateMetadataFunction<Props> = ({ props }) => {
  const escenas = sincronizar(props);
  return {
    durationInFrames: Math.round(escenas.reduce((t, e) => t + e.segundos, 0) * FPS),
    props: { ...props, escenas },
  };
};

export const Anuncio: React.FC<Props> = ({ negocio, escenas, voz, musica, efectos }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <Series>
        {escenas.map((escena, i) => (
          <Series.Sequence
            key={i}
            name={`${i + 1}. ${escena.tipo}`}
            durationInFrames={Math.round(escena.segundos * FPS)}
          >
            <EscenaAnuncio escena={escena} negocio={negocio} />
          </Series.Sequence>
        ))}
      </Series>
      {voz ? <Audio src={staticFile(voz)} /> : null}
      {(efectos ?? []).map((e, i) => {
        const r = resolverEfecto(e);
        const golpe = e.segundo + (e.escena ? escenas.slice(0, e.escena - 1).reduce((t, x) => t + x.segundos, 0) : 0);
        const desde = golpe - r.adelanto;
        return (
          <Sequence
            key={i}
            name={`Efecto ${e.sonido ?? e.archivo}`}
            from={Math.max(0, Math.round(desde * FPS))}
            layout="none"
          >
            {/* Si el golpe cae antes de que empiece el archivo, se recorta el inicio */}
            <Audio
              src={staticFile(r.archivo)}
              volume={r.volumen}
              trimBefore={desde < 0 ? Math.round(-desde * FPS) : undefined}
            />
          </Sequence>
        );
      })}
      {musica ? (
        <Audio
          src={staticFile(musica)}
          loop
          volume={(f) =>
            interpolate(f, [0, 10, durationInFrames - 20, durationInFrames], [0, voz ? 0.15 : 0.6, voz ? 0.15 : 0.6, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};

const EscenaAnuncio: React.FC<{ escena: Escena; negocio: Negocio }> = ({ escena, negocio }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // Cada corte entra con un pequeño "golpe" de zoom, típico de los anuncios en Reels
  const golpe = interpolate(frame, [0, 8], [1.12, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const lento = interpolate(frame, [0, durationInFrames], [1, 1.08]);

  const fondo = (() => {
    switch (escena.tipo) {
      case "cielo":
        return <Cielo imagen={escena.archivo!} />;
      case "mapa":
        return (
          <MapaRuta
            origen={escena.origen ?? "Ayacucho"}
            destinos={escena.destinos ?? []}
            color={negocio.color}
            acento={negocio.acento}
            fondo={escena.archivo}
          />
        );
      case "video":
        return <Clip archivo={escena.archivo!} encaje={escena.encaje ?? "cubrir"} />;
      case "foto":
        return (
          <AbsoluteFill
            style={{
              scale: lento * (escena.zoom ?? 1),
              transformOrigin: escena.centro ?? "50% 50%",
            }}
          >
            <Img
              src={staticFile(escena.archivo!)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: escena.centro ?? "50% 50%" }}
            />
          </AbsoluteFill>
        );
      case "cierre":
        return <Cierre negocio={negocio} />;
    }
  })();

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: escena.tipo === "cielo" ? 1 : golpe }}>{fondo}</AbsoluteFill>
      {escena.tipo !== "cierre" && escena.tipo !== "cielo" ? <LogoEsquina logo={negocio.logo} /> : null}
      {escena.texto ? (
        <Sequence
          layout="none"
          durationInFrames={escena.texto2 && escena.cambio ? Math.round(escena.cambio * FPS) : undefined}
        >
          <TextoGrande
            texto={escena.texto}
            color={negocio.color}
            acento={negocio.acento}
            arriba={escena.tipo === "mapa"}
            retraso={escena.tipo === "cielo" ? 20 : 4}
          />
        </Sequence>
      ) : null}
      {escena.texto2 && escena.cambio ? (
        <Sequence layout="none" from={Math.round(escena.cambio * FPS)}>
          <TextoGrande
            texto={escena.texto2}
            color={negocio.color}
            acento={negocio.acento}
            arriba={escena.tipo === "mapa"}
            retraso={0}
          />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

// Gancho "del cielo hacia abajo": empieza mostrando solo el cielo y baja hasta el sujeto
const Cielo: React.FC<{ imagen: string }> = ({ imagen }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const avance = interpolate(frame, [0.2 * fps, 2.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(imagen)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: "50% 0%",
          scale: interpolate(avance, [0, 1], [2.6, 1]),
          // Desenfoque de movimiento mientras baja
          filter: `blur(${Math.sin(avance * Math.PI) * 6}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Clip: React.FC<{ archivo: string; encaje: "cubrir" | "tarjeta" }> = ({ archivo, encaje }) => {
  const src = staticFile(archivo);
  if (encaje === "cubrir") {
    return <Video src={src} muted loop objectFit="cover" style={{ width: "100%", height: "100%" }} />;
  }
  return (
    <AbsoluteFill>
      <Video
        src={src}
        muted
        loop
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          filter: "blur(40px) brightness(0.6)",
          scale: 1.2,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center" }}>
        <Video src={src} muted loop objectFit="contain" style={{ width: "100%" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Texto en pantalla al estilo de los Reels actuales: letras blancas grandes sin caja ni contorno,
// palabras que entran una por una y la parte entre *asteriscos* sobre una barra de marcador
// que se pinta de izquierda a derecha. Un degradado oscuro suave abajo asegura la lectura.
const TextoGrande: React.FC<{
  texto: string;
  color: string;
  acento: string;
  arriba: boolean;
  retraso: number;
}> = ({ texto, acento, arriba, retraso }) => {
  const frame = useCurrentFrame();
  const { px, vertical } = useEscala();
  const suave = Easing.out(Easing.cubic);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  // Separa en palabras recordando cuáles van resaltadas
  const palabras = texto
    .split("*")
    .flatMap((parte, i) => parte.split(/\s+/).filter(Boolean).map((p) => ({ p, marca: i % 2 === 1 })));
  // Las palabras resaltadas seguidas forman un solo bloque de marcador
  const grupos: { palabras: string[]; marca: boolean; indice: number }[] = [];
  palabras.forEach((w, i) => {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.marca && w.marca) ultimo.palabras.push(w.p);
    else grupos.push({ palabras: [w.p], marca: w.marca, indice: i });
  });

  const PASO = 3; // fotogramas entre palabra y palabra
  const entrada = (i: number) => ({
    opacity: interpolate(frame, [retraso + i * PASO, retraso + i * PASO + 6], [0, 1], clamp),
    translate: interpolate(frame, [retraso + i * PASO, retraso + i * PASO + 8], ["0px 28px", "0px 0px"], {
      ...clamp,
      easing: suave,
    }),
  });

  return (
    <AbsoluteFill>
      {/* Degradado oscuro para que el texto blanco se lea sobre cualquier fondo */}
      <AbsoluteFill
        style={{
          background: arriba
            ? "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 38%)"
            : "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0) 55%)",
          opacity: interpolate(frame, [retraso - 4, retraso + 6], [0, 1], clamp),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: px(70),
          // A la derecha queda libre la columna de "me gusta" y comentarios de Facebook
          right: px(vertical ? 150 : 400),
          ...(arriba ? { top: px(vertical ? 330 : 150) } : { bottom: px(vertical ? 470 : 110) }),
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          columnGap: px(20),
          rowGap: px(8),
          fontFamily: marca.fuentes.texto,
          fontWeight: 800,
          fontSize: px(vertical ? 86 : 72),
          lineHeight: 1.1,
          letterSpacing: px(-1),
          textTransform: "uppercase",
          color: "#ffffff",
        }}
      >
        {grupos.map((g, gi) => {
          if (!g.marca) {
            return g.palabras.map((p, k) => (
              <span key={`${gi}-${k}`} style={entrada(g.indice + k)}>
                {p}
              </span>
            ));
          }
          // Barra de marcador que se pinta de izquierda a derecha detrás de la frase clave
          const inicio = retraso + g.indice * PASO;
          const pintado = interpolate(frame, [inicio, inicio + 8], [0, 100], { ...clamp, easing: suave });
          return (
            <span
              key={gi}
              style={{
                ...entrada(g.indice),
                position: "relative",
                padding: `${px(2)}px ${px(14)}px`,
                color: "#111111",
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
                background: `linear-gradient(90deg, ${acento} ${pintado}%, transparent ${pintado}%)`,
                borderRadius: px(10),
              }}
            >
              {g.palabras.join(" ")}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const LogoEsquina: React.FC<{ logo: string }> = ({ logo }) => {
  const { px, vertical } = useEscala();
  return (
    <Img
      src={staticFile(logo)}
      style={{
        position: "absolute",
        top: px(vertical ? 90 : 40),
        left: px(40),
        width: px(vertical ? 300 : 260),
        borderRadius: px(16),
        boxShadow: `0 ${px(6)}px ${px(16)}px rgba(0,0,0,0.4)`,
      }}
    />
  );
};

const Cierre: React.FC<{ negocio: Negocio }> = ({ negocio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { px, vertical } = useEscala();
  const aparece = (desde: number) => ({
    opacity: interpolate(frame, [desde, desde + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    translate: interpolate(frame, [desde, desde + 10], ["0px 40px", "0px 0px"], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  });
  // El botón de WhatsApp "late" para llamar la atención
  const latido = 1 + Math.max(0, Math.sin((frame / fps) * Math.PI * 2.2)) * 0.06;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 30%, ${negocio.color} 0%, #021e45 100%)`,
        justifyContent: "center",
        alignItems: "center",
        gap: px(vertical ? 46 : 26),
        padding: px(70),
        fontFamily: marca.fuentes.texto,
        color: "#ffffff",
        textAlign: "center",
      }}
    >
      <Img
        src={staticFile(negocio.logo)}
        style={{
          width: px(vertical ? 900 : 700),
          scale: interpolate(frame, [0, 12], [0.6, 1], {
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 10 }),
          }),
        }}
      />
      <div style={{ ...aparece(8), fontFamily: marca.fuentes.titulo, fontSize: px(vertical ? 70 : 56), color: negocio.acento, textTransform: "uppercase" }}>
        {negocio.eslogan}
      </div>
      <div
        style={{
          ...aparece(14),
          display: "flex",
          alignItems: "center",
          gap: px(20),
          padding: `${px(22)}px ${px(46)}px`,
          borderRadius: px(999),
          background: "#25d366",
          fontWeight: 800,
          fontSize: px(vertical ? 70 : 56),
          boxShadow: `0 ${px(10)}px 0 rgba(0,0,0,0.35)`,
          scale: frame > 24 ? latido : 1,
        }}
      >
        <WhatsappIcono tamano={px(vertical ? 76 : 60)} />
        {negocio.whatsapp}
      </div>
      <div style={{ ...aparece(20), fontWeight: 800, fontSize: px(vertical ? 54 : 44), textTransform: "uppercase" }}>
        {negocio.llamada}
      </div>
      <div style={{ ...aparece(24), fontWeight: 700, fontSize: px(vertical ? 44 : 36), opacity: 0.9 }}>
        📍 {negocio.direccion}
      </div>
    </AbsoluteFill>
  );
};

const WhatsappIcono: React.FC<{ tamano: number }> = ({ tamano }) => (
  <svg width={tamano} height={tamano} viewBox="0 0 32 32">
    <path
      fill="#ffffff"
      d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3.2 29l6.9-1.8c1.9 1 4 1.6 6 1.6 7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.1 1.1 1.1-4-.3-.4c-1.1-1.7-1.6-3.6-1.6-5.5 0-5.8 4.8-10.5 10.7-10.5s10.7 4.7 10.7 10.5S21.9 26.1 16 26.1zm5.9-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7.1-.1.3-.4.5-.6.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.4-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.6 5.8 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"
    />
  </svg>
);
