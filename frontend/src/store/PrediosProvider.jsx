import { useCallback, useEffect, useMemo, useState } from "react";
import { buildSeed } from "../data/seed";
import { migratePredios, normalizePredio } from "../data/predioModel";
import { PrediosContext } from "./prediosContext";

/** Clave de `localStorage` donde se persiste la bitácora. */
const STORAGE_KEY = "cma.predios.silo.v1";

/**
 * Comprueba que un valor tenga la forma mínima de un predio.
 *
 * @param {unknown} value - Valor a validar.
 * @returns {boolean} `true` si es un objeto con `id` de tipo string.
 */
function isPredio(value) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (/** @type {Record<string, unknown>} */ (value).id) === "string"
  );
}

/**
 * Lee los predios guardados en el navegador.
 *
 * @returns {Array<Record<string, unknown>>|null} Registros válidos o `null` si
 * no hay datos, el JSON es inválido o el almacenamiento está bloqueado.
 */
function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw === null) return null;

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return null;

    return migratePredios(parsed.filter(isPredio), buildSeed());
  } catch (error) {
    console.warn("No se pudieron leer los predios guardados.", error);
    return null;
  }
}

/**
 * Genera un identificador único para un predio.
 *
 * Usa `crypto.randomUUID` cuando está disponible y cae a una combinación de
 * fecha y número aleatorio en navegadores antiguos o contextos no seguros.
 *
 * @returns {string} Identificador único.
 */
function makeId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `predio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Proveedor del estado global de predios.
 *
 * - Inicializa con los datos guardados o con la semilla de demostración.
 * - Persiste cada cambio en `localStorage`.
 * - Expone acciones estables mediante `useCallback`.
 *
 * @param {{children: React.ReactNode}} props - Componentes hijos.
 * @returns {React.JSX.Element} Proveedor del contexto.
 */
export default function PrediosProvider({ children }) {
  const [predios, setPredios] = useState(() => readStored() ?? buildSeed());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(predios));
    } catch (error) {
      // El prototipo sigue funcionando en memoria si el navegador bloquea
      // el almacenamiento local (por ejemplo, en modo privado o sin cuota).
      console.warn("No se pudieron guardar los predios en el navegador.", error);
    }
  }, [predios]);

  /**
   * Agrega un predio al inicio de la lista.
   *
   * @param {Record<string, unknown>} data - Datos del formulario.
   * @returns {Record<string, unknown>} Registro creado con id y fechas.
   */
  const addPredio = useCallback((data) => {
    const now = new Date().toISOString();
    const nuevo = normalizePredio({
      ...data,
      id: makeId(),
      createdAt: now,
      updatedAt: now,
    });

    setPredios((prev) => [nuevo, ...prev]);

    return nuevo;
  }, []);

  /**
   * Actualiza los campos de un predio sin permitir cambiar su id.
   *
   * @param {string} id - Identificador del predio.
   * @param {Record<string, unknown>} data - Campos a actualizar.
   * @returns {void}
   */
  const updatePredio = useCallback((id, data) => {
    setPredios((prev) =>
      prev.map((predio) =>
        predio.id === id
          ? normalizePredio({
              ...predio,
              ...data,
              id: predio.id,
              updatedAt: new Date().toISOString(),
            })
          : predio,
      ),
    );
  }, []);

  /**
   * Elimina un predio de la bitácora.
   *
   * @param {string} id - Identificador del predio.
   * @returns {void}
   */
  const deletePredio = useCallback((id) => {
    setPredios((prev) => prev.filter((predio) => predio.id !== id));
  }, []);

  /**
   * Reemplaza el estado actual por los 16 predios de demostración.
   *
   * @returns {void}
   */
  const resetDemo = useCallback(() => {
    setPredios(buildSeed());
  }, []);

  const value = useMemo(
    () => ({
      predios,
      addPredio,
      updatePredio,
      deletePredio,
      resetDemo,
    }),
    [predios, addPredio, updatePredio, deletePredio, resetDemo],
  );

  return (
    <PrediosContext.Provider value={value}>{children}</PrediosContext.Provider>
  );
}
