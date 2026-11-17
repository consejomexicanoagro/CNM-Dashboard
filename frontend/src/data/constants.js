/**
 * Catálogos, textos y constantes del módulo Silo.
 *
 * @module data/constants
 */

/**
 * @typedef {Object} Dictamen
 * @property {string} id - Identificador y código corto (`CP-1`, `1C`, `2C`).
 * @property {string} nombre - Nombre completo del dictamen.
 * @property {string} corto - Código corto para tablas y leyendas.
 * @property {string} color - Color principal (texto, pines y gráficas).
 * @property {string} suave - Color de fondo para etiquetas.
 * @property {string} descripcion - Criterio de asignación.
 */

/**
 * @typedef {Object} Cultivo
 * @property {string} id - Identificador usado en la navegación.
 * @property {string} nombre - Nombre visible.
 * @property {string} descripcion - Descripción breve.
 * @property {"activo"|"proximamente"} estado - Disponibilidad del módulo.
 * @property {string} icon - Nombre del icono en `components/ui/Icon`.
 */

/** Días estimados entre la siembra y el corte del forraje. */
export const DIAS_CORTE = 150;

/** Identificador del cultivo habilitado actualmente. */
export const CULTIVO_ACTIVO = "silo";

/** Dictamen asignado por defecto a una captura nueva. */
export const DICTAMEN_DEFAULT = "1C";

/**
 * Dictámenes de calidad disponibles, ordenados de mayor a menor calidad.
 *
 * @type {Dictamen[]}
 */
export const DICTAMENES = [
  {
    id: "CP-1",
    nombre: "Calidad Premium Primera",
    corto: "CP-1",
    color: "#1c6b45",
    suave: "#e5f3eb",
    descripcion: "Mazorca uniforme, grano sano y lleno, sin daño ni plagas.",
  },
  {
    id: "1C",
    nombre: "Primera Calidad",
    corto: "1C",
    color: "#a97a1b",
    suave: "#f9efd6",
    descripcion: "Buen desarrollo con daños menores o variaciones de tamaño.",
  },
  {
    id: "2C",
    nombre: "Segunda Calidad",
    corto: "2C",
    color: "#b4552f",
    suave: "#faeae2",
    descripcion: "Desarrollo irregular, daño visible, humedad o impurezas.",
  },
];

/**
 * Índice de dictámenes por identificador para búsquedas O(1).
 *
 * @type {Record<string, Dictamen>}
 */
export const DICTAMEN_MAP = Object.fromEntries(
  DICTAMENES.map((dictamen) => [dictamen.id, dictamen]),
);

/**
 * Cultivos contemplados por el sistema. Solo `silo` está activo.
 *
 * @type {Cultivo[]}
 */
export const CULTIVOS = [
  {
    id: "silo",
    nombre: "Silo",
    descripcion: "Maíz para ensilaje",
    estado: "activo",
    icon: "sprout",
  },
  {
    id: "cebada",
    nombre: "Cebada",
    descripcion: "Calidad maltera, humedad y calibre de grano",
    estado: "proximamente",
    icon: "wheat",
  },
  {
    id: "maiz-azul",
    nombre: "Maíz azul",
    descripcion: "Pigmentación, sanidad y rendimiento",
    estado: "proximamente",
    icon: "corn",
  },
  {
    id: "maiz-blanco",
    nombre: "Maíz blanco",
    descripcion: "Humedad, impurezas y destino comercial",
    estado: "proximamente",
    icon: "corn",
  },
  {
    id: "pacas",
    nombre: "Pacas",
    descripcion: "Peso, humedad y logística de acarreo",
    estado: "proximamente",
    icon: "package",
  },
];

/** Texto único para la logística habilitada del módulo Silo. */
export const TRANSPORTE_LABEL = "Solo camiones";

/**
 * Recomendaciones generales de acarreo y conservación del forraje.
 *
 * @type {string[]}
 */
export const LOGISTICA_TIPS = [
  "Suelo arcilloso o vertisol: con lluvia se forma lodo y el camión se atasca. Programa el corte en una ventana seca y revisa el acceso antes de cargar.",
  "Suelo arenoso: drena rápido, pero la carga pesada deja huellas y favorece la erosión. Define una ruta fija de circulación.",
  "Humedad ideal del forraje: 65–70 %. Muy húmedo provoca escurrimientos y fermentación indeseada; muy seco dificulta la compactación.",
  "Llena y compacta el silo en menos de 24 h. Un camión promedio carga alrededor de 30 t: calcula los viajes antes de iniciar el corte.",
  "Evita entrar con el suelo saturado. La compactación por maquinaria reduce el rendimiento de la siguiente campaña.",
  "Coordina báscula y zona de maniobra. Camiones esperando con forraje fresco pierden calidad.",
];

/**
 * Recomendaciones destacadas para el panel y el formulario.
 *
 * @type {string[]}
 */
export const LOGISTICA_DESTACADOS = [
  "Revisa el tipo de suelo y el pronóstico antes de programar el acarreo.",
  "Mantén el forraje entre 65–70 % de humedad y ensila el mismo día.",
  "Define acceso, zona de volteo y ruta de camiones para evitar atascos.",
];

/**
 * Subconjunto de recomendaciones relacionadas con el tipo de suelo.
 *
 * @type {string[]}
 */
export const LOGISTICA_SUELO_TIPS = [
  LOGISTICA_TIPS[0],
  LOGISTICA_TIPS[1],
  LOGISTICA_TIPS[4],
];

/**
 * Orden numérico de los dictámenes para ordenamientos.
 *
 * @type {Record<string, number>}
 */
export const CALIDAD_ORDEN = { "CP-1": 0, "1C": 1, "2C": 2 };
