import { z } from "zod";
import { Composition, Folder, Still } from "remotion";
import datosEjemplo from "../contenido/datos-poblacion-sudamerica.json";
import fraseEjemplo from "../contenido/frase-constancia.json";
import finDeMes from "../contenido/narrado-fin-de-mes.json";
import elTunche from "../contenido/narrado-el-tunche.json";
import anuncioEjemplo from "../contenido/anuncio-quinuapata.json";
import pizarraEjemplo from "../contenido/pizarra-kakeibo.json";
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
import { Anuncio, anuncioSchema, calcularAnuncio } from "./formatos/anuncio/Anuncio";
import { calcularPizarra, Pizarra, pizarraSchema } from "./formatos/pizarra/Pizarra";
import { BannerCanal, LogoCanal } from "./formatos/pizarra/Marca";
import { MiniaturaPizarra, miniaturaPizarraSchema } from "./formatos/pizarra/MiniaturaPizarra";
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
      {/* Identidad del canal de YouTube: foto de perfil y banner */}
      <Still id="LogoCanal" component={LogoCanal} width={800} height={800} />
      <Still id="BannerCanal" component={BannerCanal} width={2560} height={1440} />
      <Still
        id="MiniaturaPizarra"
        component={MiniaturaPizarra}
        schema={miniaturaPizarraSchema}
        defaultProps={{ dibujo: "mini-kakeibo", linea1: "AHORRA COMO", linea2: "JAPONÉS" }}
        width={1280}
        height={720}
      />
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
          {/* Anuncios para Facebook e Instagram (contenido/anuncio-*.json) */}
          <Composition
            id={`Anuncio-${t.nombre}`}
            component={Anuncio}
            schema={anuncioSchema}
            defaultProps={anuncioEjemplo.props as z.infer<typeof anuncioSchema>}
            calculateMetadata={calcularAnuncio}
            durationInFrames={900}
            fps={30}
            width={t.width}
            height={t.height}
          />
          {/* Videos de pizarra estilo DOMINALO (contenido/pizarra-*.json); pensados para horizontal */}
          <Composition
            id={`Pizarra-${t.nombre}`}
            component={Pizarra}
            schema={pizarraSchema}
            defaultProps={pizarraEjemplo.props as z.infer<typeof pizarraSchema>}
            calculateMetadata={calcularPizarra}
            durationInFrames={900}
            fps={30}
            width={t.width}
            height={t.height}
          />
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
