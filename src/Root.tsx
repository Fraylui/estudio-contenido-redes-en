import { Composition, Folder } from "remotion";
import datosEjemplo from "../contenido/datos-poblacion-sudamerica.json";
import fraseEjemplo from "../contenido/frase-constancia.json";
import topEjemplo from "../contenido/top-5-platos-peruanos.json";
import triviaEjemplo from "../contenido/trivia-capital-australia.json";
import {
  calcularDatosBarras,
  DatosBarras,
  datosBarrasSchema,
} from "./formatos/DatosBarras";
import { calcularFrase, Frase, fraseSchema } from "./formatos/Frase";
import { calcularTopLista, TopLista, topListaSchema } from "./formatos/TopLista";
import { calcularTrivia, Trivia, triviaSchema } from "./formatos/Trivia";
import { conDuracionVoz, conNarracion, vozSchema } from "./comun/Narracion";

// Todos los formatos aceptan narración con voz (campos "voz" y "duracionVoz").
const TopListaVoz = conNarracion(TopLista);
const TriviaVoz = conNarracion(Trivia);
const FraseVoz = conNarracion(Frase);
const DatosBarrasVoz = conNarracion(DatosBarras);

// Cada formato existe en dos tamaños:
//   Vertical   1080x1920 → Facebook Reels, YouTube Shorts, TikTok, Instagram
//   Horizontal 1920x1080 → YouTube normal, publicaciones de Facebook
const TAMANOS = [
  { nombre: "Vertical", width: 1080, height: 1920 },
  { nombre: "Horizontal", width: 1920, height: 1080 },
] as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {TAMANOS.map((t) => (
        <Folder key={t.nombre} name={t.nombre}>
          <Composition
            id={`TopLista-${t.nombre}`}
            component={TopListaVoz}
            schema={topListaSchema.extend(vozSchema.shape)}
            defaultProps={topEjemplo.props}
            calculateMetadata={conDuracionVoz(calcularTopLista)}
            durationInFrames={600}
            fps={30}
            width={t.width}
            height={t.height}
          />
          <Composition
            id={`Trivia-${t.nombre}`}
            component={TriviaVoz}
            schema={triviaSchema.extend(vozSchema.shape)}
            defaultProps={triviaEjemplo.props}
            calculateMetadata={conDuracionVoz(calcularTrivia)}
            durationInFrames={450}
            fps={30}
            width={t.width}
            height={t.height}
          />
          <Composition
            id={`Frase-${t.nombre}`}
            component={FraseVoz}
            schema={fraseSchema.extend(vozSchema.shape)}
            defaultProps={fraseEjemplo.props}
            calculateMetadata={conDuracionVoz(calcularFrase)}
            durationInFrames={300}
            fps={30}
            width={t.width}
            height={t.height}
          />
          <Composition
            id={`DatosBarras-${t.nombre}`}
            component={DatosBarrasVoz}
            schema={datosBarrasSchema.extend(vozSchema.shape)}
            defaultProps={datosEjemplo.props}
            calculateMetadata={conDuracionVoz(calcularDatosBarras)}
            durationInFrames={360}
            fps={30}
            width={t.width}
            height={t.height}
          />
        </Folder>
      ))}
    </>
  );
};
