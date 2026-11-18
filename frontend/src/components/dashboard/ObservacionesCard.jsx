import Icon from "../ui/Icon";
import { formatNumber } from "../../utils/metrics";

/**
 * Panel de observaciones y adopción de paquete tecnológico.
 *
 * @param {Object} props - Propiedades del panel.
 * @param {Record<string, any>} props.resumen - Resultado de `resumenObservaciones`.
 * @param {(predio: Record<string, any>) => void} [props.onOpenPredio] - Abre la ficha.
 * @param {number} [props.limit=4] - Observaciones visibles.
 * @returns {React.JSX.Element} Resumen y listado de observaciones.
 */
export default function ObservacionesCard({
  resumen,
  onOpenPredio,
  limit = 4,
}) {
  const total = resumen.conPaquete + resumen.sinPaquete;
  const pct = total ? (resumen.conPaquete / total) * 100 : 0;

  return (
    <div className="obs-panel">
      <div className="pkg-summary">
        <div className="pkg-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="pkg-meta">
          <span>
            <strong>{resumen.conPaquete}</strong> con paquete
          </span>
          <span>
            <strong>{resumen.sinPaquete}</strong> sin paquete
          </span>
          <span>
            <strong>{formatNumber(pct, 0)}%</strong> adopción
          </span>
        </div>
      </div>

      {resumen.registros.length ? (
        <ul className="obs-list">
          {resumen.registros.slice(0, limit).map((predio) => (
            <li key={predio.id}>
              <button
                type="button"
                className="obs-item"
                onClick={() => onOpenPredio?.(predio)}
                title={`Abrir ficha de ${predio.predio}`}
              >
                <span className="obs-head">
                  <span className="obs-predio">{predio.predio}</span>
                  <span
                    className={`pkg-tag${predio.conPaquete ? " is-on" : ""}`}
                  >
                    {predio.conPaquete ? "Con paquete" : "Sin paquete"}
                  </span>
                </span>
                <span className="obs-text">{predio.observaciones}</span>
                <span className="obs-meta">
                  <Icon name="user" size={11} />
                  {predio.nombre} · {predio.zonaInfo?.nombre || "Sin zona"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="columns-empty">Sin observaciones capturadas.</p>
      )}
    </div>
  );
}
