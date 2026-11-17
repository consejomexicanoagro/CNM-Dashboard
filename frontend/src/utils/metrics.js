/**
 * Métricas y agregaciones del módulo Silo.
 *
 * Las funciones son puras y no dependen de React, por lo que se pueden probar
 * de forma aislada y reutilizar en cualquier vista.
 *
 * @module utils/metrics
 */

import { CULTIVOS, DICTAMENES } from "../data/constants";
import { addMonths, diffDaysISO, monthKey, monthShort, todayISO } from "./dates";

/**
 * @typedef {Object} Predio
 * @property {string} id - Identificador único.
 * @property {string} [cultivo] - Cultivo asociado (`silo`, `cebada`, …).
 * @property {string} [nombre] - Nombre del productor.
 * @property {string} [predio] - Nombre del predio.
 * @property {number} [hectareas] - Superficie en hectáreas.
 * @property {number} [muestraPlantas] - Plantas contadas en la muestra.
 * @property {number} [muestraMetros] - Metros lineales muestreados.
 * @property {number} [plantasConElote] - Plantas con elote en la muestra.
 * @property {string} [dictamen] - Código de dictamen (`CP-1`, `1C`, `2C`).
 * @property {string} [fechaCorte] - Fecha estimada de corte (`YYYY-MM-DD`).
 * @property {{lat: number, lng: number, referencia?: string}} [ubicacion] - Coordenadas.
 */

/** Caché de formateadores numéricos por cantidad de decimales. */
const numberFormatters = new Map();

/**
 * Devuelve un formateador numérico de `es-MX` con los decimales indicados.
 *
 * @param {number} digits - Cantidad de decimales fijos.
 * @returns {Intl.NumberFormat} Formateador memorizado.
 */
function getNumberFormatter(digits) {
  let formatter = numberFormatters.get(digits);

  if (!formatter) {
    formatter = new Intl.NumberFormat("es-MX", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    numberFormatters.set(digits, formatter);
  }

  return formatter;
}

/**
 * Formatea un número con separadores y decimales de México.
 *
 * @param {unknown} value - Valor a formatear.
 * @param {number} [digits=0] - Decimales fijos.
 * @returns {string} Número legible; `0` si el valor no es finito.
 */
export function formatNumber(value, digits = 0) {
  const number = Number(value);

  return getNumberFormatter(digits).format(
    Number.isFinite(number) ? number : 0,
  );
}

/**
 * Formatea una superficie en hectáreas, omitiendo decimales cuando el valor es entero.
 *
 * @param {unknown} value - Superficie en hectáreas.
 * @returns {string} Texto con unidad, por ejemplo `32 ha` o `12.50 ha`.
 */
export function formatHectareas(value) {
  const number = Number(value) || 0;
  const digits = Number.isInteger(number) ? 0 : 2;

  return `${formatNumber(number, digits)} ha`;
}

/**
 * Calcula la densidad de plantas por metro lineal de un predio.
 *
 * @param {Predio} predio - Registro del predio.
 * @returns {number} Plantas por metro, o `0` si falta el muestreo.
 */
export function predioDensidad(predio) {
  const metros = Number(predio?.muestraMetros);
  const plantas = Number(predio?.muestraPlantas);

  if (!metros || !plantas) return 0;

  return plantas / metros;
}

/**
 * Calcula el porcentaje de plantas con elote de un predio.
 *
 * @param {Predio} predio - Registro del predio.
 * @returns {number} Porcentaje entre 0 y 100, o `0` si falta el muestreo.
 */
export function predioElotePct(predio) {
  const muestra = Number(predio?.muestraPlantas);
  const elote = Number(predio?.plantasConElote);

  if (!muestra || !Number.isFinite(elote)) return 0;

  return (elote / muestra) * 100;
}

/**
 * Resume los indicadores principales de una colección de predios.
 *
 * @param {Predio[]} [predios=[]] - Predios a resumir.
 * @returns {{
 *   total: number,
 *   hectareas: number,
 *   productores: number,
 *   muestra: number,
 *   metros: number,
 *   conElote: number,
 *   elotePct: number,
 *   densidad: number,
 *   premium: number,
 *   premiumPct: number,
 *   promedioHa: number,
 *   calidad: Record<string, number>
 * }} Totales y promedios del conjunto.
 */
export function summarize(predios = []) {
  /** @type {Record<string, number>} */
  const calidad = Object.fromEntries(
    DICTAMENES.map((dictamen) => [dictamen.id, 0]),
  );
  const productores = new Set();

  let hectareas = 0;
  let muestra = 0;
  let metros = 0;
  let conElote = 0;

  // Un solo recorrido evita cinco `reduce` y tres `filter` sobre el mismo arreglo.
  for (const predio of predios) {
    hectareas += Number(predio?.hectareas) || 0;
    muestra += Number(predio?.muestraPlantas) || 0;
    metros += Number(predio?.muestraMetros) || 0;
    conElote += Number(predio?.plantasConElote) || 0;

    if (predio?.nombre) productores.add(predio.nombre);

    if (predio?.dictamen && calidad[predio.dictamen] !== undefined) {
      calidad[predio.dictamen] += 1;
    }
  }

  const total = predios.length;
  const premium = calidad["CP-1"] || 0;

  return {
    total,
    hectareas,
    productores: productores.size,
    muestra,
    metros,
    conElote,
    elotePct: muestra ? (conElote / muestra) * 100 : 0,
    densidad: metros ? muestra / metros : 0,
    premium,
    premiumPct: total ? (premium / total) * 100 : 0,
    promedioHa: total ? hectareas / total : 0,
    calidad,
  };
}

/**
 * @typedef {Object} ProductorResumen
 * @property {string} nombre - Nombre del productor.
 * @property {number} predios - Cantidad de predios.
 * @property {number} hectareas - Superficie acumulada.
 * @property {number} muestra - Plantas muestreadas.
 * @property {number} conElote - Plantas con elote.
 * @property {number} elotePct - Porcentaje de plantas con elote.
 * @property {Record<string, number>} calidad - Conteo por dictamen.
 */

/**
 * Agrupa los predios por productor y calcula sus totales.
 *
 * @param {Predio[]} [predios=[]] - Predios a agrupar.
 * @returns {ProductorResumen[]} Productores ordenados por superficie descendente.
 */
export function groupByProductor(predios = []) {
  /** @type {Map<string, ProductorResumen>} */
  const map = new Map();

  for (const predio of predios) {
    const key = predio.nombre || "Sin productor";
    let row = map.get(key);

    if (!row) {
      row = {
        nombre: key,
        predios: 0,
        hectareas: 0,
        muestra: 0,
        conElote: 0,
        calidad: Object.fromEntries(
          DICTAMENES.map((dictamen) => [dictamen.id, 0]),
        ),
      };
      map.set(key, row);
    }

    row.predios += 1;
    row.hectareas += Number(predio.hectareas) || 0;
    row.muestra += Number(predio.muestraPlantas) || 0;
    row.conElote += Number(predio.plantasConElote) || 0;

    if (row.calidad[predio.dictamen] !== undefined) {
      row.calidad[predio.dictamen] += 1;
    }
  }

  return [...map.values()]
    .map((row) => ({
      ...row,
      elotePct: row.muestra ? (row.conElote / row.muestra) * 100 : 0,
    }))
    .sort((a, b) => b.hectareas - a.hectareas);
}

/**
 * @typedef {Object} MesCortes
 * @property {string} key - Clave `YYYY-MM`.
 * @property {string} label - Mes abreviado.
 * @property {string} full - Mes y año completos.
 * @property {number} value - Cantidad de cortes programados.
 */

/**
 * Cuenta los cortes programados por mes, empezando por el mes actual.
 *
 * @param {Predio[]} [predios=[]] - Predios con `fechaCorte`.
 * @param {number} [months=6] - Cantidad de meses a incluir.
 * @returns {MesCortes[]} Serie mensual lista para graficar.
 */
export function monthlyCuts(predios = [], months = 6) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), 1);

  /** @type {Map<string, number>} */
  const counts = new Map();

  for (const predio of predios) {
    if (!predio.fechaCorte) continue;

    const key = predio.fechaCorte.slice(0, 7);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from({ length: months }, (_, index) => {
    const date = addMonths(base, index);
    const key = monthKey(date);

    return {
      key,
      label: monthShort(date),
      full: new Intl.DateTimeFormat("es-MX", {
        month: "long",
        year: "numeric",
      }).format(date),
      value: counts.get(key) || 0,
    };
  });
}

