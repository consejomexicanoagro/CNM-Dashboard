/**
 * Agregaciones de calidad, ranking, zonas y observaciones.
 *
 * Complementa a `utils/metrics` con los indicadores que combinan varias
 * dimensiones (dictamen + muestreo + superficie) y con los agrupamientos que
 * alimentan los paneles de productores y zonas.
 *
 * @module utils/analytics
 */

import { DICTAMENES } from "../data/constants";
import {
  PAQUETE_TECNOLOGICO,
  REGIMEN_MAP,
  VARIEDADES,
  VARIEDAD_MAP,
  ZONAS,
  ZONA_MAP,
} from "../data/catalogos";
import { predioDensidad, predioElotePct } from "./metrics";

/**
 * Puntaje de calidad base de cada dictamen (0–100).
 *
 * @type {Record<string, number>}
 */
export const PUNTAJE_POR_DICTAMEN = { "CP-1": 100, "1C": 75, "2C": 50 };

/** Peso del dictamen dentro del puntaje final. */
const PESO_DICTAMEN = 0.6;

/** Peso del porcentaje de plantas con elote dentro del puntaje final. */
const PESO_ELOTE = 0.4;

/**
 * @typedef {Object} Semaforo
 * @property {"verde"|"amarillo"|"rojo"} id - Identificador del color.
 * @property {string} nombre - Nombre visible.
 * @property {number} min - Puntaje mínimo para entrar en la categoría.
 * @property {string} color - Color principal.
 * @property {string} suave - Fondo suave para etiquetas.
 * @property {string} descripcion - Criterio de clasificación.
 */

/**
 * Semáforo de productores, ordenado de mejor a peor.
 *
 * @type {Semaforo[]}
 */
export const SEMAFOROS = [
  {
    id: "verde",
    nombre: "Verde",
    min: 80,
    color: "var(--semaforo-verde)",
    suave: "var(--semaforo-verde-soft)",
    descripcion: "Calidad alta y buen llenado de elote.",
  },
  {
    id: "amarillo",
    nombre: "Amarillo",
    min: 60,
    color: "var(--semaforo-amarillo)",
    suave: "var(--semaforo-amarillo-soft)",
    descripcion: "Calidad media o muestreo con variaciones.",
  },
  {
    id: "rojo",
    nombre: "Rojo",
    min: 0,
    color: "var(--semaforo-rojo)",
    suave: "var(--semaforo-rojo-soft)",
    descripcion: "Requiere revisión antes de programar el corte.",
  },
];

/**
 * Índice de semáforos por identificador.
 *
 * @type {Record<string, Semaforo>}
 */
export const SEMAFORO_MAP = Object.fromEntries(
  SEMAFOROS.map((semaforo) => [semaforo.id, semaforo]),
);

/**
 * Calcula el puntaje de calidad (0–100) de un predio.
 *
 * Combina el dictamen asignado en campo con el porcentaje de plantas con elote
 * de la muestra. Si el predio no tiene muestreo, se usa solo el dictamen para
 * no castigar un dato faltante.
 *
 * @param {Record<string, any>} predio - Registro del predio.
 * @returns {number} Puntaje entre 0 y 100.
 */
export function puntajeCalidad(predio) {
  const base = PUNTAJE_POR_DICTAMEN[predio?.dictamen];

  if (base === undefined) return 0;

  const muestra = Number(predio?.muestraPlantas);

  if (!muestra) return base;

  return base * PESO_DICTAMEN + predioElotePct(predio) * PESO_ELOTE;
}

/**
 * Clasifica un puntaje dentro del semáforo.
 *
 * @param {number} puntaje - Puntaje de calidad.
 * @returns {Semaforo} Categoría correspondiente.
 */
export function semaforoPorPuntaje(puntaje) {
  const valor = Number(puntaje) || 0;

  return (
    SEMAFOROS.find((semaforo) => valor >= semaforo.min) ||
    SEMAFOROS[SEMAFOROS.length - 1]
  );
}

/**
 * Calcula el puntaje promedio de una colección de predios, ponderado por
 * superficie.
 *
 * @param {Array<Record<string, any>>} [predios=[]] - Predios a evaluar.
 * @returns {number} Puntaje promedio entre 0 y 100.
 */
export function puntajePromedio(predios = []) {
  let suma = 0;
  let pesoTotal = 0;

  for (const predio of predios) {
    const hectareas = Number(predio.hectareas) || 0;
    const peso = hectareas > 0 ? hectareas : 1;

    suma += puntajeCalidad(predio) * peso;
    pesoTotal += peso;
  }

  return pesoTotal ? suma / pesoTotal : 0;
}

