import { useEffect, useMemo, useState } from "react";
import { Caption, createTikTokStyleCaptions, TikTokPage } from "@remotion/captions";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import { useEscala } from "../../comun/escala";
import { marca } from "../../marca";
import { Estilo } from "./estilos";

// Cuántos milisegundos de voz entran en cada "página" de subtítulos (≈ 3 a 5 palabras)
const MS_POR_PAGINA = 1300;

// Carga el archivo de subtítulos (palabras con sus tiempos). Devuelve null si no hay archivo.
export const usePalabras = (archivo?: string) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => (archivo ? delayRender("Cargando subtítulos") : null));

  useEffect(() => {
    if (!archivo || handle === null) return;
    fetch(staticFile(archivo))
      .then((r) => r.json())
      .then((data: Caption[]) => {
        setCaptions(data);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [archivo, continueRender, cancelRender, handle]);

  return captions;
};

// ¿Está sonando alguna palabra en este momento? (para mover la boca del personaje)
export const estaHablando = (captions: Caption[], ms: number) =>
  captions.some((c) => c.startMs - 60 <= ms && ms < c.endMs + 60);

// Pone cada página de subtítulos en su momento. `children` decide cómo se dibuja.
export const PaginasEnElTiempo: React.FC<{
  captions: Caption[];
  children: (page: TikTokPage) => React.ReactNode;
}> = ({ captions, children }) => {
  const { fps } = useVideoConfig();
  const pages = useMemo(
    () =>
      createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: MS_POR_PAGINA })
        .pages,
    [captions],
  );

  return (
    <>
      {pages.map((page, i) => {
        const siguiente = pages[i + 1];
        const desde = Math.round((page.startMs / 1000) * fps);
        const hasta = Math.round(
          ((siguiente ? siguiente.startMs : page.startMs + page.durationMs + 400) / 1000) * fps,
        );
        if (hasta <= desde) return null;
        return (
          <Sequence key={i} from={desde} durationInFrames={hasta - desde} layout="none">
            {children(page)}
          </Sequence>
        );
      })}
    </>
  );
};

// Página "falsa" con todo el texto de una escena, para la vista previa sin grabación
export const paginaProvisional = (texto: string): TikTokPage => ({
  text: texto,
  startMs: 0,
  durationMs: 0,
  tokens: [{ text: texto, fromMs: -1, toMs: -1 }],
});

// Subtítulos abajo de la pantalla (estilo misterio)
export const SubtituloAbajo: React.FC<{ page: TikTokPage; estilo: Estilo; pequeno?: boolean }> = ({
  page,
  estilo,
  pequeno,
}) => {
  const { px, vertical } = useEscala();
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: px(vertical ? 430 : 90),
        paddingLeft: px(80),
        paddingRight: px(80),
      }}
    >
      <TextoPagina page={page} estilo={estilo} tamano={pequeno ? 46 : vertical ? 76 : 64} />
    </AbsoluteFill>
  );
};

// El texto de una página con la palabra que se está diciendo resaltada
export const TextoPagina: React.FC<{ page: TikTokPage; estilo: Estilo; tamano: number }> = ({
  page,
  estilo,
  tamano,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { px } = useEscala();
  const ahoraMs = page.startMs + (frame / fps) * 1000;
  const marcador = estilo.subtituloModo === "marcador";

  return (
    <div
      style={{
        fontFamily: marca.fuentes.texto,
        fontWeight: 800,
        fontSize: px(tamano),
        lineHeight: 1.25,
        textAlign: "center",
        color: estilo.texto,
        whiteSpace: "pre-wrap",
        scale: interpolate(frame, [0, 5], [0.85, 1], { extrapolateRight: "clamp" }),
        ...(marcador
          ? {}
          : {
              WebkitTextStroke: `${px(10)}px ${estilo.subtituloBorde}`,
              paintOrder: "stroke fill",
              textShadow: `0 ${px(6)}px ${px(18)}px rgba(0,0,0,0.6)`,
            }),
      }}
    >
      {page.tokens.map((t, i) => {
        const activa = t.fromMs <= ahoraMs && t.toMs > ahoraMs;
        return (
          <span
            key={`${t.fromMs}-${i}`}
            style={
              marcador
                ? {
                    backgroundColor: activa ? estilo.resaltado : "transparent",
                    borderRadius: px(10),
                    padding: `0 ${px(6)}px`,
                    boxDecorationBreak: "clone",
                  }
                : { color: activa ? estilo.resaltado : estilo.texto }
            }
          >
            {t.text}
          </span>
        );
      })}
    </div>
  );
};
