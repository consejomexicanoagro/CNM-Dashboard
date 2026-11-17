import { useMemo, useState } from "react";
import Modal from "../ui/Modal";
import Icon from "../ui/Icon";
import { LocationPicker } from "../map/PredioMap";
import { usePredios } from "../../store/prediosContext";
import { useToast } from "../../store/toastContext";
import {
  DIAS_CORTE,
  DICTAMENES,
  LOGISTICA_DESTACADOS,
  LOGISTICA_SUELO_TIPS,
  TRANSPORTE_LABEL,
} from "../../data/constants";
import { addDaysISO } from "../../utils/dates";
import { formatNumber } from "../../utils/metrics";
import {
  calculateSample,
  emptyForm,
  toForm,
  toPayload,
  validate,
} from "./formModel";

/**
 * Mensaje de error asociado a un campo del formulario.
 *
 * @param {Object} props - Propiedades del mensaje.
 * @param {string} props.id - Identificador para `aria-describedby`.
 * @param {string} [props.message] - Texto del error; si falta no se renderiza.
 * @returns {React.JSX.Element|null} Mensaje de error o `null`.
 */
function FieldError({ id, message }) {
  if (!message) return null;

  return (
    <span className="field-error" id={id} role="alert">
      {message}
    </span>
  );
}

/**
 * Modal de alta y edición de dictaminaciones.
 *
 * @param {Object} props - Propiedades del formulario.
 * @param {Record<string, any>|null} [props.predio] - Predio a editar; `null` crea uno nuevo.
 * @param {() => void} props.onClose - Cierra el modal.
 * @returns {React.JSX.Element} Formulario dentro de un modal.
 */