/**
 * @typedef {Object} PredioDetalle
 * @property {number} densidad - Plantas por metro lineal.
 * @property {number} elotePct - Porcentaje de plantas con elote.
 * @property {number} puntaje - Puntaje de calidad.
 * @property {Semaforo} semaforo - Clasificación del puntaje.
 * @property {import("../data/catalogos").Zona|null} zonaInfo - Zona de acopio.
 * @property {import("../data/catalogos").Variedad|null} variedadInfo - Variedad.
 * @property {import("../data/catalogos").RegimenHidrico|null} regimenInfo - Régimen hídrico.
 * @property {boolean} conPaquete - `true` si recibió paquete tecnológico.
 */

/**
 * Añade los indicadores derivados y la información de catálogo a un predio.
 *
 * @param {Record<string, any>} predio - Registro original.
 * @returns {Record<string, any> & PredioDetalle} Predio enriquecido.
 */
export function detallePredio(predio) {
  const puntaje = puntajeCalidad(predio);

  return {
    ...predio,
    densidad: predioDensidad(predio),
    elotePct: predioElotePct(predio),
    puntaje,
    semaforo: semaforoPorPuntaje(puntaje),
    zonaInfo: ZONA_MAP[predio.zona] || null,
    variedadInfo: VARIEDAD_MAP[predio.variedad] || null,
    regimenInfo: REGIMEN_MAP[predio.regimenHidrico] || null,
    conPaquete: predio.paqueteTecnologico === "si",
  };
}

/**
 * Agrupa una colección de predios por clave y acumula sus indicadores.
 *
 * @param {Array<Record<string, any>>} predios - Predios a agrupar.
 * @param {(predio: Record<string, any>) => string} getKey - Clave de agrupación.
 * @returns {Map<string, Record<string, any>>} Totales por clave.
 */
function acumular(predios, getKey) {
  const mapa = new Map();

  for (const original of predios) {
    const predio = detallePredio(original);
    const key = getKey(predio) || "";

    let fila = mapa.get(key);

    if (!fila) {
      fila = {
        key,
        predios: 0,
        hectareas: 0,
        muestra: 0,
        conElote: 0,
        puntajePonderado: 0,
        peso: 0,
        calidad: Object.fromEntries(
          DICTAMENES.map((dictamen) => [dictamen.id, 0]),
        ),
        zonas: new Set(),
        variedades: new Set(),
        conPaquete: 0,
        conObservaciones: 0,
        lista: [],
      };
      mapa.set(key, fila);
    }

    const hectareas = Number(predio.hectareas) || 0;
    const peso = hectareas > 0 ? hectareas : 1;

    fila.predios += 1;
    fila.hectareas += hectareas;
    fila.muestra += Number(predio.muestraPlantas) || 0;
    fila.conElote += Number(predio.plantasConElote) || 0;
    fila.puntajePonderado += predio.puntaje * peso;
    fila.peso += peso;
    fila.lista.push(predio);

    if (fila.calidad[predio.dictamen] !== undefined) {
      fila.calidad[predio.dictamen] += 1;
    }

    if (predio.zona) fila.zonas.add(predio.zona);
    if (predio.variedad) fila.variedades.add(predio.variedad);
    if (predio.conPaquete) fila.conPaquete += 1;
    if (predio.observaciones) fila.conObservaciones += 1;
  }

  for (const fila of mapa.values()) {
    fila.elotePct = fila.muestra
      ? (fila.conElote / fila.muestra) * 100
      : 0;
    fila.puntaje = fila.peso ? fila.puntajePonderado / fila.peso : 0;
    fila.semaforo = semaforoPorPuntaje(fila.puntaje);
    fila.paquetesPct = fila.predios
      ? (fila.conPaquete / fila.predios) * 100
      : 0;
    fila.zonas = [...fila.zonas].map((id) => ZONA_MAP[id]).filter(Boolean);
    fila.variedades = [...fila.variedades]
      .map((id) => VARIEDAD_MAP[id])
      .filter(Boolean);
    fila.lista.sort((a, b) => b.puntaje - a.puntaje);
  }

  return mapa;
}

/**
 * @typedef {Object} ProductorRanking
 * @property {number} posicion - Lugar en el ranking (1 = mejor).
 * @property {string} nombre - Nombre del productor.
 * @property {number} predios - Cantidad de predios.
 * @property {number} hectareas - Superficie acumulada.
 * @property {number} elotePct - Porcentaje agregado de plantas con elote.
 * @property {number} puntaje - Puntaje ponderado por superficie.
 * @property {Semaforo} semaforo - Clasificación del productor.
 * @property {Record<string, number>} calidad - Conteo por dictamen.
 * @property {Array<Record<string, any>>} lista - Predios con sus indicadores.
 */

