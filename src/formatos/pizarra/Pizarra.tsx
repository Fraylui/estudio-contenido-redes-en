// Formato pizarra (estilo DOMINALO / DECIDO VIVIR MEJOR): fondo de papel, un dibujo hecho a mano que
// se traza solo en cada frase y el texto apareciendo palabra por palabra con una palabra en amarillo.
import { Audio } from "@remotion/media";
import { getBoundingBox, getLength } from "@remotion/paths";
import { loadFont } from "@remotion/fonts";
import { useMemo } from "react";
import { z } from "zod";
import { lightLeak } from "@remotion/effects/light-leak";
import {
  AbsoluteFill, CalculateMetadataFunction, Easing, Img, interpolate, Solid, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { composicionSchema, resolverDibujo, type DibujoPizarra } from "./dibujos";
import { Mapa, mapaSchema } from "./Mapa";
import type { Trazo } from "./trazos";
import catalogoSfx from "../../../public/sfx/efectos/sfx.json";
// Biblioteca grande de Mixkit (scripts/bajar-sfx.py): "hooks/cinematic-whoosh-deep-impact", "historia/…", "naturaleza/…"
import bibliotecaSfx from "../../../public/sfx/biblioteca/catalogo.json";

loadFont({ family: "Mano", url: staticFile("fuentes/PatrickHand.woff2") });

export const pizarraSchema = z.object({
  escenas: z.array(
    z.object({
      // Nombre de un dibujo de la biblioteca, o una escena armada (personaje + íconos + rótulo)
      dibujo: z.union([z.string(), composicionSchema]),
      texto: z.string(),
      // Palabra (o palabras) que se resaltan en amarillo
      resaltar: z.string().optional(),
      segundos: z.number().optional(),
      // Efecto de sonido del catálogo (public/sfx/efectos/sfx.json) y el segundo de la escena en que golpea.
      // Solo en momentos clave: un sonido en cada escena cansa al oído.
      sonido: z.string().optional(),
      sonidoEn: z.number().optional(),
      // Etiqueta de sección ("Paso 2 de 5", "La ciencia"…): se queda arriba hasta que otra escena la cambie
      etiqueta: z.string().optional(),
      // Fondo de la escena: "papel", un color de la paleta ("cielo", "mostaza", "menta", "durazno", "lila", "blanco")
      // o un color #hex. Si no se indica, cambia solo de color en cada sección, como Aprendiz Financiero.
      fondo: z.string().optional(),
      // Lluvia de confeti en esta escena (logros, resultados)
      confeti: z.boolean().optional(),
      // Mapa animado en vez de fondo y dibujo (guerras, países, rutas, lugares): ver Mapa.tsx
      mapa: mapaSchema.optional(),
      // Revelación por capas: el dibujo aparece primero como silueta negra y se revela con un destello
      silueta: z.boolean().optional(),
      // Gráfico de barras que crecen (economía, población, comparaciones)
      // Sonido ambiente de la biblioteca, en bucle y muy bajo durante la escena ("naturaleza/…", "historia/…")
      ambiente: z.string().optional(),
      // Partículas en bucle sobre la escena: lluvia, polvo, chispas, nieve o brasas
      particulas: z.enum(["lluvia", "polvo", "chispas", "nieve", "brasas"]).optional(),
      barras: z.array(z.object({ etiqueta: z.string(), valor: z.number(), color: z.string().optional() })).optional(),
    }),
  ),
  voz: z.string().optional(),
  frasesVoz: z.array(z.object({ inicio: z.number(), fin: z.number() })).optional(),
  musica: z.string().optional(),
  // Shorts: título gancho fijo arriba durante todo el video ("¿POR QUÉ GASTAS MÁS CON TARJETA?")
  gancho: z.string().optional(),
});

type Props = z.infer<typeof pizarraSchema>;
const FPS = 30;

// Partículas en bucle (lluvia, polvo, chispas, nieve, brasas): cada una con semilla fija, cae o sube y vuelve a empezar
const PARTICULAS = {
  lluvia: { n: 140, vy: 38, vx: -6, tam: [3, 34], color: "rgba(200,225,255,0.55)", sube: false },
  polvo: { n: 60, vy: 0.6, vx: 0.8, tam: [3, 7], color: "rgba(255,240,210,0.55)", sube: false },
  chispas: { n: 50, vy: -5, vx: 0, tam: [4, 8], color: "rgba(255,210,90,0.95)", sube: true },
  nieve: { n: 90, vy: 2.2, vx: 0.7, tam: [5, 11], color: "rgba(255,255,255,0.9)", sube: false },
  brasas: { n: 45, vy: -2.6, vx: 0.5, tam: [4, 9], color: "rgba(255,120,40,0.9)", sube: true },
} as const;
const Particulas: React.FC<{ tipo: keyof typeof PARTICULAS }> = ({ tipo }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = PARTICULAS[tipo];
  const azar = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height}>
        {Array.from({ length: p.n }, (_, i) => {
          const v = 0.6 + azar(i, 1) * 0.8;
          const y0 = azar(i, 2) * height, x0 = azar(i, 3) * width;
          const y = (((y0 + p.vy * v * frame) % height) + height) % height;
          const x = (((x0 + p.vx * frame + Math.sin(frame / 20 + i) * 12) % width) + width) % width;
          const t = p.tam[0] + azar(i, 4) * (p.tam[1] - p.tam[0]);
          const brillo = tipo === "chispas" || tipo === "brasas" ? 0.5 + 0.5 * Math.sin(frame / 4 + i) : 1;
          return tipo === "lluvia"
            ? <line key={i} x1={x} y1={y} x2={x + p.vx * 0.6} y2={y + t} stroke={p.color} strokeWidth={2.4} strokeLinecap="round" />
            : <circle key={i} cx={x} cy={y} r={t / 2} fill={p.color} opacity={brillo} style={{ filter: p.sube ? "blur(0.6px)" : undefined }} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Título gancho de los Shorts: caja blanca arriba con texto negro grueso y la última palabra en rojo, entra con rebote
const Gancho: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const pop = spring({ frame, fps: FPS, config: { damping: 10, stiffness: 180 } });
  const palabras = texto.trim().split(/\s+/);
  const ultima = palabras.pop();
  return (
    <div style={{ position: "absolute", top: 110, left: 50, right: 50, display: "flex", justifyContent: "center", scale: `${pop}`, rotate: "-1.5deg" }}>
      <div style={{ background: "#ffffff", border: "8px solid #111", borderRadius: 26, padding: "18px 30px", boxShadow: "0 14px 0 #111",
        fontFamily: "Texto", fontWeight: 900, fontSize: 64, lineHeight: 1.05, textAlign: "center", textTransform: "uppercase", color: "#111" }}>
        {palabras.join(" ")} <span style={{ color: "#e02424" }}>{ultima}</span>
      </div>
    </div>
  );
};

// Barras que crecen una tras otra, con su valor contando y la etiqueta debajo
const Barras: React.FC<{ datos: { etiqueta: string; valor: number; color?: string }[]; duracion: number }> = ({ datos, duracion }) => {
  const frame = useCurrentFrame();
  const maximo = Math.max(...datos.map((d) => d.valor)) || 1;
  const colores = ["#4d9de8", "#ff6464", "#3fbf6f", "#ffc21a", "#9b7be0", "#ff9b3d"];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 60, paddingBottom: 70, position: "relative" }}>
      {datos.map((d, i) => {
        const inicio = (duracion * 0.5 * i) / datos.length;
        const t = interpolate(frame, [inicio, inicio + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.4)) });
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 200 }}>
            <div style={{ fontFamily: "Texto", fontWeight: 900, fontSize: 52, color: "#ffffff", WebkitTextStroke: "8px #111", paintOrder: "stroke", opacity: t > 0 ? 1 : 0 }}>
              {contar(d.valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "), frame - inicio, FPS)}
            </div>
            <div style={{ width: 170, height: `${(d.valor / maximo) * 560 * t}px`, background: d.color ?? colores[i % colores.length],
              border: "6px solid #1f1f1f", borderRadius: "18px 18px 6px 6px", boxShadow: "0 18px 30px rgba(0,0,0,0.3), inset 0 -14px 0 rgba(0,0,0,0.15)" }} />
            <div style={{ fontFamily: "Texto", fontWeight: 800, fontSize: 34, color: "#ffffff", WebkitTextStroke: "6px #111", paintOrder: "stroke", marginTop: 14, textAlign: "center" }}>
              {d.etiqueta}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Números que cuentan solos, como en los videos de MrBeast: "1 800" sube de 0 a 1 800 en 0,9 s (también "+78 000", "12 %")
const contar = (texto: string, f: number, fps: number) => {
  const m = texto.match(/^([^\d]*)(\d{1,3}(?:[ .,]\d{3})*|\d+)(.*)$/);
  if (!m) return texto;
  const total = Number(m[2].replace(/[ .,]/g, ""));
  // Los años ("1904") y los números chicos no cuentan: se ven raros subiendo
  if (total < 10 || (/^\d{4}$/.test(m[2]) && total >= 1000 && total <= 2100)) return texto;
  const t = interpolate(f, [0, 0.9 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const sep = m[2].match(/[ .,]/)?.[0] ?? (total >= 10000 ? " " : "");
  const n = Math.round(total * t).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return `${m[1]}${n}${m[3]}`;
};

// Música de fondo que se aparta cuando habla la voz (ducking): baja bajo la voz y sube un poco en las pausas
// Los MP3 se dejan a −20 LUFS (scripts/bajar-musica.sh); la voz está a −14 LUFS
const MUSICA_PAUSA = 0.4; // ≈ −28 LUFS en las pausas
const MUSICA_VOZ = 0.2; // ≈ −34 LUFS, 20 dB bajo la voz: se siente, pero no tapa ni una palabra
const volumenMusica = (f: number, frases: { inicio: number; fin: number }[], total: number) => {
  const t = f / FPS;
  const enVoz = frases.reduce(
    (m, fr) => Math.max(m, interpolate(t, [fr.inicio - 0.3, fr.inicio, fr.fin, fr.fin + 0.5], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
    0,
  );
  const fundido = interpolate(f, [0, FPS, total - 2 * FPS, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (MUSICA_PAUSA + (MUSICA_VOZ - MUSICA_PAUSA) * enVoz) * fundido;
};

// Cada escena dura lo que su frase de la narración (escena 1 = frase 1, escena 2 = frase 2…)
export const calcularPizarra: CalculateMetadataFunction<Props> = ({ props }) => {
  const f = props.frasesVoz;
  const escenas = f?.length
    ? props.escenas.map((e, i) => {
        const inicio = i === 0 ? 0 : f[i]?.inicio - 0.1;
        const fin = i + 1 < props.escenas.length && f[i + 1] ? f[i + 1].inicio - 0.1 : (f[f.length - 1]?.fin ?? 0) + 1.2;
        return { ...e, segundos: Math.max(1, fin - inicio) };
      })
    : props.escenas.map((e) => ({ ...e, segundos: e.segundos ?? 4 }));
  return {
    durationInFrames: Math.round(escenas.reduce((t, e) => t + (e.segundos ?? 4), 0) * FPS),
    props: { ...props, escenas },
  };
};

export const Pizarra: React.FC<Props> = ({ escenas, voz, frasesVoz, musica, gancho }) => {
  const { durationInFrames, width, height } = useVideoConfig();
  let desde = 0;
  let etiqueta: string | undefined;
  // Color de cada escena: cambia con cada sección (o cada 4 escenas si el video no tiene secciones)
  const conSecciones = escenas.some((e) => e.etiqueta);
  let seccion = 0;
  let ultima: string | undefined;
  const fondos = escenas.map((e, i) => {
    if (conSecciones && e.etiqueta && e.etiqueta !== ultima) {
      seccion++;
      ultima = e.etiqueta;
    }
    return e.fondo ?? ORDEN_FONDOS[(conSecciones ? seccion : Math.floor(i / 4)) % ORDEN_FONDOS.length];
  });
  return (
    <AbsoluteFill>
      <Papel />
      {escenas.map((e, i) => {
        const inicio = desde;
        const duracion = Math.round((e.segundos ?? 4) * FPS);
        desde += duracion;
        return (
          <Sequence key={i} from={inicio} durationInFrames={duracion}>
            {e.mapa ? <Mapa {...e.mapa} duracion={duracion} /> : <Fondo nombre={fondos[i]} />}
            <Escena {...e} />
            {(() => {
              const nueva = e.etiqueta !== undefined && e.etiqueta !== etiqueta;
              etiqueta = e.etiqueta ?? etiqueta;
              return (
                <>
                  {etiqueta && !(gancho && height > width) ? <Etiqueta texto={etiqueta} entra={nueva} /> : null}
                  {nueva && i > 0 ? (
                    <Sequence durationInFrames={24} layout="none"><Destello semilla={i} /></Sequence>
                  ) : null}
                </>
              );
            })()}
            {e.confeti ? <Confeti /> : null}
            {e.particulas ? <Particulas tipo={e.particulas} /> : null}
            {e.ambiente && CATALOGO[e.ambiente] ? (
              <Audio src={staticFile(`sfx/${CATALOGO[e.ambiente].archivo}`)} loop
                volume={(f) => 0.16 * interpolate(f, [0, 12, duracion - 12, duracion], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
            ) : null}
            {e.sonido ? <Efecto id={e.sonido} en={e.sonidoEn ?? 0.6} /> : null}
            {/* Ritmo de sonido como en los canales de alta retención: cada cambio y cada aparición suena, bajito y variado */}
            {i > 0 && !(e.sonido && (e.sonidoEn ?? 0.6) < 0.5) ? <Efecto id={WHOOSH[i % 3]} en={0.05} extraDb={-12} /> : null}
            {momentos(resolverDibujo(e.dibujo), duracion).apariciones.map((f, k) => (
              <Efecto key={k} id="pop" en={f / FPS} extraDb={-13} velocidad={0.9 + ((i * 7 + k * 3) % 5) * 0.06} />
            ))}
          </Sequence>
        );
      })}
      {gancho && height > width ? <Gancho texto={gancho} /> : null}
      {voz ? <Audio src={staticFile(voz)} /> : null}
      {musica ? (
        <Audio src={staticFile(musica)} loop volume={(f) => volumenMusica(f, frasesVoz ?? [], durationInFrames)} />
      ) : null}
    </AbsoluteFill>
  );
};

type Sfx = { archivo: string; impacto_s: number; ganancia_db_sugerida: number };
const CATALOGO = { ...(catalogoSfx as Record<string, Sfx>), ...(bibliotecaSfx as Record<string, Sfx>) };

// El sonido se adelanta su punto de impacto para que el golpe caiga justo en "en". Va 6 dB más bajo que en
// los anuncios: aquí acompaña a una narración tranquila.
const Efecto: React.FC<{ id: string; en: number; extraDb?: number; velocidad?: number }> = ({ id, en, extraDb = -6, velocidad = 1 }) => {
  const c = CATALOGO[id];
  if (!c) return null;
  return (
    <Sequence from={Math.max(0, Math.round((en - c.impacto_s / velocidad) * FPS))} layout="none">
      <Audio src={staticFile(c.archivo.includes("/") ? `sfx/${c.archivo}` : `sfx/efectos/${c.archivo}`)} volume={Math.pow(10, (c.ganancia_db_sugerida + extraDb) / 20)} playbackRate={velocidad} />
    </Sequence>
  );
};

const WHOOSH = ["whoosh", "whoosh_2", "whoosh_3"];

// Calendario de una escena (en cuadros): cuánto tarda el trazo y cuándo aparece cada objeto o rótulo.
// Las personas (peep) entran primero; el resto se reparte hasta el 75 % de la escena para que siempre pase algo.
export const momentos = (d: DibujoPizarra, total: number) => {
  const objetos = d.objetos ?? [];
  const textos = d.textos ?? [];
  const trazos = d.trazos ?? [];
  const tiempoTrazos = trazos.length ? Math.min(total * 0.4, 1.8 * FPS) : 0;
  const luego = [...objetos.filter((o) => !o.img.startsWith("peep:")), ...textos];
  const fin = Math.max(tiempoTrazos + 12, total * 0.75);
  const inicioDe = (k: number) => tiempoTrazos + (luego.length > 1 ? (k / (luego.length - 1)) * (fin - tiempoTrazos) * 0.8 : 0);
  let k = 0;
  const objetosEn = objetos.map((o) => (o.img.startsWith("peep:") ? 2 : inicioDe(k++)));
  const textosEn = textos.map(() => inicioDe(k++));
  return { tiempoTrazos, objetosEn, textosEn, apariciones: [...objetosEn, ...textosEn].map(Math.round) };
};

// Fondos de color con piso, como los escenarios de Aprendiz Financiero: pared lisa con luz suave arriba
// y un piso más oscuro con su línea. "papel" deja la textura de papel arrugado.
const FONDOS: Record<string, [string, string]> = {
  "cuarto-cielo": ["#a7dcef", "#b9a6d6"], "cuarto-mostaza": ["#e8c87e", "#c9a35c"], "cuarto-menta": ["#bfe8cf", "#8fc7a3"],
  "cuarto-durazno": ["#f8c9ab", "#e39a7a"], "cuarto-lila": ["#d6c4f0", "#a993d3"], blanco: ["#ffffff", "#e9e9e9"],
};
const ORDEN_FONDOS = ["cielo", "durazno", "menta", "lila", "mostaza"];

const MODERNOS: Record<string, [string, string, string]> = {
  // fondo arriba, fondo abajo, color de las manchas
  cielo: ["#5ec8f2", "#2f6fd6", "#9ff0ff"], mostaza: ["#ffcf4d", "#ff8a3d", "#fff2a8"],
  menta: ["#43d9a3", "#178f8f", "#b8ffe0"], durazno: ["#ff9a8b", "#ff5f7e", "#ffd3b5"],
  lila: ["#a78bfa", "#6d42d9", "#e3d4ff"], noche: ["#283a8f", "#120f3a", "#5b6cff"],
};

const Fondo: React.FC<{ nombre: string }> = ({ nombre }) => {
  const frame = useCurrentFrame();
  if (nombre === "papel") return null;
  // Fondo ilustrado con IA (public/assets/ia/<nombre>.jpg): un poco desenfocado y oscuro para dar profundidad
  // y que el personaje resalte, con un acercamiento lento de cámara (Ken Burns)
  if (nombre.startsWith("ia:")) {
    const [, archivo, modo] = nombre.split(":");
    const paneo = modo === "paneo";
    return (
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#1f1f1f" }}>
        <Img src={staticFile(`assets/ia/${archivo}.jpg`)} style={{
          width: "100%", height: "100%", objectFit: "cover", filter: "blur(3px) brightness(0.88) saturate(1.1)",
          scale: paneo ? "1.22" : `${interpolate(frame, [0, 300], [1.04, 1.12], { extrapolateRight: "clamp" })}`,
          // Paneo lateral: la cámara recorre el escenario, como en un documental
          translate: paneo ? `${interpolate(frame, [0, 300], [8, -8], { extrapolateRight: "clamp" })}% 0` : undefined,
        }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.35) 100%)" }} />
      </AbsoluteFill>
    );
  }
  // Fondo moderno (por defecto): degradado vivo + manchas que flotan, como los motion graphics de After Effects
  if (MODERNOS[nombre]) {
    const [arriba, abajo, mancha] = MODERNOS[nombre];
    const t = frame / 30;
    return (
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${arriba}, ${abajo})`, overflow: "hidden" }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{
            position: "absolute", width: 700, height: 700, borderRadius: "50%", background: mancha, opacity: 0.35, filter: "blur(90px)",
            left: `${[10, 60, 35][k] + 6 * Math.sin(t * 0.4 + k * 2)}%`, top: `${[5, 40, 70][k] + 6 * Math.cos(t * 0.3 + k)}%`,
            translate: "-50% -50%",
          }} />
        ))}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)" }} />
      </AbsoluteFill>
    );
  }
  const [pared, piso] = FONDOS[nombre] ?? [nombre, "rgba(0,0,0,0.12)"];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.45), rgba(255,255,255,0) 60%), ${pared}` }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "17%", background: piso, borderTop: "6px solid #1f1f1f" }} />
      {nombre !== "blanco" ? <Decorado /> : null}
    </AbsoluteFill>
  );
};

// Decorado suave del escenario (ventana con cielo, cuadro y planta) para que no se vea plano
const Decorado: React.FC = () => (
  <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }}>
    <g stroke="#1f1f1f" strokeWidth="6" strokeLinejoin="round">
      <rect x="1600" y="150" width="230" height="300" rx="10" fill="#e9f7ff" />
      <path d="M1715 150 V450 M1600 300 H1830" fill="none" />
      <path d="M1585 140 Q1600 300 1570 470 M1845 140 Q1830 300 1860 470" fill="none" />
      <rect x="90" y="190" width="170" height="130" rx="6" fill="#fff6d6" />
      <path d="M115 295 L160 240 L195 280 L215 260 L240 295 Z" fill="#9fd3a8" />
      <path d="M150 885 Q140 820 110 790 M150 885 Q160 800 190 770 M150 885 Q150 810 150 760" fill="none" />
      <path d="M115 885 H185 L175 945 H125 Z" fill="#e08a5c" />
    </g>
  </svg>
);

// Destello de luz de color al cambiar de sección (light leak de @remotion/effects)
const Destello: React.FC<{ semilla: number }> = ({ semilla }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <Solid width={width} height={height} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}
      effects={[lightLeak({ seed: semilla, hueShift: (semilla * 47) % 360, progress: interpolate(frame, [0, 23], [0, 1], { extrapolateRight: "clamp" }) })]} />
  );
};

// Confeti de colores que cae girando (hecho en código: sin archivos externos)
const Confeti: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const colores = ["#ffe14d", "#ff5f7e", "#43d9a3", "#5ec8f2", "#a78bfa", "#ff8a3d"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 70 }, (_, k) => {
        const azar = (n: number) => ((Math.sin(k * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1;
        const t = frame - azar(1) * 12;
        if (t < 0) return null;
        const x = azar(2) * width + Math.sin(t / 9 + k) * 40;
        const y = -40 + t * (9 + azar(3) * 9);
        if (y > height + 40) return null;
        return <div key={k} style={{ position: "absolute", left: x, top: y, width: 16, height: 26, background: colores[k % colores.length],
          borderRadius: 3, rotate: `${t * (8 + azar(4) * 10)}deg`, scale: `${0.7 + azar(5) * 0.6} 1` }} />;
      })}
    </AbsoluteFill>
  );
};

// Etiqueta de sección arriba a la izquierda, con una barra que se llena si dice "Paso N de M"
const Etiqueta: React.FC<{ texto: string; entra: boolean }> = ({ texto, entra }) => {
  const frame = useCurrentFrame();
  const pop = entra ? spring({ frame, fps: FPS, config: { damping: 12, stiffness: 180 } }) : 1;
  const paso = texto.match(/(\d+)\s*de\s*(\d+)/i);
  return (
    <div style={{ position: "absolute", top: 40, left: 48, transform: `scale(${pop}) rotate(-2deg)`, transformOrigin: "left center" }}>
      <div style={{ fontFamily: "Titulo", fontSize: 46, color: "#fff", background: "#1f1f1f", padding: "8px 22px 2px", letterSpacing: 1 }}>
        {texto.toUpperCase()}
      </div>
      {paso ? (
        <div style={{ height: 12, width: 260, background: "#ffffff", border: "3px solid #1f1f1f", marginTop: 8 }}>
          <div style={{ height: "100%", width: `${(Number(paso[1]) / Number(paso[2])) * 100}%`, background: "#ffe14d" }} />
        </div>
      ) : null}
    </div>
  );
};

// Papel arrugado: textura de ruido con luz rasante, sin imágenes externas
const Papel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#f3efe6" }}>
    <svg width="100%" height="100%">
      <filter id="arrugas">
        <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="5" seed="3" />
        <feDiffuseLighting lightingColor="#ffffff" surfaceScale="2.2">
          <feDistantLight azimuth="45" elevation="62" />
        </feDiffuseLighting>
      </filter>
      <rect width="100%" height="100%" filter="url(#arrugas)" opacity="0.8" style={{ mixBlendMode: "multiply" }} />
    </svg>
  </AbsoluteFill>
);

const Escena: React.FC<Props["escenas"][number]> = ({ dibujo, texto, resaltar, segundos, sonido, sonidoEn, silueta, barras }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const horizontal = width > height;
  const total = (segundos ?? 4) * FPS;
  // Zoom lento de cámara y un "punch-in" rápido cuando aparece la palabra clave (estilo alta retención)
  const palabras = texto.split(/\s+/);
  const limpia = (p: string) => p.toLowerCase().replace(/[¿?¡!.,:;…"«»]/g, "");
  const claves = new Set((resaltar ?? "").split(/\s+/).map(limpia).filter(Boolean));
  const primera = palabras.findIndex((p) => claves.has(limpia(p)));
  const golpe = primera >= 0 ? (primera / palabras.length) * total * 0.5 : -1;
  const punch = golpe >= 0 ? spring({ frame: frame - golpe, fps: FPS, config: { damping: 9, stiffness: 220 } }) : 0;
  const rebote = golpe >= 0 && frame >= golpe ? Math.max(0, 1 - (frame - golpe) / 18) : 0;
  const zoom = interpolate(frame, [0, total], [1, 1.05]) + 0.035 * punch * rebote;
  // Sacudida de pantalla cuando suena un golpe fuerte
  const t0 = sonido === "boom" ? (sonidoEn ?? 0.6) * FPS : -1;
  const sacude = t0 >= 0 && frame >= t0 && frame < t0 + 12 ? (1 - (frame - t0) / 12) * 14 : 0;
  const dx = sacude * Math.sin(frame * 2.7), dy = sacude * Math.cos(frame * 3.3);
  return (
    <AbsoluteFill style={{
      transform: `translate(${dx}px, ${dy}px) scale(${zoom * interpolate(frame, [0, 8], [1.12, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })})`,
      filter: `blur(${interpolate(frame, [0, 7], [10, 0], { extrapolateRight: "clamp" })}px)`,
    }}>
      {/* El dibujo ocupa toda la escena, parado sobre el piso; el texto va abajo como subtítulo */}
      <div style={{
        position: "absolute", left: horizontal ? 120 : 30, right: horizontal ? 120 : 30, top: horizontal ? 70 : 340, bottom: horizontal ? "16%" : "24%",
        // Silueta: negro hasta el 40 % de la escena y luego se revela (con el destello de abajo)
        filter: silueta ? `brightness(${interpolate(frame, [total * 0.4, total * 0.4 + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})` : undefined,
      }}>
        {barras ? <Barras datos={barras} duracion={total} /> : <Dibujo dibujo={resolverDibujo(dibujo)} duracion={total} />}
      </div>
      {silueta ? (
        <AbsoluteFill style={{ backgroundColor: "#ffffff", pointerEvents: "none",
          opacity: interpolate(frame, [total * 0.4, total * 0.4 + 2, total * 0.4 + 12], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: horizontal ? 24 : 300, display: "flex", justifyContent: "center", padding: "0 80px" }}>
        <Texto texto={texto} resaltar={resaltar} duracion={total * 0.5} tamano={horizontal ? 64 : 76} />
      </div>
    </AbsoluteFill>
  );
};

// Traza cada línea en orden, como si una mano la dibujara; los rellenos se pintan cuando su borde ya está.
// Después aparecen los objetos ilustrados (public/objetos/), uno tras otro con un pequeño rebote.
const Dibujo: React.FC<{ dibujo: DibujoPizarra; duracion: number }> = ({ dibujo, duracion }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const trazos = useMemo(() => dibujo.trazos ?? [], [dibujo]);
  const personaje = useMemo(() => dibujo.personaje ?? [], [dibujo]);
  const objetos = useMemo(() => dibujo.objetos ?? [], [dibujo]);
  const textos = useMemo(() => dibujo.textos ?? [], [dibujo]);
  const largos = useMemo(() => trazos.map((t) => getLength(t.d)), [trazos]);
  // El dibujo se ajusta solo al espacio disponible, sea grande o chico
  const vista = useMemo(() => {
    const cajas = [
      ...trazos.map((t) => getBoundingBox(t.d)),
      ...personaje.map((t) => getBoundingBox(t.d)),
      ...objetos.map((o) => ({ x1: o.x - o.t / 2, y1: o.y - o.t / 2, x2: o.x + o.t / 2, y2: o.y + o.t / 2 })),
      ...textos.map((e) => ({ x1: e.x - e.texto.length * e.t * 0.27, y1: e.y - e.t * 0.8, x2: e.x + e.texto.length * e.t * 0.27, y2: e.y + e.t * 0.3 })),
    ];
    if (!cajas.length) return "0 0 100 100";
    const x1 = Math.min(...cajas.map((c) => c.x1)), y1 = Math.min(...cajas.map((c) => c.y1));
    const x2 = Math.max(...cajas.map((c) => c.x2)), y2 = Math.max(...cajas.map((c) => c.y2));
    return `${x1 - 50} ${y1 - 50} ${x2 - x1 + 100} ${y2 - y1 + 100}`;
  }, [trazos, personaje, objetos, textos]);
  const totalLargo = largos.reduce((a, b) => a + b, 0) || 1;
  // Si hay objetos, las líneas usan el primer 65 % del tiempo y los objetos el resto
  const { tiempoTrazos, objetosEn, textosEn } = momentos(dibujo, duracion);
  const avance = interpolate(frame, [0, Math.max(1, tiempoTrazos)], [0, totalLargo], { extrapolateRight: "clamp" });
  let acumulado = 0;
  const entrada = spring({ frame: frame - 1, fps, config: { damping: 11, stiffness: 150 } });
  // Vida: cuando el dibujo ya está completo, respira y se balancea apenas, para que nunca quede congelado
  const [vx, vy, vw, vh] = vista.split(" ").map(Number);
  const seg = Math.max(0, frame - tiempoTrazos) / fps;
  const vida = Math.min(1, seg * 2);
  const respira = 1 + 0.012 * Math.sin(seg * 3.2) * vida;
  const balanceo = 1.2 * Math.sin(seg * 1.7) * vida;
  const centro = `${vx + vw / 2} ${vy + vh * 0.9}`;
  return (
    <svg viewBox={vista} style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 0 #fff) drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(0 18px 22px rgba(0,0,0,0.30))" }}>
      <g transform={`rotate(${balanceo} ${centro}) translate(${centro}) scale(${2 - respira} ${respira}) translate(${centro.split(" ").map((n) => -Number(n)).join(" ")})`}>
      {personaje.length ? (
        <g style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
          transform={`translate(0 ${(1 - entrada) * 120})`} opacity={Math.min(1, entrada * 2)}>
          <g style={{ transformBox: "fill-box", transformOrigin: "50% 100%", scale: `${0.7 + 0.3 * entrada}` }}>
            <PersonajeVivo trazos={personaje} frame={frame} fps={fps} />
          </g>
        </g>
      ) : null}
      {trazos.map((t, i) => {
        const largo = largos[i];
        const visible = Math.min(Math.max(avance - acumulado, 0), largo);
        acumulado += largo;
        if (visible <= 0) return null;
        if (t.stroke === "none") {
          // Relleno de color: aparece suave mientras se dibuja su contorno
          return <path key={i} d={t.d} fill={t.fill} opacity={visible / largo} />;
        }
        return (
          <path key={i} d={t.d} stroke={t.stroke} strokeWidth={t.strokeWidth} fill="none"
            strokeLinecap="round" strokeLinejoin="round" strokeDasharray={largo} strokeDashoffset={largo - visible} />
        );
      })}
      </g>
      {objetos.map((o, i) => {
        const inicio = objetosEn[i];
        const pop = spring({ frame: frame - inicio, fps, config: { damping: 11, stiffness: 160 } });
        if (frame < inicio) return null;
        // Flota apenas, para que el dibujo no se vea congelado
        const flota = Math.sin((frame - inicio) / 14 + i) * 6;
        return (
          <g key={`o${i}`} transform={`translate(${o.x} ${o.y + flota}) rotate(${(o.rot ?? 0) + (1 - pop) * -25}) scale(${pop})`}>
            <image href={staticFile(o.img.startsWith("ia:") ? `assets/objetos-ia/${o.img.slice(3)}.png` : o.img.startsWith("doodle:") ? `assets/doodles/${o.img.slice(7)}.svg` : o.img.startsWith("peep:") ? `assets/peeps/${o.img.slice(5)}.svg` : `objetos/${o.img}.svg`)} x={-o.t / 2} y={-o.t / 2} width={o.t} height={o.t} />
          </g>
        );
      })}
      {textos.map((e, i) => {
        // Rótulos escritos a mano dentro del dibujo ("1904", "24 h"…)
        const inicio = textosEn[i];
        const pop = spring({ frame: frame - inicio, fps, config: { damping: 12, stiffness: 170 } });
        if (frame < inicio) return null;
        return (
          <g key={`t${i}`}>
          <path d={`M ${e.x - e.texto.length * e.t * 0.34} ${e.y - e.t * 0.3} C ${e.x - e.texto.length * e.t * 0.36} ${e.y - e.t * 1.1}, ${e.x + e.texto.length * e.t * 0.38} ${e.y - e.t * 1.1}, ${e.x + e.texto.length * e.t * 0.36} ${e.y - e.t * 0.3} S ${e.x - e.texto.length * e.t * 0.2} ${e.y + e.t * 0.55}, ${e.x - e.texto.length * e.t * 0.38} ${e.y - e.t * 0.15}`}
            fill="none" stroke={e.color ?? "#d7263d"} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1}
            strokeDashoffset={interpolate(frame, [inicio + 6, inicio + 20], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          <text x={e.x} y={e.y} textAnchor="middle" fontFamily="Mano" fontSize={e.t}
            fill={e.color ?? "#1f1f1f"} transform={`rotate(${e.rot ?? 0} ${e.x} ${e.y}) translate(${e.x} ${e.y}) scale(${pop}) translate(${-e.x} ${-e.y})`}>
            {contar(e.texto, frame - inicio, fps)}
          </text>
          </g>
        );
      })}
    </svg>
  );
};

// Personaje con vida: parpadea, inclina la cabeza, gesticula con los brazos y mueve la boca mientras habla la voz
const dibujarTrazos = (trazos: Trazo[], clave: string) => trazos.map((t, i) => (t.stroke === "none"
  ? <path key={`${clave}${i}`} d={t.d} fill={t.fill} />
  : <path key={`${clave}${i}`} d={t.d} stroke={t.stroke} strokeWidth={t.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />));

const caja = (trazos: Trazo[]) => {
  const c = trazos.map((t) => getBoundingBox(t.d));
  return { x1: Math.min(...c.map((b) => b.x1)), y1: Math.min(...c.map((b) => b.y1)), x2: Math.max(...c.map((b) => b.x2)), y2: Math.max(...c.map((b) => b.y2)) };
};
// El brazo gira desde el hombro: el punto donde empieza su primer trazo
const hombro = (trazos: Trazo[]) => {
  const m = trazos[0]?.d.match(/M\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/);
  return m ? `${m[1]} ${m[2]}` : "0 0";
};

const PersonajeVivo: React.FC<{ trazos: Trazo[]; frame: number; fps: number }> = ({ trazos, frame, fps }) => {
  const partes = useMemo(() => {
    const de = (n?: string) => trazos.filter((t) => t.parte === n);
    return { cuerpo: de(undefined), izq: de("brazo-izq"), der: de("brazo-der"), cabeza: de("cabeza"), ojos: de("ojos"), boca: de("boca") };
  }, [trazos]);
  const t = frame / fps;
  const cabeza = partes.cabeza.length ? caja(partes.cabeza) : null;
  const ojos = partes.ojos.length ? caja(partes.ojos) : null;
  const boca = partes.boca.length ? caja(partes.boca) : null;
  // Parpadeo cada ~3,2 s durante 4 cuadros
  const parpado = frame % Math.round(3.2 * fps) < 4 ? 0.12 : 1;
  const giro = (centro: string, grados: number) => `rotate(${grados} ${centro})`;
  const conCabeza = (
    <>
      {dibujarTrazos(partes.cabeza, "c")}
      {ojos ? (
        <g transform={`translate(0 ${(ojos.y1 + ojos.y2) / 2}) scale(1 ${parpado}) translate(0 ${-(ojos.y1 + ojos.y2) / 2})`}>{dibujarTrazos(partes.ojos, "o")}</g>
      ) : null}
      {boca ? (
        <g transform={`translate(0 ${boca.y1}) scale(1 ${1 + 0.16 * Math.abs(Math.sin(t * 9))}) translate(0 ${-boca.y1})`}>{dibujarTrazos(partes.boca, "b")}</g>
      ) : null}
    </>
  );
  return (
    <>
      {dibujarTrazos(partes.cuerpo, "x")}
      <g transform={giro(hombro(partes.izq), 5 * Math.sin(t * 2.3))}>{dibujarTrazos(partes.izq, "i")}</g>
      <g transform={giro(hombro(partes.der), -5 * Math.sin(t * 2.3 + 1))}>{dibujarTrazos(partes.der, "d")}</g>
      {cabeza ? <g transform={giro(`${(cabeza.x1 + cabeza.x2) / 2} ${cabeza.y2}`, 3 * Math.sin(t * 1.6))}>{conCabeza}</g> : conCabeza}
    </>
  );
};

// Texto que aparece palabra por palabra; las palabras de "resaltar" llevan marcador amarillo
const Texto: React.FC<{ texto: string; resaltar?: string; duracion: number; tamano?: number }> = ({ texto, resaltar, duracion, tamano = 76 }) => {
  const frame = useCurrentFrame();
  const palabras = texto.split(/\s+/);
  const limpia = (p: string) => p.toLowerCase().replace(/[¿?¡!.,:;…"«»]/g, "");
  const claves = new Set((resaltar ?? "").split(/\s+/).map(limpia).filter(Boolean));
  return (
    <div style={{ fontFamily: "Texto", fontWeight: 900, fontSize: tamano, lineHeight: 1.15, textAlign: "center", textTransform: "uppercase" }}>
      {palabras.map((p, i) => {
        const aparece = (i / palabras.length) * duracion;
        const marcada = claves.has(limpia(p));
        const pop = spring({ frame: frame - aparece, fps: FPS, config: { damping: 10, stiffness: 220 } });
        return (
          <span key={i} style={{
            display: "inline-block", margin: "0 12px", fontSize: marcada ? "1.2em" : "1em",
            opacity: frame < aparece ? 0 : 1,
            scale: `${0.6 + 0.4 * pop}`,
            rotate: marcada ? `${-3 * pop}deg` : "0deg",
            color: marcada ? "#ffe14d" : "#ffffff",
            WebkitTextStroke: "10px #111",
            paintOrder: "stroke fill",
            textShadow: "0 8px 0 rgba(0,0,0,0.35)",
          }}>
            {p}
          </span>
        );
      })}
    </div>
  );
};

