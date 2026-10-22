// Identidad de tu página. Cambia estos valores una vez y todos los videos
// salen con tus colores, tus fuentes y tu @usuario.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Las fuentes viven en public/fuentes/ para que el render no dependa de internet.
// Para cambiarlas, reemplaza esos archivos .woff2 (o agrega otros) y estos nombres.
loadFont({ family: "Titulo", url: staticFile("fuentes/Anton.woff2") });
loadFont({
  family: "Texto",
  url: staticFile("fuentes/Montserrat.woff2"),
  weight: "100 900",
});

export const marca = {
  nombre: "Mi Página",
  usuario: "@mipagina",
  colores: {
    fondo: "#0b1020",
    fondo2: "#1b2350",
    primario: "#ffcc00",
    acento: "#ff3d71",
    correcto: "#22c55e",
    texto: "#ffffff",
    textoSuave: "rgba(255,255,255,0.72)",
  },
  fuentes: {
    titulo: "Titulo",
    texto: "Texto",
  },
  // El narrador dibujado que aparece en el estilo "dibujo"
  personaje: {
    camisa: "#e63946",
  },
};
