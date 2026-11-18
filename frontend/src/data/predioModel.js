/**
 * Normalización y migración del registro de un predio.
 *
 * Los datos viven en `localStorage`, por lo que pueden venir de versiones
 * anteriores del prototipo sin los campos agronómicos nuevos. Este módulo
 * centraliza los valores por defecto y evita que cada vista tenga que
 * defenderse de un registro incompleto.
 *
 * @module data/predioModel
 */

import {
  PAQUETE_DEFAULT,
  PAQUETE_TECNOLOGICO,
  REGIMENES_HIDRICOS,
  REGIMEN_DEFAULT,
  VARIEDAD_DEFAULT,
  VARIEDADES,
  zonaDeLocalidad,
} from "./catalogos";

/** Identificadores vigentes de variedad. */
const VARIEDAD_IDS = new Set(VARIEDADES.map((variedad) => variedad.id));

/** Identificadores vigentes de régimen hídrico. */
const REGIMEN_IDS = new Set(REGIMENES_HIDRICOS.map((regimen) => regimen.id));

/** Identificadores vigentes de paquete tecnológico. */
const PAQUETE_IDS = new Set(
  PAQUETE_TECNOLOGICO.map((opcion) => opcion.id),
);

/**
 * Devuelve un texto limpio o una cadena vacía.
 *
 * @param {unknown} value - Valor a convertir.
 * @returns {string} Texto sin espacios sobrantes.
 */
function texto(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Completa un predio con los campos agronómicos y geográficos vigentes.
 *
 * No descarta campos desconocidos: solo normaliza los que el modelo conoce,
 * de modo que la migración sea segura para datos capturados por versiones
 * futuras.
 *
 * @param {Record<string, any>} predio - Registro almacenado.
 * @returns {Record<string, any>} Registro normalizado.
 */
export function normalizePredio(predio) {
  const localidad = texto(predio.localidad);
  const variedad = VARIEDAD_IDS.has(predio.variedad)
    ? predio.variedad
    : VARIEDAD_DEFAULT;
  const regimenHidrico = REGIMEN_IDS.has(predio.regimenHidrico)
    ? predio.regimenHidrico
    : REGIMEN_DEFAULT;

  return {
    ...predio,
    variedad,
    regimenHidrico,
    localidad,
    zona: texto(predio.zona) || zonaDeLocalidad(localidad),
    paqueteTecnologico: PAQUETE_IDS.has(predio.paqueteTecnologico)
      ? predio.paqueteTecnologico
      : PAQUETE_DEFAULT,
    observaciones: texto(predio.observaciones),
  };
}

/**
 * Migra la lista almacenada en el navegador.
 *
 * Los registros de demostración creados con una versión anterior se completan
 * con la semilla vigente (mismo `id`), porque sus datos son desechables y así
 * el panel no arranca con campos vacíos. Los registros capturados por el
 * usuario solo se normalizan, sin inventar información agronómica.
 *
 * @param {Array<Record<string, any>>} stored - Registros leídos del almacenamiento.
 * @param {Array<Record<string, any>>} seed - Semilla vigente de demostración.
 * @returns {Array<Record<string, any>>} Registros listos para el estado global.
 */
export function migratePredios(stored, seed) {
  const seedById = new Map(seed.map((predio) => [predio.id, predio]));

  return stored.map((predio) => {
    const isDemo = String(predio.id || "").startsWith("demo-silo-");

    if (isDemo && !predio.zona) {
      const demoActualizado = seedById.get(predio.id);

      if (demoActualizado) {
        return {
          ...demoActualizado,
          createdAt: predio.createdAt || demoActualizado.createdAt,
          updatedAt: predio.updatedAt || demoActualizado.updatedAt,
        };
      }
    }

    return normalizePredio(predio);
  });
}
