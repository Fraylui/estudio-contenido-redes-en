import { z } from "zod";
import { Composition, Folder, Still } from "remotion";
import datosEjemplo from "../contenido/datos-poblacion-sudamerica.json";
import fraseEjemplo from "../contenido/frase-constancia.json";
import finDeMes from "../contenido/narrado-fin-de-mes.json";
import elTunche from "../contenido/narrado-el-tunche.json";
import topEjemplo from "../contenido/top-5-platos-peruanos.json";
import triviaEjemplo from "../contenido/trivia-capital-australia.json";
import {
  calcularDatosBarras,
  DatosBarras,
  datosBarrasSchema,
} from "./formatos/DatosBarras";
import { calcularFrase, Frase, fraseSchema } from "./formatos/Frase";
import { calcularNarrado, Narrado, narradoSchema } from "./formatos/narrado/Narrado";
import { Miniatura } from "./formatos/narrado/Miniatura";
import { calcularTopLista, TopLista, topListaSchema } from "./formatos/TopLista";
import { calcularTrivia, Trivia, triviaSchema } from "./formatos/Trivia";

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
      {/* Miniaturas de YouTube para los videos narrados (imagen fija de 1280x720) */}
      <Folder name="Miniaturas">
        {[finDeMes, elTunche].map((n) => (
          <Still
            key={n.props.id}
            id={`Miniatura-${n.props.id}`}
            component={Miniatura}
            schema={narradoSchema}
            defaultProps={n.props as z.infer<typeof narradoSchema>}
            width={1280}
            height={720}
          />
        ))}
        <Still
          id="Miniatura"
          component={Miniatura}
          schema={narradoSchema}
          defaultProps={finDeMes.props as z.infer<typeof narradoSchema>}
          width={1280}
          height={720}
        />
      </Folder>
      {TAMANOS.map((t) => (
        <Folder key={t.nombre} name={t.nombre}>
          <Composition
            id={`TopLista-${t.nombre}`}
            component={TopLista}
            schema={topListaSchema}
            defaultProps={topEjemplo.props}
            calculateMetadata={calcularTopLista}
            durationInFrames={600}
            fps={30}
            width={t.width}
            height={t.height}
          />
          <Composition
            id={`Trivia-${t.nombre}`}
            component={Trivia}
            schema={triviaSchema}
            defaultProps={triviaEjemplo.props}
            calculateMetadata={calcularTrivia}
            durationInFrames={450}
            fps={30}
            width={t.width}
            height={t.height}
          />
          <Composition
            id={`Frase-${t.nombre}`}
            component={Frase}
            schema={fraseSchema}
            defaultProps={fraseEjemplo.props}
            calculateMetadata={calcularFrase}
            durationInFrames={300}
            fps={30}
            width={t.width}
            height={t.height}
          />
          <Composition
            id={`DatosBarras-${t.nombre}`}
            component={DatosBarras}
            schema={datosBarrasSchema}
            defaultProps={datosEjemplo.props}
            calculateMetadata={calcularDatosBarras}
            durationInFrames={360}
            fps={30}
            width={t.width}
            height={t.height}
          />
          {/* Videos narrados con tu voz: uno por cada ejemplo de contenido/narrado-*.json */}
          {[elTunche, finDeMes].map((n) => (
            <Composition
              key={n.props.id}
              id={`Narrado-${n.props.id}-${t.nombre}`}
              component={Narrado}
              schema={narradoSchema}
              defaultProps={n.props as z.infer<typeof narradoSchema>}
              calculateMetadata={calcularNarrado}
              durationInFrames={900}
              fps={30}
              width={t.width}
              height={t.height}
            />
          ))}
          {/* Plantilla genérica que usa "npm run lote" para cualquier narrado-*.json */}
          <Composition
            id={`Narrado-${t.nombre}`}
            component={Narrado}
            schema={narradoSchema}
            defaultProps={elTunche.props as z.infer<typeof narradoSchema>}
            calculateMetadata={calcularNarrado}
            durationInFrames={900}
            fps={30}
            width={t.width}
            height={t.height}
          />
        </Folder>
      ))}
    </>
  );
};
