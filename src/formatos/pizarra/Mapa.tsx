// Mapa animado en 2D plano (estilo OverSimplified / Armchair Historian), sin claves ni internet:
// países de Natural Earth (dominio público, paquete world-atlas) proyectados con d3-geo.
// Los países se pintan uno a uno, las rutas se dibujan con flecha y la cámara se acerca despacio.
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { feature } from "topojson-client";
import mundo from "world-atlas/countries-50m.json";
import { z } from "zod";

const punto = z.tuple([z.number(), z.number()]); // [longitud, latitud]
export const mapaSchema = z.object({
  centro: punto,
  // 1 = el mundo entero; 4 ≈ un continente; 8 ≈ un país como el Perú
  zoom: z.number().optional(),
  zoomFinal: z.number().optional(),
  // Nombres en inglés de Natural Earth ("Peru", "Chile", "France"…). "en" = momento de la escena (0 a 1)
  paises: z.array(z.object({ nombre: z.string(), color: z.string().optional(), en: z.number().optional() })).optional(),
  rutas: z.array(z.object({ de: punto, a: punto, color: z.string().optional(), en: z.number().optional() })).optional(),
  etiquetas: z.array(z.object({ texto: z.string(), lugar: punto, en: z.number().optional(), tam: z.number().optional() })).optional(),
  marcadores: z.array(z.object({ lugar: punto, en: z.number().optional() })).optional(),
});
export type MapaProps = z.infer<typeof mapaSchema>;

const PAISES = feature(mundo as never, (mundo as never as { objects: { countries: never } }).objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
const MAR = "#9fd3f2", TIERRA = "#f3e9d2", TINTA = "#1f1f1f";

export const Mapa: React.FC<MapaProps & { duracion: number }> = ({ centro, zoom = 4, zoomFinal, paises = [], rutas = [], etiquetas = [], marcadores = [], duracion }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  // La cámara se acerca despacio durante toda la escena (o hasta zoomFinal)
  const z = interpolate(frame, [0, duracion], [zoom, zoomFinal ?? zoom * 1.12], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const proyeccion = geoMercator().center(centro).scale((width / (2 * Math.PI)) * z).translate([width / 2, height / 2]);
  const camino = geoPath(proyeccion);
  const resaltados = useMemo(() => new Map(paises.map((p) => [p.nombre, p])), [paises]);
  const momento = (en = 0.15) => en * duracion;

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, ${MAR} 40%, #6fb4e0 100%)` }}>
      <svg width={width} height={height}>
        {PAISES.features.map((f: Feature<Geometry, { name: string }>, i) => {
          const r = resaltados.get(f.properties.name);
          const t = r ? spring({ frame: frame - momento(r.en), fps, config: { damping: 14 } }) : 0;
          const d = camino(f);
          if (!d) return null;
          return (
            <path key={i} d={d} fill={r && t > 0 ? mezclar(TIERRA, r.color ?? "#ff6464", t) : TIERRA}
              stroke={TINTA} strokeWidth={r && t > 0 ? 2.5 : 1.2} strokeLinejoin="round" />
          );
        })}
        {rutas.map((r, i) => {
          const [x1, y1] = proyeccion(r.de) ?? [0, 0];
          const [x2, y2] = proyeccion(r.a) ?? [0, 0];
          // Curva hacia arriba, como las flechas de los mapas de guerra
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.25;
          const p = interpolate(frame, [momento(r.en), momento(r.en) + fps * 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          const ang = (Math.atan2(y2 - my, x2 - mx) * 180) / Math.PI;
          return (
            <g key={`r${i}`}>
              <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none" stroke={r.color ?? "#d7263d"} strokeWidth={10}
                strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
              {p > 0.97 ? <path d="M -26 -16 L 4 0 L -26 16 Z" fill={r.color ?? "#d7263d"} transform={`translate(${x2} ${y2}) rotate(${ang})`} /> : null}
            </g>
          );
        })}
        {marcadores.map((m, i) => {
          const [x, y] = proyeccion(m.lugar) ?? [0, 0];
          const t = spring({ frame: frame - momento(m.en), fps, config: { damping: 9 } });
          return (
            <g key={`m${i}`} transform={`translate(${x} ${y}) scale(${t})`}>
              <circle r={34 + 10 * Math.sin(frame / 6)} fill="#d7263d" opacity={0.25} />
              <path d="M 0 0 C -22 -30 -22 -58 0 -58 C 22 -58 22 -30 0 0 Z" fill="#d7263d" stroke={TINTA} strokeWidth={4} />
              <circle cy={-40} r={8} fill="#ffffff" />
            </g>
          );
        })}
        {etiquetas.map((e, i) => {
          const [x, y] = proyeccion(e.lugar) ?? [0, 0];
          const t = spring({ frame: frame - momento(e.en), fps, config: { damping: 11, stiffness: 160 } });
          return (
            <text key={`e${i}`} x={x} y={y} textAnchor="middle" fontFamily="Texto" fontWeight={900} fontSize={e.tam ?? 56}
              fill="#ffffff" stroke={TINTA} strokeWidth={10} paintOrder="stroke" style={{ textTransform: "uppercase" }}
              transform={`translate(${x} ${y}) scale(${t}) translate(${-x} ${-y})`}>
              {e.texto}
            </text>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const mezclar = (a: string, b: string, t: number) => {
  const c = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(c(a, i) + (c(b, i) - c(a, i)) * Math.min(1, t))).join(",")})`;
};
