/**
 * Catálogos agronómicos y geográficos del módulo Silo.
 *
 * Se mantienen separados de `constants.js` para que la configuración del
 * cultivo (dictámenes, tips, logística) no crezca con cada catálogo nuevo y
 * para poder reutilizarlos en formularios, filtros y agregaciones.
 *
 * @module data/catalogos
 */

/**
 * @typedef {Object} Variedad
 * @property {string} id - Identificador usado en el formulario y el estado.
 * @property {string} nombre - Nombre visible.
 * @property {string} descripcion - Rasgo distintivo para el productor.
 */

/**
 * Variedades de maíz contempladas para ensilaje.
 *
 * "Híbrido" agrupa el material comercial sin marca específica; Faisán,
 * Comanche y Albatros son híbridos comerciales usados en el bajío y el
 * altiplano; "Criollo" representa el material local del productor.
 *
 * @type {Variedad[]}
 */
export const VARIEDADES = [
  {
    id: "hibrido",
    nombre: "Híbrido",
    descripcion: "Material comercial de ciclo intermedio sin marca específica.",
  },
  {
    id: "faisan",
    nombre: "Faisán",
    descripcion: "Híbrido comercial de buen rendimiento forrajero.",
  },
  {
    id: "comanche",
    nombre: "Comanche",
    descripcion: "Híbrido comercial adaptado a siembras de temporal y riego.",
  },
  {
    id: "albatros",
    nombre: "Albatros",
    descripcion: "Híbrido comercial de planta alta y mazorca uniforme.",
  },
  {
    id: "criollo",
    nombre: "Criollo",
    descripcion: "Semilla local conservada por el productor.",
  },
  {
    id: "otro",
    nombre: "Otro",
    descripcion: "Material distinto a los anteriores; se detalla en observaciones.",
  },
];

/**
 * Índice de variedades por identificador.
 *
 * @type {Record<string, Variedad>}
 */
export const VARIEDAD_MAP = Object.fromEntries(
  VARIEDADES.map((variedad) => [variedad.id, variedad]),
);

/** Variedad sugerida para capturas nuevas. */
export const VARIEDAD_DEFAULT = "hibrido";

/**
 * @typedef {Object} RegimenHidrico
 * @property {string} id - Identificador.
 * @property {string} nombre - Nombre visible.
 * @property {string} descripcion - Fuente de agua del ciclo.
 */

/**
 * Régimen hídrico del predio.
 *
 * @type {RegimenHidrico[]}
 */
export const REGIMENES_HIDRICOS = [
  {
    id: "temporal",
    nombre: "Temporal",
    descripcion: "El ciclo depende de la lluvia.",
  },
  {
    id: "riego",
    nombre: "Riego",
    descripcion: "El predio cuenta con agua de pozo, canal o presa.",
  },
];

/**
 * Índice de regímenes hídricos por identificador.
 *
 * @type {Record<string, RegimenHidrico>}
 */
export const REGIMEN_MAP = Object.fromEntries(
  REGIMENES_HIDRICOS.map((regimen) => [regimen.id, regimen]),
);

/** Régimen hídrico sugerido para capturas nuevas. */
export const REGIMEN_DEFAULT = "temporal";

/**
 * @typedef {Object} Zona
 * @property {string} id - Identificador (`zona-1` … `zona-4`).
 * @property {string} nombre - Nombre visible.
 * @property {string} rango - Distancia al rancho de referencia.
 * @property {number} distanciaMin - Límite inferior en kilómetros.
 * @property {number} distanciaMax - Límite superior en kilómetros.
 * @property {string} color - Color principal para etiquetas y gráficas.
 * @property {string} suave - Fondo suave para etiquetas.
 * @property {string[]} localidades - Localidades incluidas en la zona.
 */

/**
 * Zonas de acopio medidas desde el Rancho de Grupo Ganadero Delite
 * (Oriental, Puebla) en un radio de 65 km.
 *
 * @type {Zona[]}
 */
