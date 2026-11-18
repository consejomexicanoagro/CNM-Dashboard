/**
 * Datos de demostración del módulo Silo.
 *
 * Las fechas se generan de forma relativa a la fecha actual para que el panel
 * siempre muestre cortes pasados y próximos, sin importar cuándo se abra el
 * prototipo.
 *
 * @module data/seed
 */

import { CULTIVO_ACTIVO, DIAS_CORTE } from "./constants";
import { zonaDeLocalidad } from "./catalogos";
import { addDaysISO, todayISO } from "../utils/dates";

/**
 * @typedef {Object} ProductorSeed
 * @property {string} predio - Nombre del predio.
 * @property {string} nombre - Nombre del productor.
 * @property {string} telefono - Teléfono de contacto.
 * @property {number} hectareas - Superficie en hectáreas.
 * @property {string} localidad - Localidad del predio.
 * @property {string} variedad - Identificador de la variedad sembrada.
 * @property {string} regimenHidrico - `temporal` o `riego`.
 * @property {string} paqueteTecnologico - `si` o `no`.
 * @property {string} observaciones - Observaciones generales del predio.
 * @property {number} siembraAtras - Días transcurridos desde la siembra.
 * @property {number} muestraPlantas - Plantas contadas en la muestra.
 * @property {number} muestraMetros - Metros lineales muestreados.
 * @property {number} plantasConElote - Plantas con elote.
 * @property {string} dictamen - Código de dictamen.
 * @property {number} lat - Latitud.
 * @property {number} lng - Longitud.
 * @property {string} referencia - Referencia de ubicación.
 * @property {string} notas - Notas de acceso y acarreo.
 */

/**
 * Semilla de productores y predios usada en la demostración.
 *
 * @type {ProductorSeed[]}
 */