/**
 * Construye el ranking de productores por calidad.
 *
 * El puntaje del productor se pondera por superficie para que un predio grande
 * no quede opacado por uno pequeño con mejor muestra.
 *
 * @param {Array<Record<string, any>>} [predios=[]] - Predios a evaluar.
 * @returns {ProductorRanking[]} Productores ordenados de mejor a peor.
 */
export function rankProductores(predios = []) {
  const mapa = acumular(predios, (predio) => predio.nombre || "Sin productor");

  return [...mapa.values()]
    .map((fila) => ({
      nombre: fila.key,
      predios: fila.predios,
      hectareas: fila.hectareas,
      elotePct: fila.elotePct,
      puntaje: fila.puntaje,
      semaforo: fila.semaforo,
      calidad: fila.calidad,
      zonas: fila.zonas,
      variedades: fila.variedades,
      paquetesPct: fila.paquetesPct,
      lista: fila.lista,
    }))
    .sort(
      (a, b) =>
        b.puntaje - a.puntaje ||
        b.elotePct - a.elotePct ||
        b.hectareas - a.hectareas,
    )
    .map((productor, index) => ({ ...productor, posicion: index + 1 }));
}

/**
 * @typedef {Object} GrupoCalidad
 * @property {string} id - Código del dictamen.
 * @property {string} nombre - Nombre completo del dictamen.
 * @property {string} color - Color principal.
 * @property {string} suave - Fondo suave.
 * @property {number} predios - Predios con ese dictamen.
 * @property {number} hectareas - Superficie con ese dictamen.
 * @property {number} elotePct - Porcentaje agregado de plantas con elote.
 * @property {Array<Record<string, any>>} productores - Productores presentes.
 */

/**
 * Separa a los productores por dictamen de calidad.
 *
 * Cada productor aparece en todos los grupos donde tenga al menos un predio,
 * con el conteo y la superficie correspondientes a ese dictamen.
 *
 * @param {Array<Record<string, any>>} [predios=[]] - Predios a agrupar.
 * @returns {GrupoCalidad[]} Grupos en el orden de `DICTAMENES`.
 */
export function productoresPorCalidad(predios = []) {
  return DICTAMENES.map((dictamen) => {
    const delGrupo = predios.filter(
      (predio) => predio.dictamen === dictamen.id,
    );
    const mapa = acumular(delGrupo, (predio) => predio.nombre || "Sin productor");

    const productores = [...mapa.values()]
      .map((fila) => ({
        nombre: fila.key,
        predios: fila.predios,
        hectareas: fila.hectareas,
        elotePct: fila.elotePct,
        puntaje: fila.puntaje,
        semaforo: fila.semaforo,
        lista: fila.lista,
      }))
      .sort(
        (a, b) => b.predios - a.predios || b.hectareas - a.hectareas,
      );

    const muestra = delGrupo.reduce(
      (sum, predio) => sum + (Number(predio.muestraPlantas) || 0),
      0,
    );
    const conElote = delGrupo.reduce(
      (sum, predio) => sum + (Number(predio.plantasConElote) || 0),
      0,
    );

    return {
      ...dictamen,
      predios: delGrupo.length,
      hectareas: delGrupo.reduce(
        (sum, predio) => sum + (Number(predio.hectareas) || 0),
        0,
      ),
      elotePct: muestra ? (conElote / muestra) * 100 : 0,
      productores,
    };
  });
}

/**
 * @typedef {Object} ZonaResumen
 * @property {string} id - Identificador de la zona (vacío si no está definida).
 * @property {string} nombre - Nombre visible.
 * @property {string} rango - Distancia al rancho de referencia.
 * @property {string} color - Color principal.
 * @property {number} predios - Predios en la zona.
 * @property {number} hectareas - Superficie acumulada.
 * @property {number} productores - Productores distintos.
 * @property {number} elotePct - Porcentaje agregado de plantas con elote.
 * @property {Record<string, number>} calidad - Conteo por dictamen.
 * @property {number} pctPredios - Participación sobre el total filtrado.
 */

/**
 * Resume los predios por zona de acopio.
 *
 * @param {Array<Record<string, any>>} [predios=[]] - Predios a agrupar.
 * @returns {ZonaResumen[]} Zonas 1–4 y, si hace falta, el grupo «Sin zona».
 */
