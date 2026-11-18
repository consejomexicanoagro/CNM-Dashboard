import { SEMAFOROS } from "../../utils/analytics";
import { formatNumber } from "../../utils/metrics";

/**
 * Tablero del semáforo de productores.
 *
 * Cada columna representa un color del semáforo y lista a los productores que
 * caen en esa categoría según su puntaje ponderado de calidad. Los nombres son
 * botones para filtrar el resto de la página.
 *
 * @param {Object} props - Propiedades del tablero.
 * @param {Array<Record<string, any>>} props.productores - Ranking de productores.
 * @param {(nombre: string) => void} [props.onSelect] - Filtra por productor.
 * @returns {React.JSX.Element} Tablero de tres columnas.
 */
export default function SemaforoBoard({ productores, onSelect }) {
  return (
    <div className="semaforo-board">
      {SEMAFOROS.map((semaforo) => {
        const lista = productores.filter(
          (productor) => productor.semaforo.id === semaforo.id,
        );

        return (
          <section
            key={semaforo.id}
            className={`semaforo-col tone-${semaforo.id}`}
            style={{
              "--s-color": semaforo.color,
              "--s-soft": semaforo.suave,
            }}
            aria-label={`Semáforo ${semaforo.nombre}`}
          >
            <header className="semaforo-col-head">
              <span className="semaforo-dot" aria-hidden="true" />
              <h3>{semaforo.nombre}</h3>
              <span className="semaforo-count">{lista.length}</span>
            </header>
            <p className="semaforo-desc">{semaforo.descripcion}</p>

            {lista.length ? (
              <ul className="semaforo-list">
                {lista.map((productor) => (
                  <li key={productor.nombre}>
                    <button
                      type="button"
                      className="semaforo-item"
                      onClick={() => onSelect?.(productor.nombre)}
                      aria-label={`Filtrar por ${productor.nombre}`}
                    >
                      <span className="semaforo-name">
                        {productor.nombre}
                      </span>
                      <span className="semaforo-meta">
                        {productor.predios}{" "}
                        {productor.predios === 1 ? "predio" : "predios"} ·{" "}
                        {formatNumber(productor.puntaje)} pts
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="semaforo-empty">Sin productores en esta categoría.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
