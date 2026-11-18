import { formatNumber } from "../../utils/metrics";
import { formatDate } from "../../utils/dates";

/**
 * Tabla de predios con sus indicadores individuales.
 *
 * Sirve para revisar el porcentaje de elote, la superficie y el puntaje de cada
 * predio sin mezclarlos en el total del productor.
 *
 * @param {Object} props - Propiedades de la tabla.
 * @param {Array<Record<string, any>>} props.predios - Predios enriquecidos con `detallePredio`.
 * @param {(predio: Record<string, any>) => void} [props.onOpenPredio] - Abre la ficha.
 * @returns {React.JSX.Element} Tabla de predios.
 */
export default function PredioDetailList({ predios, onOpenPredio }) {
  if (!predios.length) {
    return (
      <p className="columns-empty">Sin predios para los filtros actuales.</p>
    );
  }

  /**
   * Abre la ficha con Enter o Espacio, igual que en la bitácora.
   *
   * @param {React.KeyboardEvent} event - Evento de teclado.
   * @param {Record<string, any>} predio - Predio de la fila.
   * @returns {void}
   */
  const handleKeyDown = (event, predio) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    onOpenPredio?.(predio);
  };

  return (
    <div className="table-wrap">
      <table className="data-table predio-detail-table">
        <caption className="sr-only">
          Indicadores de calidad y muestreo por predio
        </caption>
        <thead>
          <tr>
            <th scope="col">Predio</th>
            <th scope="col">Productor</th>
            <th scope="col">Zona</th>
            <th scope="col">Superficie</th>
            <th scope="col">Siembra</th>
            <th scope="col">Elote</th>
            <th scope="col">Puntaje</th>
            <th scope="col">Semáforo</th>
          </tr>
        </thead>
        <tbody>
          {predios.map((predio) => (
            <tr
              key={predio.id}
              onClick={() => onOpenPredio?.(predio)}
              onKeyDown={(event) => handleKeyDown(event, predio)}
              tabIndex={0}
              aria-label={`Ver ficha de ${predio.predio}`}
            >
              <td>
                <div className="cell-stack">
                  <strong>{predio.predio}</strong>
                  <span>
                    {predio.variedadInfo?.nombre || "Sin variedad"} ·{" "}
                    {predio.regimenInfo?.nombre || "Sin régimen"}
                  </span>
                </div>
              </td>
              <td data-label="Productor">
                <div className="cell-stack">
                  <strong>{predio.nombre}</strong>
                  <span>
                    {predio.conPaquete ? "Con paquete" : "Sin paquete"}
                  </span>
                </div>
              </td>
              <td data-label="Zona">
                <div className="cell-stack">
                  <strong>{predio.zonaInfo?.nombre || "Sin zona"}</strong>
                  <span>{predio.localidad || "Sin localidad"}</span>
                </div>
              </td>
              <td className="num" data-label="Superficie">
                {formatNumber(predio.hectareas)} ha
              </td>
              <td data-label="Siembra">{formatDate(predio.fechaSiembra)}</td>
              <td className="num" data-label="Elote">
                <strong>{formatNumber(predio.elotePct, 1)}%</strong>
              </td>
              <td className="num" data-label="Puntaje">
                <strong>{formatNumber(predio.puntaje, 1)}</strong>
              </td>
              <td data-label="Semáforo">
                <span
                  className="semaforo-pill"
                  style={{
                    "--s-color": predio.semaforo.color,
                    "--s-soft": predio.semaforo.suave,
                  }}
                >
                  <span className="semaforo-dot" aria-hidden="true" />
                  {predio.semaforo.nombre}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