export function resumenZonas(predios = []) {
  const mapa = acumular(predios, (predio) => predio.zona || "sin-zona");
  const total = predios.length || 1;

  const zonas = ZONAS.map((zona) => {
    const fila = mapa.get(zona.id);
    const lista = fila?.lista || [];

    return {
      id: zona.id,
      nombre: zona.nombre,
      rango: zona.rango,
      color: zona.color,
      suave: zona.suave,
      predios: fila?.predios || 0,
      hectareas: fila?.hectareas || 0,
      productores: new Set(lista.map((predio) => predio.nombre)).size,
      elotePct: fila?.elotePct || 0,
      calidad:
        fila?.calidad ||
        Object.fromEntries(DICTAMENES.map((dictamen) => [dictamen.id, 0])),
      pctPredios: ((fila?.predios || 0) / total) * 100,
    };
  });

  const sinZona = mapa.get("sin-zona");

  if (sinZona) {
    zonas.push({
      id: "",
      nombre: "Sin zona",
      rango: "Sin clasificar",
      color: "var(--zona-none)",
      suave: "var(--zona-none-soft)",
      predios: sinZona.predios,
      hectareas: sinZona.hectareas,
      productores: new Set(sinZona.lista.map((predio) => predio.nombre)).size,
      elotePct: sinZona.elotePct,
      calidad: sinZona.calidad,
      pctPredios: (sinZona.predios / total) * 100,
    });
  }

  return zonas;
}

/**
 * @typedef {Object} VariedadResumen
 * @property {string} id - Identificador de la variedad.
 * @property {string} nombre - Nombre visible.
 * @property {number} predios - Predios sembrados con la variedad.
 * @property {number} hectareas - Superficie acumulada.
 * @property {number} elotePct - Porcentaje agregado de plantas con elote.
 * @property {number} puntaje - Puntaje ponderado por superficie.
 */

/**
 * Resume los predios por variedad sembrada.
 *
 * @param {Array<Record<string, any>>} [predios=[]] - Predios a agrupar.
 * @returns {VariedadResumen[]} Variedades del catálogo, incluidas las vacías.
 */
export function resumenVariedades(predios = []) {
  const mapa = acumular(predios, (predio) => predio.variedad || "");

  return VARIEDADES.map((variedad) => {
    const fila = mapa.get(variedad.id);

    return {
      id: variedad.id,
      nombre: variedad.nombre,
      predios: fila?.predios || 0,
      hectareas: fila?.hectareas || 0,
      elotePct: fila?.elotePct || 0,
      puntaje: fila?.puntaje || 0,
    };
  });
}

/**
 * @typedef {Object} ResumenObservaciones
 * @property {number} conPaquete - Predios con paquete tecnológico.
 * @property {number} sinPaquete - Predios sin paquete tecnológico.
 * @property {number} conObservaciones - Predios con texto de observaciones.
 * @property {Array<Record<string, any>>} registros - Predios con observaciones,
 * ordenados por actualización descendente.
 */

/**
 * Resume la adopción de paquete tecnológico y las observaciones capturadas.
 *
 * @param {Array<Record<string, any>>} [predios=[]] - Predios a revisar.
 * @returns {ResumenObservaciones} Conteos y listado para el panel.
 */
export function resumenObservaciones(predios = []) {
  const registros = predios
    .filter((predio) => predio.observaciones)
    .map(detallePredio)
    .sort((a, b) =>
      String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")),
    );

  return {
    conPaquete: predios.filter((predio) => predio.paqueteTecnologico === "si")
      .length,
    sinPaquete: predios.filter(
      (predio) => predio.paqueteTecnologico !== "si",
    ).length,
    conObservaciones: registros.length,
    registros,
  };
}

/**
 * Cuenta los productores en cada color del semáforo.
 *
 * @param {ProductorRanking[]} [productores=[]] - Ranking ya calculado.
 * @returns {Record<string, number>} Conteo por identificador de semáforo.
 */
export function conteoSemaforo(productores = []) {
  const conteo = Object.fromEntries(
    SEMAFOROS.map((semaforo) => [semaforo.id, 0]),
  );

  for (const productor of productores) {
    if (conteo[productor.semaforo.id] !== undefined) {
      conteo[productor.semaforo.id] += 1;
    }
  }

  return conteo;
}

/**
 * Etiquetas legibles de las opciones de paquete tecnológico.
 *
 * @type {Record<string, string>}
 */
export const PAQUETE_LABEL = Object.fromEntries(
  PAQUETE_TECNOLOGICO.map((opcion) => [opcion.id, opcion.nombre]),
);
