import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "../ui/Icon";
import PredioMap from "../map/PredioMap";
import { DICTAMEN_MAP, DIAS_CORTE } from "../../data/constants";
import { formatDate, relativeCut } from "../../utils/dates";
import {
  formatHectareas,
  formatNumber,
  predioDensidad,
  predioElotePct,
} from "../../utils/metrics";

/**
 * Ficha lateral con el detalle completo de un predio.
 *
 * @param {Object} props - Propiedades del panel.
 * @param {Record<string, any>|null} props.predio - Predio a mostrar; `null` lo oculta.
 * @param {() => void} [props.onClose] - Cierra la ficha.
 * @param {(predio: Record<string, any>) => void} [props.onEdit] - Abre la edición.
 * @param {(predio: Record<string, any>) => void} [props.onDelete] - Solicita eliminar.
 * @returns {React.JSX.Element|null} Panel renderizado o `null`.
 */
export default function PredioDrawer({ predio, onClose, onEdit, onDelete }) {
  const onCloseRef = useRef(onClose);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const isOpen = Boolean(predio);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const activeElement = document.activeElement;

    previousFocusRef.current =
      activeElement instanceof HTMLElement ? activeElement : null;

    const wasLocked = document.body.classList.contains("is-locked");
    document.body.classList.add("is-locked");

    // Difiere el foco un frame para que el mapa de Leaflet termine de montarse.
    const focusFrame = window.requestAnimationFrame(() =>
      closeButtonRef.current?.focus(),
    );

    /**
     * Cierra la ficha con la tecla `Escape`.
     *
     * @param {KeyboardEvent} event - Evento de teclado.
     * @returns {void}
     */
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.cancelAnimationFrame(focusFrame);

      if (!wasLocked) document.body.classList.remove("is-locked");

      previousFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!predio) return null;

  const dictamen = DICTAMEN_MAP[predio.dictamen];
  const density = predioDensidad(predio);
  const elotePct = predioElotePct(predio);
  const relative = relativeCut(predio.fechaCorte);

  return createPortal(
    <div className="drawer-layer">
      <div className="drawer-backdrop" onClick={onClose} />

      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="predio-drawer-title"
      >
        <header className="drawer-head">
          <div>
            <span className={`badge badge-${predio.dictamen}`}>
              {predio.dictamen} · {dictamen?.nombre || "Dictamen"}
            </span>
            <h2 id="predio-drawer-title">{predio.predio}</h2>
            <p>
              {predio.nombre} · {predio.telefono}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar ficha"
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <div className="drawer-body">
          <PredioMap predios={[predio]} height={205} interactive={false} />

          <div className="detail-grid" style={{ marginTop: 16 }}>
            <div className="detail-item">
              <span>Superficie</span>
              <strong>{formatHectareas(predio.hectareas)}</strong>
            </div>
            <div className="detail-item">
              <span>Densidad</span>
              <strong>{formatNumber(density, 2)} plantas/m</strong>
            </div>
            <div className="detail-item">
              <span>Muestreo</span>
              <strong>
                {formatNumber(predio.muestraPlantas)} en{" "}
                {formatNumber(predio.muestraMetros)} m
              </strong>
            </div>
            <div className="detail-item">
              <span>Plantas con elote</span>
              <strong>{formatNumber(elotePct, 0)}%</strong>
            </div>
            <div className="detail-item">
              <span>Siembra</span>
              <strong>{formatDate(predio.fechaSiembra)}</strong>
            </div>
            <div className="detail-item">
              <span>Corte estimado</span>
              <strong>{formatDate(predio.fechaCorte)}</strong>
            </div>
          </div>

          <div className="detail-block">
            <h3>Llenado de la muestra</h3>
            <div className="progress-line">
              <span
                style={{
                  width: `${Math.min(Math.max(elotePct, 0), 100)}%`,
                }}
              />
            </div>
            <div className="progress-meta">
              <span>
                {formatNumber(predio.plantasConElote)} de{" "}
                {formatNumber(predio.muestraPlantas)} plantas con elote
              </span>
              <strong>{formatNumber(elotePct, 1)}%</strong>
            </div>
          </div>

          <div className="detail-block">
            <h3>Estado del corte</h3>
            <div className="cut-row" style={{ padding: 0, border: 0 }}>
              <div className="cut-date">
                <strong>
                  {formatDate(predio.fechaCorte, { day: "2-digit" })}
                </strong>
                <span>
                  {formatDate(predio.fechaCorte, { month: "short" })}
                </span>
              </div>
              <div className="cut-info">
                <strong>{formatDate(predio.fechaCorte)}</strong>
                <span>Fecha estimada · siembra + {DIAS_CORTE} días</span>
              </div>
              <span
                className={`cut-days${
                  relative.tone === "urgent" ? " is-urgent" : ""
                }${relative.tone === "late" ? " is-late" : ""}`}
              >
                {relative.label}
              </span>
            </div>
          </div>

          <div className="detail-block">
            <h3>Logística</h3>
            <div className="logistics-box">
              <div className="logistics-top">
                <span className="logistics-icon">
                  <Icon name="truck" size={16} />
                </span>
                <div>
                  <strong>Solo camiones</strong>
                  <small>Transporte habilitado para este predio</small>
                </div>
              </div>
              <p className="detail-text">
                {predio.notas ||
                  "Sin notas de acceso. Confirma el tipo de suelo y el pronóstico antes de programar el acarreo."}
              </p>
            </div>
          </div>

          <div className="detail-block">
            <h3>Referencia de ubicación</h3>
            <p className="detail-text">
              {predio.ubicacion?.referencia || "Sin referencia capturada."}
            </p>
            {predio.ubicacion ? (
              <p className="detail-coords">
                {Number(predio.ubicacion.lat).toFixed(5)},{" "}
                {Number(predio.ubicacion.lng).toFixed(5)}
              </p>
            ) : null}
          </div>
        </div>

        <footer className="drawer-foot">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onEdit?.(predio)}
          >
            <Icon name="pencil" size={14} />
            Editar
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-danger-text"
            onClick={() => onDelete?.(predio)}
          >
            <Icon name="trash" size={14} />
            Eliminar
          </button>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}
