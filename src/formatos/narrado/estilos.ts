import { marca } from "../../marca";

// Cada estilo cambia la apariencia completa del video narrado.
// Para un canal nuevo, copia uno de estos y ajusta los colores.
export type Estilo = {
  fondo: string;
  texto: string;
  textoSuave: string;
  resaltado: string;
  // Subtítulos: palabra activa con color ("color") o con fondo de marcador ("marcador")
  subtituloModo: "color" | "marcador";
  subtituloBorde: string;
  // Imagen a pantalla completa ("cine") o dentro de un cuadro con borde ("tarjeta")
  imagen: "cine" | "tarjeta";
  grano: boolean;
  vineta: boolean;
};

export const ESTILOS = {
  // Leyendas, misterio, terror, crímenes: oscuro y cinematográfico
  misterio: {
    fondo: "#05070a",
    texto: "#ffffff",
    textoSuave: "rgba(255,255,255,0.7)",
    resaltado: "#ffcc00",
    subtituloModo: "color",
    subtituloBorde: "#000000",
    imagen: "cine",
    grano: true,
    vineta: true,
  },
  // Finanzas, explicaciones, curiosidades: fondo blanco con dibujos, al estilo pizarra
  dibujo: {
    fondo: "#ffffff",
    texto: "#111111",
    textoSuave: "rgba(0,0,0,0.6)",
    resaltado: marca.colores.primario,
    subtituloModo: "marcador",
    subtituloBorde: "#111111",
    imagen: "tarjeta",
    grano: false,
    vineta: false,
  },
} satisfies Record<string, Estilo>;

export type NombreEstilo = keyof typeof ESTILOS;