const PRODUCTORES = [
  {
    predio: "El Trébol",
    nombre: "José Luis Ramírez",
    telefono: "33 1452 8890",
    hectareas: 32,
    localidad: "Oriental",
    variedad: "hibrido",
    regimenHidrico: "riego",
    paqueteTecnologico: "si",
    observaciones:
      "Paquete tecnológico completo: semilla certificada, fertilización de fondo y control de plagas. Sin incidencias.",
    siembraAtras: 120,
    muestraPlantas: 45,
    muestraMetros: 10,
    plantasConElote: 42,
    dictamen: "CP-1",
    lat: 20.287,
    lng: -102.545,
    referencia: "Ejido La Barca, km 4",
    notas:
      "Acceso por camino de terracería. Avisar al ejido antes del corte y programar dos viajes por la mañana.",
  },
  {
    predio: "La Cañada",
    nombre: "José Luis Ramírez",
    telefono: "33 1452 8890",
    hectareas: 18,
    localidad: "Cuapiaxtla",
    variedad: "faisan",
    regimenHidrico: "temporal",
    paqueteTecnologico: "si",
    observaciones:
      "Se aplicó paquete con densidad de 62 mil plantas por hectárea. Buen cierre de calle, sin problemas de plagas.",
    siembraAtras: 160,
    muestraPlantas: 44,
    muestraMetros: 10,
    plantasConElote: 41,
    dictamen: "1C",
    lat: 20.355,
    lng: -102.773,
    referencia: "Camino a Ocotlán, frente a la presa",
    notas:
      "Suelo arcilloso. Esperar una ventana seca para el acarreo y revisar el acceso con el camión vacío.",
  },
  {
    predio: "Los Fresnos",
    nombre: "María Fernanda Ochoa",
    telefono: "667 218 4471",
    hectareas: 48,
    localidad: "Nopalucan",
    variedad: "comanche",
    regimenHidrico: "riego",
    paqueteTecnologico: "si",
    observaciones:
      "Riego por goteo y fertilización foliar cada 15 días. Mazorca pareja, lista para dictamen.",
    siembraAtras: 95,
    muestraPlantas: 46,
    muestraMetros: 10,
    plantasConElote: 40,
    dictamen: "1C",
    lat: 24.809,
    lng: -107.394,
    referencia: "Ejido Culiacancito, carretera a Navolato",
    notas:
      "Zona de riego. Revisar humedad del forraje antes de picar y coordinar la báscula del silo.",
  },
  {
    predio: "El Sauce",
    nombre: "María Fernanda Ochoa",
    telefono: "667 218 4471",
    hectareas: 26,
    localidad: "Libres",
    variedad: "hibrido",
    regimenHidrico: "temporal",
    paqueteTecnologico: "no",
    observaciones:
      "Sin paquete tecnológico: semilla de la campaña anterior y control manual de maleza. Se recomienda muestreo más frecuente.",
    siembraAtras: 140,
    muestraPlantas: 43,
    muestraMetros: 10,
    plantasConElote: 38,
    dictamen: "2C",
    lat: 24.766,
    lng: -107.7,
    referencia: "Campo El Sauce, entrada por el dren",
    notas:
      "Se detectaron plantas con daño de gusano. El muestreo se hizo al azar en tres puntos del predio.",
  },
  {
    predio: "San Isidro",
    nombre: "Ricardo Beltrán",
    telefono: "462 129 7734",
    hectareas: 55,
    localidad: "Perote",
    variedad: "faisan",
    regimenHidrico: "riego",
    paqueteTecnologico: "si",
    observaciones:
      "Paquete completo con análisis de suelo previo. El productor reporta buena respuesta al nitrógeno.",
    siembraAtras: 170,
    muestraPlantas: 45,
    muestraMetros: 10,
    plantasConElote: 43,
    dictamen: "CP-1",
    lat: 20.676,
    lng: -101.356,
    referencia: "Rancho San Isidro, camino a Abasolo",
    notas:
      "Programar dos frentes de corte. El acceso es amplio y permite maniobrar camiones de 30 t.",
  },
  {
    predio: "La Presa",
    nombre: "Ricardo Beltrán",
    telefono: "462 129 7734",
    hectareas: 22,
    localidad: "Altzayanca",
    variedad: "criollo",
    regimenHidrico: "temporal",
    paqueteTecnologico: "no",
    observaciones:
      "Maíz criollo de la región, sin insumos externos. Interesa conservar la semilla para la siguiente campaña.",
    siembraAtras: 75,
    muestraPlantas: 44,
    muestraMetros: 10,
    plantasConElote: 39,
    dictamen: "1C",
    lat: 20.572,
    lng: -101.197,
    referencia: "Predio La Presa, junto al canal",
    notas:
      "Suelo profundo. Evitar circular si llueve; la zona junto al canal se satura con facilidad.",
  },
  {
    predio: "El Mirador",
    nombre: "Ana Sofía Delgado",
    telefono: "351 205 6682",
    hectareas: 12,
    localidad: "El Carmen",
    variedad: "comanche",
    regimenHidrico: "riego",
    paqueteTecnologico: "si",
    observaciones:
      "Paquete tecnológico con semilla tratada. Excelente llenado de grano en la muestra de campo.",
    siembraAtras: 110,
    muestraPlantas: 45,
    muestraMetros: 10,
    plantasConElote: 42,
    dictamen: "CP-1",
    lat: 19.985,
    lng: -102.284,
    referencia: "Ejido El Mirador, km 2",
    notas:
      "Mazorca uniforme y buen llenado de grano. Listo para dictamen premium.",
  },
  {
    predio: "Las Palmas",
    nombre: "Ana Sofía Delgado",
    telefono: "351 205 6682",
    hectareas: 15,
    localidad: "Grajales",
    variedad: "hibrido",
    regimenHidrico: "temporal",
    paqueteTecnologico: "si",
    observaciones:
      "Se completó el paquete con control de maleza, pero la lluvia llegó tarde. Vigilar humedad al ensilar.",
    siembraAtras: 55,
    muestraPlantas: 42,
    muestraMetros: 10,
    plantasConElote: 35,
    dictamen: "2C",
    lat: 19.955,
    lng: -102.31,
    referencia: "Camino a Jacona, parcela 18",
    notas:
      "Riego temporal. Revisar compactación después de las lluvias y evitar cargar en suelo húmedo.",
  },
  {
    predio: "Santa Rosa",
    nombre: "Héctor Manuel Cruz",
    telefono: "722 318 9056",
    hectareas: 8,
    localidad: "San José Ozumba",
    variedad: "albatros",
    regimenHidrico: "temporal",
    paqueteTecnologico: "no",
    observaciones:
      "Predio pequeño sin paquete tecnológico. El productor pide apoyo con análisis de suelo para la próxima campaña.",
    siembraAtras: 150,
    muestraPlantas: 45,
    muestraMetros: 10,
    plantasConElote: 41,
    dictamen: "1C",
    lat: 19.283,
    lng: -99.655,
    referencia: "Ejido Santa Rosa, calle principal",
    notas:
      "Predio pequeño: un solo viaje programado. Confirmar horario de llegada al silo.",
  },
  {
    predio: "El Capulín",
    nombre: "Héctor Manuel Cruz",
    telefono: "722 318 9056",
    hectareas: 10,
    localidad: "Ixtenco",
    variedad: "faisan",
    regimenHidrico: "riego",
    paqueteTecnologico: "si",
    observaciones:
      "Paquete tecnológico parcial: semilla y fertilizante, sin control químico de plagas. Monitoreo semanal.",
    siembraAtras: 130,
    muestraPlantas: 44,
    muestraMetros: 10,
    plantasConElote: 40,
    dictamen: "1C",
    lat: 19.799,
    lng: -99.875,
    referencia: "Carretera Atlacomulco-Temascalcingo, km 6",
    notas:
      "Pendiente ligera. Cargar el camión completo solo en seco y revisar frenos antes de bajar.",
  },
  {
    predio: "Valle Verde",
    nombre: "Laura Patricia Núñez",
    telefono: "775 143 2208",
    hectareas: 30,
    localidad: "Nuevo México",
    variedad: "hibrido",
    regimenHidrico: "riego",
    paqueteTecnologico: "si",
    observaciones:
      "Paquete tecnológico completo con riego de auxilio. Drenaje natural bueno y acceso amplio.",
    siembraAtras: 100,
    muestraPlantas: 45,
    muestraMetros: 10,
    plantasConElote: 43,
    dictamen: "CP-1",
    lat: 20.083,
    lng: -98.363,
    referencia: "Ejido Valle Verde, entrada por la ex-hacienda",
    notas:
      "Buen drenaje natural. Acceso apto para camión de 30 t y zona de volteo amplia.",
  },
  {
    predio: "La Providencia",
    nombre: "Laura Patricia Núñez",
    telefono: "775 143 2208",
    hectareas: 14,
    localidad: "Chapultepec",
    variedad: "criollo",
    regimenHidrico: "temporal",
    paqueteTecnologico: "no",
    observaciones:
      "Material criollo sin paquete tecnológico. Presencia de maleza y variación de tamaño entre plantas.",
    siembraAtras: 180,
    muestraPlantas: 43,
    muestraMetros: 10,
    plantasConElote: 33,
    dictamen: "2C",
    lat: 20.269,
    lng: -98.944,
    referencia: "Predio La Providencia, camino de terracería",
    notas:
      "Presencia de maleza en el acceso. Limpiar el camino y confirmar el peso por eje del camión.",
  },
  {
    predio: "El Rosario",
    nombre: "Miguel Ángel Torres",
    telefono: "427 118 5540",
    hectareas: 20,
    localidad: "Cuapiaxtla",
    variedad: "comanche",
    regimenHidrico: "riego",
    paqueteTecnologico: "si",
    observaciones:
      "Paquete tecnológico con fertirriego. Buena uniformidad; se sugiere repetir el esquema el próximo ciclo.",
    siembraAtras: 85,
    muestraPlantas: 46,
    muestraMetros: 10,
    plantasConElote: 42,
    dictamen: "1C",
    lat: 20.389,
    lng: -99.996,
    referencia: "Rancho El Rosario, km 3 carretera a Amealco",
    notas:
      "Coordinar báscula y salidas cada 40 minutos. El camino está en buen estado.",
  },
  {
    predio: "Buenavista",
    nombre: "Miguel Ángel Torres",
    telefono: "427 118 5540",
    hectareas: 9,
    localidad: "Zitlaltepec",
    variedad: "albatros",
    regimenHidrico: "temporal",
    paqueteTecnologico: "no",
    observaciones:
      "Sin paquete tecnológico y con suelo arenoso. Programar muestreo adicional antes del corte.",
    siembraAtras: 65,
    muestraPlantas: 44,
    muestraMetros: 10,
    plantasConElote: 37,
    dictamen: "2C",
    lat: 20.522,
    lng: -99.89,
    referencia: "Ejido Buenavista, parcela 7",
    notas:
      "Suelo arenoso. Fijar una ruta de circulación para no dispersar la maquinaria ni erosionar el terreno.",
  },
  {
    predio: "Rancho Alegre",
    nombre: "Claudia Estrada",
    telefono: "222 517 3309",
    hectareas: 16,
    localidad: "Coyotepec",
    variedad: "faisan",
    regimenHidrico: "riego",
    paqueteTecnologico: "si",
    observaciones:
      "Paquete tecnológico completo y forraje en punto óptimo. Programar corte en las próximas 48 horas.",
    siembraAtras: 45,
    muestraPlantas: 45,
    muestraMetros: 10,
    plantasConElote: 42,
    dictamen: "CP-1",
    lat: 19.064,
    lng: -98.303,
    referencia: "San Pedro Cholula, camino a la pirámide",
    notas:
      "Forraje en punto óptimo. Programar el corte en las próximas 48 horas.",
  },
  {
    predio: "San José",
    nombre: "Claudia Estrada",
    telefono: "222 517 3309",
    hectareas: 11,
    localidad: "Santa María Ixtiyucal",
    variedad: "hibrido",
    regimenHidrico: "temporal",
    paqueteTecnologico: "no",
    observaciones:
      "Sin paquete tecnológico por falta de financiamiento. Hay obras en la carretera; confirmar ruta alterna.",
    siembraAtras: 155,
    muestraPlantas: 42,
    muestraMetros: 10,
    plantasConElote: 36,
    dictamen: "1C",
    lat: 19.314,
    lng: -97.925,
    referencia: "Ejido San José, carretera a Ixtenco",
    notas:
      "Hay obras en la carretera. Confirmar la ruta alterna con el transportista antes del corte.",
  },
];