export default function BitacoraForm({ predio, onClose }) {
  const { addPredio, updatePredio } = usePredios();
  const toast = useToast();
  const [form, setForm] = useState(() =>
    predio ? toForm(predio) : emptyForm(),
  );
  /** @type {[Partial<Record<string, string>>, Function]} */
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(predio);

  /**
   * Actualiza un campo y limpia su error asociado.
   *
   * @param {string} key - Nombre del campo.
   * @param {unknown} value - Nuevo valor.
   * @returns {void}
   */
  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;

      const next = { ...prev };
      delete next[key];

      return next;
    });
  };

  /**
   * Actualiza la siembra y recalcula automáticamente la fecha de corte.
   *
   * @param {string} value - Fecha ISO de siembra.
   * @returns {void}
   */
  const handleSiembra = (value) => {
    setForm((prev) => ({
      ...prev,
      fechaSiembra: value,
      fechaCorte: value ? addDaysISO(value, DIAS_CORTE) : "",
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.fechaSiembra;
      delete next.fechaCorte;

      return next;
    });
  };

  /**
   * Vuelve a calcular la fecha de corte a partir de la siembra.
   *
   * @returns {void}
   */
  const recalcCorte = () => {
    if (!form.fechaSiembra) return;

    update("fechaCorte", addDaysISO(form.fechaSiembra, DIAS_CORTE));
  };

  const sample = useMemo(() => calculateSample(form), [form]);

  /**
   * Valida, normaliza y guarda la dictaminación.
   *
   * @param {React.FormEvent<HTMLFormElement>} event - Evento de envío.
   * @returns {void}
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Revisa los campos marcados en rojo.");
      return;
    }

    const payload = toPayload(form);

    if (isEditing && predio) {
      updatePredio(predio.id, payload);
      toast.success("Dictaminación actualizada correctamente.");
    } else {
      addPredio(payload);
      toast.success("Dictaminación guardada en la bitácora.");
    }

    onClose();
  };

  const footer = (
    <>
      <span className="modal-foot-note">
        <Icon name="database" size={13} />
        Se guarda localmente en este navegador
      </span>
      <div className="modal-foot-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="submit"
          form="predio-form"
          className="btn btn-primary"
        >
          <Icon name="check" size={15} />
          {isEditing ? "Guardar cambios" : "Guardar dictaminación"}
        </button>
      </div>
    </>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={isEditing ? "Editar dictaminación" : "Nueva dictaminación"}
      subtitle={
        isEditing
          ? `Actualiza los indicadores de ${predio?.predio}.`
          : "Captura los indicadores del predio para el módulo Silo."
      }
      footer={footer}
    >
      <form id="predio-form" onSubmit={handleSubmit} noValidate>
        <section className="form-section">
          <div className="form-section-head">
            <span className="step-num">1</span>
            <div>
              <h3>Productor y predio</h3>
              <p>Datos de contacto e identificación del rancho.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="field-nombre">
                Nombre del productor <span className="req">*</span>
              </label>
              <input
                id="field-nombre"
                className={`input${errors.nombre ? " invalid" : ""}`}
                value={form.nombre}
                onChange={(event) => update("nombre", event.target.value)}
                placeholder="Ej. José Luis Ramírez"
                autoComplete="name"
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={
                  errors.nombre ? "error-nombre" : undefined
                }
                data-autofocus
              />
              <FieldError id="error-nombre" message={errors.nombre} />
            </div>

            <div className="field">
              <label htmlFor="field-telefono">
                Teléfono <span className="req">*</span>
              </label>
              <div className="input-group">
                <Icon name="phone" size={14} />
                <input
                  id="field-telefono"
                  className={`input${errors.telefono ? " invalid" : ""}`}
                  value={form.telefono}
                  onChange={(event) => update("telefono", event.target.value)}
                  placeholder="33 1452 8890"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.telefono)}
                  aria-describedby={
                    errors.telefono ? "error-telefono" : undefined
                  }
                />
              </div>
              <FieldError id="error-telefono" message={errors.telefono} />
            </div>

            <div className="field span-2">
              <label htmlFor="field-predio">
                Nombre del predio <span className="req">*</span>
              </label>
              <input
                id="field-predio"
                className={`input${errors.predio ? " invalid" : ""}`}
                value={form.predio}
                onChange={(event) => update("predio", event.target.value)}
                placeholder="Ej. Rancho El Trébol"
                aria-invalid={Boolean(errors.predio)}
                aria-describedby={
                  errors.predio ? "error-predio" : undefined
                }
              />
              <FieldError id="error-predio" message={errors.predio} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-head">
            <span className="step-num">2</span>
            <div>
              <h3>Superficie y fechas</h3>
              <p>
                La fecha de corte se calcula automáticamente a {DIAS_CORTE}{" "}
                días.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="field-hectareas">
                Hectáreas sembradas <span className="req">*</span>
              </label>
              <div className="input-group has-suffix">
                <input
                  id="field-hectareas"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`input${errors.hectareas ? " invalid" : ""}`}
                  value={form.hectareas}
                  onChange={(event) => update("hectareas", event.target.value)}
                  placeholder="Ej. 32"
                  inputMode="decimal"
                  aria-invalid={Boolean(errors.hectareas)}
                  aria-describedby={
                    errors.hectareas ? "error-hectareas" : undefined
                  }
                />
                <span className="input-suffix">ha</span>
              </div>
              <FieldError id="error-hectareas" message={errors.hectareas} />
            </div>

            <div className="field">
              <label htmlFor="field-siembra">
                Fecha de siembra <span className="req">*</span>
              </label>
              <input
                id="field-siembra"
                type="date"
                className={`input${errors.fechaSiembra ? " invalid" : ""}`}
                value={form.fechaSiembra}
                onChange={(event) => handleSiembra(event.target.value)}
                aria-invalid={Boolean(errors.fechaSiembra)}
                aria-describedby={
                  errors.fechaSiembra ? "error-siembra" : undefined
                }
              />
              <FieldError id="error-siembra" message={errors.fechaSiembra} />
            </div>

            <div className="field span-2">
              <label htmlFor="field-corte">
                Posible fecha de corte <span className="req">*</span>
              </label>
              <div className="date-action-row">
                <input
                  id="field-corte"
                  type="date"
                  className={`input${errors.fechaCorte ? " invalid" : ""}`}
                  value={form.fechaCorte}
                  onChange={(event) => update("fechaCorte", event.target.value)}
                  aria-invalid={Boolean(errors.fechaCorte)}
                  aria-describedby={
                    errors.fechaCorte ? "error-corte" : undefined
                  }
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={recalcCorte}
                  disabled={!form.fechaSiembra}
                >
                  <Icon name="rotateCcw" size={13} />
                  Recalcular +{DIAS_CORTE} días
                </button>
              </div>
              <span className="field-hint">
                <Icon name="info" size={11} />
                Calculada automáticamente: siembra + {DIAS_CORTE} días. Puedes
                ajustarla manualmente si el ciclo lo requiere.
              </span>
              <FieldError id="error-corte" message={errors.fechaCorte} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-head">
            <span className="step-num">3</span>
            <div>
              <h3>Muestreo de plantas</h3>
              <p>Cuenta plantas en un tramo y registra cuántas tienen elote.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="field-plantas">
                Plantas contadas <span className="req">*</span>
              </label>
              <div className="input-group has-suffix">
                <input
                  id="field-plantas"
                  type="number"
                  min="1"
                  step="1"
                  className={`input${errors.muestraPlantas ? " invalid" : ""}`}
                  value={form.muestraPlantas}
                  onChange={(event) =>
                    update("muestraPlantas", event.target.value)
                  }
                  placeholder="Ej. 45"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.muestraPlantas)}
                  aria-describedby={
                    errors.muestraPlantas ? "error-plantas" : undefined
                  }
                />
                <span className="input-suffix">plantas</span>
              </div>
              <FieldError id="error-plantas" message={errors.muestraPlantas} />
            </div>

            <div className="field">
              <label htmlFor="field-metros">
                Metros lineales <span className="req">*</span>
              </label>
              <div className="input-group has-suffix">
                <input
                  id="field-metros"
                  type="number"
                  min="0.1"
                  step="0.1"
                  className={`input${errors.muestraMetros ? " invalid" : ""}`}
                  value={form.muestraMetros}
                  onChange={(event) =>
                    update("muestraMetros", event.target.value)
                  }
                  placeholder="Ej. 10"
                  inputMode="decimal"
                  aria-invalid={Boolean(errors.muestraMetros)}
                  aria-describedby={
                    errors.muestraMetros ? "error-metros" : undefined
                  }
                />
                <span className="input-suffix">metros</span>
              </div>
              <FieldError id="error-metros" message={errors.muestraMetros} />
            </div>

            <div className="field span-2">
              <label htmlFor="field-elote">
                Plantas con elote <span className="req">*</span>
              </label>
              <div className="input-group has-suffix">
                <input
                  id="field-elote"
                  type="number"
                  min="0"
                  step="1"
                  className={`input${
                    errors.plantasConElote ? " invalid" : ""
                  }`}
                  value={form.plantasConElote}
                  onChange={(event) =>
                    update("plantasConElote", event.target.value)
                  }
                  placeholder="Ej. 42"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.plantasConElote)}
                  aria-describedby={
                    errors.plantasConElote ? "error-elote" : undefined
                  }
                />
                <span className="input-suffix">plantas</span>
              </div>
              <FieldError id="error-elote" message={errors.plantasConElote} />
            </div>
          </div>

          <div className="sample-summary" style={{ marginTop: 14 }}>
            <div className="sample-summary-item">
              <span>Densidad</span>
              <strong>
                {sample.density != null
                  ? `${formatNumber(sample.density, 2)} plantas/m`
                  : "—"}
              </strong>
            </div>
            <div className="sample-summary-item">
              <span>Plantas con elote</span>
              <strong>
                {sample.elotePct != null
                  ? `${formatNumber(sample.elotePct, 0)}%`
                  : "—"}
              </strong>
            </div>
            <div className="sample-summary-item">
              <span>Cálculo</span>
              <strong>
                {sample.elotePct != null
                  ? "Muestra válida"
                  : "Completa el muestreo"}
              </strong>
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-head">
            <span className="step-num">4</span>
            <div>
              <h3>Dictamen de calidad</h3>
              <p>Selecciona la categoría asignada al predio.</p>
            </div>
          </div>

          <fieldset className="quality-fieldset">
            <legend className="sr-only">Dictamen de calidad</legend>
            <div className="quality-grid">
              {DICTAMENES.map((dictamen) => {
                const selected = form.dictamen === dictamen.id;

                return (
                  <label
                    key={dictamen.id}
                    className={`quality-option${selected ? " is-selected" : ""}`}
                    style={{
                      "--q-color": dictamen.color,
                      "--q-soft": dictamen.suave,
                    }}
                  >
                    <input
                      type="radio"
                      name="dictamen"
                      value={dictamen.id}
                      checked={selected}
                      onChange={() => update("dictamen", dictamen.id)}
                    />
                    <span className="q-code">{dictamen.corto}</span>
                    <span className="q-name">{dictamen.nombre}</span>
                    <span className="q-desc">{dictamen.descripcion}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <FieldError id="error-dictamen" message={errors.dictamen} />
        </section>

        <section className="form-section">
          <div className="form-section-head">
            <span className="step-num">5</span>
            <div>
              <h3>Ubicación del predio</h3>
              <p>Marca el punto del predio sobre el mapa (OpenStreetMap).</p>
            </div>
          </div>

          <LocationPicker
            value={form.ubicacion}
            onChange={(value) => update("ubicacion", value)}
            height={250}
            invalid={Boolean(errors.ubicacion)}
          />
          <FieldError id="error-ubicacion" message={errors.ubicacion} />

          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="field-referencia">
              Referencia de ubicación (opcional)
            </label>
            <input
              id="field-referencia"
              className="input"
              value={form.referencia}
              onChange={(event) => update("referencia", event.target.value)}
              placeholder="Ej. Ejido La Barca, km 4, camino de terracería"
            />
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-head">
            <span className="step-num">6</span>
            <div>
              <h3>Logística y notas</h3>
              <p>
                El acarreo del módulo Silo se realiza únicamente en camión.
              </p>
            </div>
          </div>

          <div className="logistics-box">
            <div className="logistics-top">
              <span className="logistics-icon">
                <Icon name="truck" size={17} />
              </span>
              <div>
                <strong>{TRANSPORTE_LABEL}</strong>
                <small>Transporte habilitado para este predio</small>
              </div>
            </div>

            <ul className="tips-list">
              {LOGISTICA_DESTACADOS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>

            <details className="logistics-details">
              <summary>Recomendaciones según el tipo de suelo</summary>
              <ul className="tips-list">
                {LOGISTICA_SUELO_TIPS.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </details>
          </div>

          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="field-notas">Notas de acceso y acarreo</label>
            <textarea
              id="field-notas"
              className="textarea"
              value={form.notas}
              onChange={(event) => update("notas", event.target.value)}
              placeholder="Ej. Suelo arcilloso, entrada por terracería, avisar al ejido antes del corte…"
            />
          </div>
        </section>
      </form>
    </Modal>
  );
}
