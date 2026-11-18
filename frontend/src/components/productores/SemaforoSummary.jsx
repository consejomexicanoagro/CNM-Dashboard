import { SEMAFOROS } from "../../utils/analytics";

/**
 * Resumen compacto del semáforo de productores.
 *
 * @param {Object} props - Propiedades del resumen.
 * @param {Record<string, number>} props.conteo - Conteo por color.
 * @param {Array<Record<string, any>>} props.productores - Ranking de productores.
 * @returns {React.JSX.Element} Tres filas con el conteo y algunos nombres.
 */
export default function SemaforoSummary({ conteo, productores }) {
  return (
    <div className="semaforo-summary">
      {SEMAFOROS.map((semaforo) => {
        const nombres = productores
          .filter((productor) => productor.semaforo.id === semaforo.id)
          .map((productor) => productor.nombre);

        return (
          <div
            className="semaforo-summary-row"
            key={semaforo.id}
            style={{
              "--s-color": semaforo.color,
              "--s-soft": semaforo.suave,
            }}
          >
            <span className="semaforo-dot" aria-hidden="true" />
            <strong className="semaforo-summary-count">
              {conteo[semaforo.id] || 0}
            </strong>
            <span className="semaforo-summary-name">{semaforo.nombre}</span>
            <span className="semaforo-summary-list" title={nombres.join(", ")}>
              {nombres.length ? nombres.slice(0, 2).join(", ") : "Sin productores"}
              {nombres.length > 2 ? ` +${nombres.length - 2}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