/**
 * Construye los predios de demostración con fechas relativas al día actual.
 *
 * @returns {Array<Record<string, unknown>>} Registros listos para el estado global.
 */
export function buildSeed() {
  const today = todayISO();
  const stamp = Date.now();

  return PRODUCTORES.map((item, index) => {
    const fechaSiembra = addDaysISO(today, -item.siembraAtras);
    const createdAt = new Date(stamp - index * 60000).toISOString();

    return {
      id: `demo-silo-${String(index + 1).padStart(2, "0")}`,
      cultivo: CULTIVO_ACTIVO,
      predio: item.predio,
      nombre: item.nombre,
      telefono: item.telefono,
      hectareas: item.hectareas,
      localidad: item.localidad,
      zona: zonaDeLocalidad(item.localidad),
      variedad: item.variedad,
      regimenHidrico: item.regimenHidrico,
      paqueteTecnologico: item.paqueteTecnologico,
      observaciones: item.observaciones,
      fechaSiembra,
      fechaCorte: addDaysISO(fechaSiembra, DIAS_CORTE),
      muestraPlantas: item.muestraPlantas,
      muestraMetros: item.muestraMetros,
      plantasConElote: item.plantasConElote,
      dictamen: item.dictamen,
      logistica: "camiones",
      notas: item.notas,
      ubicacion: {
        lat: item.lat,
        lng: item.lng,
        referencia: item.referencia,
      },
      createdAt,
      updatedAt: createdAt,
    };
  });
}
