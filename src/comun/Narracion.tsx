import { Audio } from "@remotion/media";
import { createContext, useContext } from "react";
import { z } from "zod";
import { AbsoluteFill, CalculateMetadataFunction, staticFile } from "remotion";

// Narración con voz (opcional). La genera voz/narrar.py a partir de "narracion" en el JSON;
// npm run lote la crea sola y completa estos dos campos.
export const vozSchema = z.object({
  voz: z.string().optional(),
  duracionVoz: z.number().optional(),
});

// Avisa a la música que hay voz, para que baje y no tape a la narradora.
export const HayVoz = createContext(false);
export const useHayVoz = () => useContext(HayVoz);

export const Narracion: React.FC<{ archivo?: string }> = ({ archivo }) => {
  if (!archivo) {
    return null;
  }
  return <Audio src={staticFile(`voz/${archivo}`)} />;
};

// Envuelve un formato para que acepte voz sin tocar su código.
export function conNarracion<P extends object>(Formato: React.FC<P>) {
  const ConVoz: React.FC<P & z.infer<typeof vozSchema>> = (props) => (
    <HayVoz.Provider value={Boolean(props.voz)}>
      <AbsoluteFill>
        <Formato {...props} />
        <Narracion archivo={props.voz} />
      </AbsoluteFill>
    </HayVoz.Provider>
  );
  return ConVoz;
}

// Si la narración dura más que el formato, alarga el video para que no se corte.
export function conDuracionVoz<P extends Record<string, unknown>>(
  calcular: CalculateMetadataFunction<P>,
): CalculateMetadataFunction<P & z.infer<typeof vozSchema>> {
  return async (opciones) => {
    const resultado = await calcular(opciones as Parameters<typeof calcular>[0]);
    const { duracionVoz } = opciones.props;
    if (!duracionVoz || !resultado.durationInFrames) {
      return resultado;
    }
    return {
      ...resultado,
      durationInFrames: Math.max(resultado.durationInFrames, Math.ceil((duracionVoz + 1) * 30)),
    };
  };
}
