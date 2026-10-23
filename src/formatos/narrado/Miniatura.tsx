import { AbsoluteFill, Img, staticFile } from "remotion";
import { marca } from "../../marca";
import { NarradoProps } from "./Narrado";
import { Personaje } from "./Personaje";
import { COLORES_CLAVE } from "./Presentador";

// Miniatura de YouTube (1280x720) al estilo de los canales de dibujos:
// fondo blanco, marco negro, el dibujo de una escena, el personaje y 1 o 2 palabras enormes.
export const Miniatura: React.FC<NarradoProps> = ({ titulo, escenas, miniatura }) => {
  const texto = miniatura?.texto ?? titulo;
  const color = COLORES_CLAVE[miniatura?.color ?? "rojo"];
  const texto2 = miniatura?.texto2;
  const color2 = COLORES_CLAVE[miniatura?.color2 ?? "amarillo"];
  const escena = escenas[(miniatura?.escena ?? 1) - 1] ?? escenas[0];

  const palabra = (t: string, c: string, tamano: number, giro: number) => (
    <div
      style={{
        fontFamily: marca.fuentes.titulo,
        fontSize: tamano,
        lineHeight: 0.95,
        textTransform: "uppercase",
        textAlign: "center",
        color: c,
        WebkitTextStroke: "14px #111111",
        paintOrder: "stroke fill",
        textShadow: "10px 10px 0 #111111",
        rotate: `${giro}deg`,
      }}
    >
      {t}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: "#ffffff" }}>
      {/* Dibujo de la escena, inclinado a la izquierda */}
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 150,
          width: 500,
          aspectRatio: "4 / 3",
          border: "10px solid #111111",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "12px 12px 0 #111111",
          rotate: "-5deg",
          background: "linear-gradient(135deg, #fff6d6 0%, #ffe08a 100%)",
        }}
      >
        {escena?.imagen ? (
          <Img src={staticFile(escena.imagen)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : null}
      </div>

      {/* Personaje al centro, saliendo desde abajo */}
      <div style={{ position: "absolute", left: 430, bottom: -130 }}>
        <Personaje
          emocion={miniatura?.emocion ?? "sorprendido"}
          hablando={false}
          alto={650}
          mira="derecha"
          quieto
        />
      </div>

      {/* Palabras enormes a la derecha */}
      <div
        style={{
          position: "absolute",
          right: 30,
          top: 60,
          width: 460,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        {palabra(texto, color, texto.length > 8 ? 120 : 150, -4)}
        {texto2 ? palabra(texto2, color2, texto2.length > 8 ? 100 : 130, 3) : null}
      </div>

      {/* Marco negro alrededor, como en las miniaturas del estilo */}
      <AbsoluteFill style={{ border: "16px solid #111111" }} />
    </AbsoluteFill>
  );
};
