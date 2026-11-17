import { createContext, useContext } from "react";

/**
 * @typedef {import("../utils/metrics").Predio} Predio
 */

/**
 * Forma del valor expuesto por `PrediosProvider`.
 *
 * @typedef {Object} PrediosContextValue
 * @property {Predio[]} predios - Registros actuales.
 * @property {(data: Partial<Predio>) => Predio} addPredio - Crea un registro y devuelve el nuevo predio.
 * @property {(id: string, data: Partial<Predio>) => void} updatePredio - Actualiza un registro por id.
 * @property {(id: string) => void} deletePredio - Elimina un registro por id.
 * @property {() => void} resetDemo - Restaura los datos de demostración.
 */

/** Contexto global de predios. Se consume mediante `usePredios`. */
export const PrediosContext = createContext(null);

/**
 * Hook de acceso al contexto de predios.
 *
 * @returns {PrediosContextValue} Estado y acciones de los predios.
 * @throws {Error} Si se usa fuera de `<PrediosProvider>`.
 */
export function usePredios() {
  const context = useContext(PrediosContext);

  if (!context) {
    throw new Error("usePredios debe usarse dentro de <PrediosProvider>");
  }

  return context;
}
