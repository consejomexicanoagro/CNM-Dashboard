import { DICTAMENES } from "../../data/constants";
import { formatNumber } from "../../utils/metrics";

/**
 * Tabla del ranking de calidad de productores.
 *
 * @param {Object} props - Propiedades del ranking.
 * @param {Array<Record<string, any>>} props.productores - Ranking ya ordenado.
 * @param {(nombre: string) => void} [props.onSelect] - Filtra por productor.
 * @param {number} [props.limit] - Máximo de filas a mostrar.
 * @returns {React.JSX.Element} Tabla del ranking.
 */
export default function RankingTable({ productores, onSelect, limit }) {
  const filas =
    typeof limit === "number" ? productores.slice(0, limit) : productores;

  if (!filas.length) {
    return <p className="ranking-empty">Sin productores para este filtro.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table ranking-table">
        <caption className="sr-only">
          Ranking de productores por puntaje de calidad
        </caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Productor</th>
            <th scope="col">Predios</th>
            <th scope="col">Superficie</th>
            <th scope="col">Calidad</th>
            <th scope="col">Elote</th>
            <th scope="col">Puntaje</th>
            <th scope="col">Semáforo</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((productor) => (
            <tr key={productor.nombre}>
              <td>
                <span
                  className={`rank-badge${
                    productor.posicion <= 3 ? " is-top" : ""
                  }`}
                >
                  {productor.posicion}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  className="producer-link"
                  onClick={() => onSelect?.(productor.nombre)}
                  title={`Filtrar por ${productor.nombre}`}
                >
                  {productor.nombre}
                </button>
              </td>
              <td className="num" data-label="Predios">
                {productor.predios}
              </td>
              <td className="num" data-label="Superficie">
                {formatNumber(productor.hectareas)} ha
              </td>
              <td data-label="Calidad">
                <div className="rank-quality">
                  {DICTAMENES.filter(
                    (dictamen) => productor.calidad[dictamen.id] > 0,
                  ).map((dictamen) => (
                    <span
                      key={dictamen.id}
                      className={`badge badge-${dictamen.id} plain`}
                      title={dictamen.nombre}
                    >
                      {dictamen.corto} · {productor.calidad[dictamen.id]}
                    </span>
                  ))}
                </div>
              </td>
              <td className="num" data-label="Elote">
                {formatNumber(productor.elotePct, 1)}%
              </td>
              <td className="num" data-label="Puntaje">
                <strong>{formatNumber(productor.puntaje, 1)}</strong>
              </td>
              <td data-label="Semáforo">
                <span
                  className="semaforo-pill"
                  style={{
                    "--s-color": productor.semaforo.color,
                    "--s-soft": productor.semaforo.suave,
                  }}
                >
                  <span className="semaforo-dot" aria-hidden="true" />
                  {productor.semaforo.nombre}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
