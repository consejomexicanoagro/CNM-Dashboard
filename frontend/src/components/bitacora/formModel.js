/**
 * Modelo del formulario de dictaminación.
 *
 * Se separa del componente para mantener la lógica de conversión y validación
 * fuera del render y poder probarla de forma aislada.
 *
 * @module components/bitacora/formModel
 */

import {
  CULTIVO_ACTIVO,
  DICTAMEN_DEFAULT,
  DICTAMEN_MAP,
  DIAS_CORTE,
} from "../../data/constants";
import {
  PAQUETE_DEFAULT,
  PAQUETE_TECNOLOGICO,
  REGIMENES_HIDRICOS,
  REGIMEN_DEFAULT,
  VARIEDADES,
  VARIEDAD_DEFAULT,
  ZONA_MAP,
  zonaDeLocalidad,
} from "../../data/catalogos";
import { addDaysISO, todayISO } from "../../utils/dates";
import { isValidCoordinate } from "../../utils/metrics";

/**
 * @typedef {Object} PredioForm
 * @property {string} nombre - Nombre del productor.
 * @property {string} telefono - Teléfono de contacto.
 * @property {string} predio - Nombre del predio.
 * @property {string} hectareas - Hectáreas como texto (input controlado).
 * @property {string} localidad - Localidad del predio.
 * @property {string} zona - Identificador de la zona de acopio.
 * @property {string} variedad - Identificador de la variedad sembrada.
 * @property {string} regimenHidrico - `temporal` o `riego`.
 * @property {string} paqueteTecnologico - `si` o `no`.
 * @property {string} observaciones - Observaciones generales del predio.
 * @property {string} fechaSiembra - Fecha ISO de siembra.
 * @property {string} fechaCorte - Fecha ISO estimada de corte.
 * @property {string} muestraPlantas - Plantas contadas como texto.
 * @property {string} muestraMetros - Metros muestreados como texto.
 * @property {string} plantasConElote - Plantas con elote como texto.
 * @property {string} dictamen - Código de dictamen.
 * @property {{lat: number, lng: number}|null} ubicacion - Coordenadas.
 * @property {string} referencia - Referencia de ubicación.
 * @property {string} notas - Notas de acceso.
 */

/**
 * @typedef {Partial<Record<keyof PredioForm, string>>} FormErrors
 */

/** Identificadores válidos de variedad y régimen. */
const VARIEDAD_IDS = new Set(VARIEDADES.map((variedad) => variedad.id));
const REGIMEN_IDS = new Set(
  REGIMENES_HIDRICOS.map((regimen) => regimen.id),
);
const PAQUETE_IDS = new Set(
  PAQUETE_TECNOLOGICO.map((opcion) => opcion.id),
);

/**
 * Crea el estado inicial de una captura nueva.
 *
 * @returns {PredioForm} Formulario vacío con fechas sugeridas.
 */
export function emptyForm() {
  const today = todayISO();

  return {
    nombre: "",
    telefono: "",
    predio: "",
    hectareas: "",
    localidad: "",
    zona: "",
    variedad: VARIEDAD_DEFAULT,
    regimenHidrico: REGIMEN_DEFAULT,
    paqueteTecnologico: PAQUETE_DEFAULT,
    observaciones: "",
    fechaSiembra: today,
    fechaCorte: addDaysISO(today, DIAS_CORTE),
    muestraPlantas: "",
    muestraMetros: "",
    plantasConElote: "",
    dictamen: DICTAMEN_DEFAULT,
    ubicacion: null,
    referencia: "",
    notas: "",
  };
}

/**
 * Convierte un predio persistido en el estado del formulario.
 *
 * @param {Record<string, any>} predio - Registro existente.
 * @returns {PredioForm} Formulario editable.
 */
export function toForm(predio) {
  return {
    nombre: predio.nombre || "",
    telefono: predio.telefono || "",
    predio: predio.predio || "",
    hectareas: predio.hectareas != null ? String(predio.hectareas) : "",
    localidad: predio.localidad || "",
    zona: predio.zona || zonaDeLocalidad(predio.localidad) || "",
    variedad: VARIEDAD_IDS.has(predio.variedad)
      ? predio.variedad
      : VARIEDAD_DEFAULT,
    regimenHidrico: REGIMEN_IDS.has(predio.regimenHidrico)
      ? predio.regimenHidrico
      : REGIMEN_DEFAULT,
    paqueteTecnologico: PAQUETE_IDS.has(predio.paqueteTecnologico)
      ? predio.paqueteTecnologico
      : PAQUETE_DEFAULT,
    observaciones: predio.observaciones || "",
    fechaSiembra: predio.fechaSiembra || "",
    fechaCorte: predio.fechaCorte || "",
    muestraPlantas:
      predio.muestraPlantas != null ? String(predio.muestraPlantas) : "",
    muestraMetros:
      predio.muestraMetros != null ? String(predio.muestraMetros) : "",
    plantasConElote:
      predio.plantasConElote != null ? String(predio.plantasConElote) : "",
    dictamen: predio.dictamen || DICTAMEN_DEFAULT,
    ubicacion: predio.ubicacion
      ? { lat: predio.ubicacion.lat, lng: predio.ubicacion.lng }
      : null,
    referencia: predio.ubicacion?.referencia || "",
    notas: predio.notas || "",
  };
}

