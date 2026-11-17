/**
 * Utilidades de fecha basadas en cadenas ISO (`YYYY-MM-DD`).
 *
 * Se evita `new Date("YYYY-MM-DD")` porque JavaScript la interpreta como UTC y
 * puede mostrar el día anterior en zonas horarias con offset negativo (México).
 * Todas las funciones construyen y leen fechas en la hora local.
 *
 * @module utils/dates
 */

/** Abreviaturas de los meses en español (índice 0 = enero). */
const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** Milisegundos de un día, usados para calcular diferencias sin horas. */
const DAY_MS = 86_400_000;

/**
 * Caché de formateadores de `Intl.DateTimeFormat`.
 * Crear un formateador es costoso; las gráficas y tablas llaman a
 * `formatDate` muchas veces por render.
 *
 * @type {Map<string, Intl.DateTimeFormat>}
 */
const formatterCache = new Map();

/**
 * Devuelve (y memoriza) un formateador de fecha para las opciones recibidas.
 *
 * @param {Intl.DateTimeFormatOptions} options - Opciones de formato.
 * @returns {Intl.DateTimeFormat} Formateador configurado para `es-MX`.
 */
function getFormatter(options) {
  const key = JSON.stringify(options);
  let formatter = formatterCache.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat("es-MX", options);
    formatterCache.set(key, formatter);
  }

  return formatter;
}

/**
 * Convierte una fecha ISO (`YYYY-MM-DD`) en un `Date` local.
 *
 * @param {unknown} value - Valor a convertir.
 * @returns {Date|null} Fecha local válida o `null` si el valor no es válido.
 */
export function parseISO(value) {
  if (!value || typeof value !== "string") return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);

  // Rechaza fechas imposibles como 2026-02-30, que `Date` desborda al mes siguiente.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Convierte un `Date` local en una cadena ISO (`YYYY-MM-DD`).
 *
 * @param {Date} date - Fecha a convertir.
 * @returns {string} Fecha en formato ISO sin componente de hora.
 */
export function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Devuelve la fecha actual en formato ISO (`YYYY-MM-DD`).
 *
 * @returns {string} Fecha de hoy en hora local.
 */
export function todayISO() {
  return toISO(new Date());
}

/**
 * Suma (o resta) días a una fecha ISO.
 *
 * @param {string} iso - Fecha base en formato `YYYY-MM-DD`.
 * @param {number|string} days - Días a sumar; usa valores negativos para restar.
 * @returns {string} Nueva fecha ISO o cadena vacía si la fecha base no es válida.
 */
export function addDaysISO(iso, days) {
  const date = parseISO(iso);

  if (!date) return "";

  date.setDate(date.getDate() + Number(days));

  return toISO(date);
}

/**
 * Calcula la diferencia en días entre dos fechas ISO.
 *
 * @param {string} fromISO - Fecha inicial.
 * @param {string} toISOValue - Fecha final.
 * @returns {number} Días de diferencia (positivo si `toISOValue` es posterior).
 */
export function diffDaysISO(fromISO, toISOValue) {
  const from = parseISO(fromISO);
  const to = parseISO(toISOValue);

  if (!from || !to) return 0;

  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());

  return Math.round((end - start) / DAY_MS);
}

/**
 * Formatea una fecha ISO con `Intl.DateTimeFormat` en español de México.
 *
 * @param {string} iso - Fecha en formato `YYYY-MM-DD`.
 * @param {Intl.DateTimeFormatOptions} [options] - Opciones de formato.
 * @returns {string} Fecha legible o `"—"` si la fecha no es válida.
 */
export function formatDate(
  iso,
  options = { day: "2-digit", month: "short", year: "numeric" },
) {
  const date = parseISO(iso);

  if (!date) return "—";

  return getFormatter(options).format(date).replace(/\./g, "");
}

/**
 * Formatea una fecha ISO en formato largo (por ejemplo, `17 de noviembre de 2026`).
 *
 * @param {string} iso - Fecha en formato `YYYY-MM-DD`.
 * @returns {string} Fecha legible.
 */
export function formatLongDate(iso) {
  return formatDate(iso, { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Separa una fecha ISO en día y mes corto para tarjetas y listas.
 *
 * @param {string} iso - Fecha en formato `YYYY-MM-DD`.
 * @returns {{day: string, month: string}} Día con dos dígitos y mes abreviado.
 */
export function dateParts(iso) {
  const date = parseISO(iso);

  if (!date) return { day: "—", month: "—" };

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: MONTHS_SHORT[date.getMonth()],
  };
}

/**
 * Genera una clave de mes (`YYYY-MM`) para agrupar registros.
 *
 * @param {Date} date - Fecha de referencia.
 * @returns {string} Clave del mes.
 */
export function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Devuelve el primer día del mes de la fecha indicada.
 *
 * @param {Date} [date=new Date()] - Fecha de referencia.
 * @returns {Date} Primer día del mes a las 00:00.
 */
export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Suma meses al primer día de un mes.
 *
 * @param {Date} date - Fecha base.
 * @param {number} amount - Meses a sumar (puede ser negativo).
 * @returns {Date} Primer día del mes resultante.
 */
export function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

/**
 * Devuelve la abreviatura del mes de una fecha.
 *
 * @param {Date} date - Fecha de referencia.
 * @returns {string} Abreviatura de tres letras (`ene`, `feb`, …).
 */
export function monthShort(date) {
  return MONTHS_SHORT[date.getMonth()];
}

/**
 * Describe cuánto falta (o cuánto pasó) para una fecha de corte.
 *
 * @param {string} iso - Fecha de corte en formato `YYYY-MM-DD`.
 * @returns {{days: number, label: string, tone: ""|"urgent"|"late"}} Días
 * restantes, texto para mostrar y tono visual.
 */
export function relativeCut(iso) {
  const days = diffDaysISO(todayISO(), iso);

  if (days < 0) {
    const absolute = Math.abs(days);

    return {
      days,
      label: absolute === 1 ? "Hace 1 día" : `Hace ${absolute} días`,
      tone: "late",
    };
  }

  if (days === 0) return { days, label: "Hoy", tone: "urgent" };
  if (days === 1) return { days, label: "Mañana", tone: "urgent" };
  if (days <= 7) return { days, label: `En ${days} días`, tone: "urgent" };

  return { days, label: `En ${days} días`, tone: "" };
}