export const ZONAS = [
  {
    id: "zona-1",
    nombre: "Zona 1",
    rango: "11–20 km",
    distanciaMin: 11,
    distanciaMax: 20,
    color: "var(--zona-1)",
    suave: "var(--zona-1-soft)",
    localidades: [
      "El Carmen",
      "Oriental",
      "Nuevo México",
      "Coyotepec",
      "Libres",
      "Mazatepec",
    ],
  },
  {
    id: "zona-2",
    nombre: "Zona 2",
    rango: "21–30 km",
    distanciaMin: 21,
    distanciaMax: 30,
    color: "var(--zona-2)",
    suave: "var(--zona-2-soft)",
    localidades: ["San José Ozumba", "Cuapiaxtla", "Altzayanca"],
  },
  {
    id: "zona-3",
    nombre: "Zona 3",
    rango: "31–45 km",
    distanciaMin: 31,
    distanciaMax: 45,
    color: "var(--zona-3)",
    suave: "var(--zona-3-soft)",
    localidades: [
      "Santa María Ixtiyucal",
      "Nopalucan",
      "Chapultepec",
      "Grajales",
    ],
  },
  {
    id: "zona-4",
    nombre: "Zona 4",
    rango: "55–62 km",
    distanciaMin: 55,
    distanciaMax: 65,
    color: "var(--zona-4)",
    suave: "var(--zona-4-soft)",
    localidades: ["Zitlaltepec", "El Rincón", "Ixtenco", "Perote"],
  },
];

/**
 * Índice de zonas por identificador.
 *
 * @type {Record<string, Zona>}
 */
export const ZONA_MAP = Object.fromEntries(
  ZONAS.map((zona) => [zona.id, zona]),
);

/**
 * @typedef {Object} Localidad
 * @property {string} nombre - Nombre de la localidad.
 * @property {string} zona - Identificador de la zona a la que pertenece.
 */

/**
 * Localidades del catálogo, cada una asociada a su zona de acopio.
 *
 * @type {Localidad[]}
 */
export const LOCALIDADES = ZONAS.flatMap((zona) =>
  zona.localidades.map((nombre) => ({ nombre, zona: zona.id })),
);

/**
 * Normaliza un texto para comparaciones tolerantes a acentos y mayúsculas.
 *
 * @param {unknown} value - Texto a normalizar.
 * @returns {string} Texto en minúsculas y sin diacríticos.
 */
function normalizarClave(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Índice de localidades por nombre, sin distinguir mayúsculas ni acentos.
 *
 * @type {Map<string, Localidad>}
 */
const LOCALIDAD_INDEX = new Map(
  LOCALIDADES.map((localidad) => [
    normalizarClave(localidad.nombre),
    localidad,
  ]),
);

/**
 * Obtiene la zona de acopio correspondiente a una localidad.
 *
 * @param {string} nombre - Nombre de la localidad.
 * @returns {string} Identificador de zona, o cadena vacía si no está catalogada.
 */
export function zonaDeLocalidad(nombre) {
  return LOCALIDAD_INDEX.get(normalizarClave(nombre))?.zona || "";
}

/**
 * Obtiene la zona cuya distancia corresponde a los kilómetros indicados.
 *
 * Se usa como apoyo cuando el predio ya tiene coordenadas y se conoce la
 * distancia al rancho de referencia.
 *
 * @param {number} km - Distancia en kilómetros.
 * @returns {string} Identificador de zona, o cadena vacía si está fuera de rango.
 */
export function zonaPorDistancia(km) {
  const distancia = Number(km);

  if (!Number.isFinite(distancia)) return "";

  return (
    ZONAS.find(
      (zona) =>
        distancia >= zona.distanciaMin && distancia <= zona.distanciaMax,
    )?.id || ""
  );
}

/**
 * @typedef {Object} OpcionBooleana
 * @property {string} id - Identificador persistido (`si` / `no`).
 * @property {string} nombre - Texto visible.
 */

/**
 * Opciones para registrar si el predio recibió un paquete tecnológico.
 *
 * @type {OpcionBooleana[]}
 */
export const PAQUETE_TECNOLOGICO = [
  { id: "si", nombre: "Sí" },
  { id: "no", nombre: "No" },
];

/** Valor sugerido cuando el productor aún no confirma el paquete. */
export const PAQUETE_DEFAULT = "no";