/**
 * Valida los campos del formulario y devuelve los mensajes de error.
 *
 * @param {PredioForm} form - Estado actual del formulario.
 * @returns {Partial<FormErrors>} Errores indexados por nombre de campo; vacío si es válido.
 */
export function validate(form) {
  /** @type {Partial<FormErrors>} */
  const errors = {};

  if (!form.nombre.trim()) {
    errors.nombre = "Escribe el nombre del productor.";
  }
  if (!form.predio.trim()) {
    errors.predio = "Escribe el nombre del predio.";
  }

  const phoneDigits = form.telefono.replace(/\D/g, "");

  if (!phoneDigits) {
    errors.telefono = "Escribe un teléfono de contacto.";
  } else if (phoneDigits.length !== 10) {
    errors.telefono = "El teléfono debe tener 10 dígitos.";
  }

  const hectareas = Number(form.hectareas);

  if (!form.hectareas || !Number.isFinite(hectareas) || hectareas <= 0) {
    errors.hectareas = "Ingresa una superficie mayor a 0.";
  }

  if (!form.fechaSiembra) {
    errors.fechaSiembra = "Selecciona la fecha de siembra.";
  }

  if (!form.fechaCorte) {
    errors.fechaCorte = "Selecciona la fecha estimada de corte.";
  } else if (form.fechaSiembra && form.fechaCorte < form.fechaSiembra) {
    errors.fechaCorte = "El corte no puede ser anterior a la siembra.";
  }

  if (!VARIEDAD_IDS.has(form.variedad)) {
    errors.variedad = "Selecciona la variedad sembrada.";
  }

  if (!REGIMEN_IDS.has(form.regimenHidrico)) {
    errors.regimenHidrico = "Indica si el predio es de temporal o riego.";
  }

  if (!ZONA_MAP[form.zona]) {
    errors.zona = "Selecciona la zona de acopio del predio.";
  }

  if (!PAQUETE_IDS.has(form.paqueteTecnologico)) {
    errors.paqueteTecnologico = "Indica si se aplicó paquete tecnológico.";
  }

  const plantas = Number(form.muestraPlantas);
  const metros = Number(form.muestraMetros);
  const elote = Number(form.plantasConElote);

  if (!form.muestraPlantas || !Number.isInteger(plantas) || plantas <= 0) {
    errors.muestraPlantas = "Ingresa un número entero de plantas.";
  }

  if (!form.muestraMetros || !Number.isFinite(metros) || metros <= 0) {
    errors.muestraMetros = "Ingresa los metros lineales de la muestra.";
  }

  if (
    form.plantasConElote === "" ||
    !Number.isInteger(elote) ||
    elote < 0
  ) {
    errors.plantasConElote = "Ingresa cuántas plantas tienen elote.";
  } else if (Number.isInteger(plantas) && elote > plantas) {
    errors.plantasConElote =
      "No puede ser mayor que las plantas contadas.";
  }

  if (!DICTAMEN_MAP[form.dictamen]) {
    errors.dictamen = "Selecciona un dictamen de calidad.";
  }

  if (!form.ubicacion) {
    errors.ubicacion = "Marca la ubicación del predio en el mapa.";
  } else if (
    !isValidCoordinate(form.ubicacion.lat, -90, 90) ||
    !isValidCoordinate(form.ubicacion.lng, -180, 180)
  ) {
    errors.ubicacion = "Las coordenadas del predio no son válidas.";
  }

  return errors;
}

/**
 * Convierte el formulario validado en el registro que se persiste.
 *
 * @param {PredioForm} form - Estado del formulario.
 * @returns {Record<string, unknown>} Datos normalizados (números y textos limpios).
 */
export function toPayload(form) {
  return {
    cultivo: CULTIVO_ACTIVO,
    nombre: form.nombre.trim(),
    telefono: form.telefono.trim(),
    predio: form.predio.trim(),
    hectareas: Number(form.hectareas),
    localidad: form.localidad.trim(),
    zona: form.zona,
    variedad: form.variedad,
    regimenHidrico: form.regimenHidrico,
    paqueteTecnologico: form.paqueteTecnologico,
    observaciones: form.observaciones.trim(),
    fechaSiembra: form.fechaSiembra,
    fechaCorte: form.fechaCorte,
    muestraPlantas: Number(form.muestraPlantas),
    muestraMetros: Number(form.muestraMetros),
    plantasConElote: Number(form.plantasConElote),
    dictamen: form.dictamen,
    logistica: "camiones",
    notas: form.notas.trim(),
    ubicacion: form.ubicacion
      ? {
          lat: form.ubicacion.lat,
          lng: form.ubicacion.lng,
          referencia: form.referencia.trim(),
        }
      : null,
  };
}

/**
 * Calcula los indicadores de la muestra mientras el usuario captura.
 *
 * @param {PredioForm} form - Estado del formulario.
 * @returns {{density: number|null, elotePct: number|null}} Densidad y porcentaje,
 * o `null` cuando aún no hay datos suficientes.
 */
export function calculateSample(form) {
  const plantas = Number(form.muestraPlantas);
  const metros = Number(form.muestraMetros);
  const elote = Number(form.plantasConElote);
  const hasDensity = plantas > 0 && metros > 0;
  const hasElote =
    plantas > 0 && form.plantasConElote !== "" && Number.isFinite(elote);

  return {
    density: hasDensity ? plantas / metros : null,
    elotePct: hasElote ? (elote / plantas) * 100 : null,
  };
}
