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

export const Subtitulos: React.FC<{ archivo: string; estilo: Estilo }> = ({
  archivo,
  estilo,
}) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Cargando subtítulos"));
  const { fps } = useVideoConfig();

  useEffect(() => {
    fetch(staticFile(archivo))
      .then((r) => r.json())
      .then((data: Caption[]) => {
        setCaptions(data);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [archivo, continueRender, cancelRender, handle]);

  const pages = useMemo(
    () =>
      captions
        ? createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: MS_POR_PAGINA })
            .pages
        : [],
    [captions],
  );

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const siguiente = pages[i + 1];
        const desde = Math.round((page.startMs / 1000) * fps);
        const hasta = Math.round(
          ((siguiente ? siguiente.startMs : page.startMs + page.durationMs + 400) / 1000) * fps,
        );
        if (hasta <= desde) return null;
        return (
          <Sequence key={i} from={desde} durationInFrames={hasta - desde} layout="none">
            <Pagina page={page} estilo={estilo} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Sin grabación todavía: muestra el texto de la escena para revisar el ritmo
export const SubtituloProvisional: React.FC<{ texto: string; estilo: Estilo }> = ({
  texto,
  estilo,
}) => {
  const page: TikTokPage = {
    text: texto,
    startMs: 0,
    durationMs: 0,
    tokens: [{ text: texto, fromMs: -1, toMs: -1 }],
  };
  return <Pagina page={page} estilo={estilo} pequeno />;
};

const Pagina: React.FC<{ page: TikTokPage; estilo: Estilo; pequeno?: boolean }> = ({
  page,
  estilo,
  pequeno,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { px, vertical } = useEscala();
  const ahoraMs = page.startMs + (frame / fps) * 1000;
  const marcador = estilo.subtituloModo === "marcador";

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
      <div
        style={{
          fontFamily: marca.fuentes.texto,
          fontWeight: 800,
          fontSize: px(pequeno ? 46 : vertical ? 76 : 64),
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
    </AbsoluteFill>
  );
};