/**
 * Obtiene los próximos cortes ordenados por cercanía.
 *
 * @param {Predio[]} [predios=[]] - Predios con `fechaCorte`.
 * @param {number} [limit=6] - Máximo de resultados.
 * @returns {Array<Predio & {days: number}>} Próximos cortes con días restantes.
 */
export function upcomingCuts(predios = [], limit = 6) {
  const today = todayISO();

  return predios
    .filter((predio) => predio.fechaCorte)
    .map((predio) => ({
      ...predio,
      days: diffDaysISO(today, predio.fechaCorte),
    }))
    .filter((predio) => predio.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, limit);
}

/**
 * Cuenta los predios registrados por cultivo.
 *
 * @param {Predio[]} [predios=[]] - Predios a contar.
 * @returns {Record<string, number>} Conteo indexado por identificador de cultivo.
 */
export function countByCultivo(predios = []) {
  /** @type {Record<string, number>} */
  const counts = Object.fromEntries(CULTIVOS.map((cultivo) => [cultivo.id, 0]));

  for (const predio of predios) {
    if (predio.cultivo && counts[predio.cultivo] !== undefined) {
      counts[predio.cultivo] += 1;
    }
  }

  return counts;
}

/**
 * Construye las iniciales de un nombre para avatares.
 *
 * @param {string} [name=""] - Nombre completo.
 * @returns {string} Una o dos iniciales en mayúsculas, o `"—"` si no hay nombre.
 */
export function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Comprueba que un valor sea una coordenada numérica dentro de un rango.
 *
 * @param {unknown} value - Valor a validar.
 * @param {number} min - Límite inferior inclusivo.
 * @param {number} max - Límite superior inclusivo.
 * @returns {boolean} `true` si es un número finito dentro del rango.
 */
export function isValidCoordinate(value, min, max) {
  const number = Number(value);

  return Number.isFinite(number) && number >= min && number <= max;
}
