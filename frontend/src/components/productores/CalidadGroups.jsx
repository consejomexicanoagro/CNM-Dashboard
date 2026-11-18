import { formatNumber } from "../../utils/metrics";

/**
 * Productores separados por dictamen de calidad.
 *
 * @param {Object} props - Propiedades del bloque.
 * @param {Array<Record<string, any>>} props.grupos - Resultado de
 * `productoresPorCalidad`.
 * @param {(nombre: string) => void} [props.onSelect] - Filtra por productor.
 * @returns {React.JSX.Element} Tres tarjetas, una por dictamen.
 */
export default function CalidadGroups({ grupos, onSelect }) {
  return (
    <div className="calidad-groups">
      {grupos.map((grupo) => (
        <article
          key={grupo.id}
          className="calidad-group"
          style={{
            "--q-color": grupo.color,
            "--q-soft": grupo.suave,
          }}
        >
          <header className="calidad-group-head">
            <span className={`badge badge-${grupo.id}`}>{grupo.corto}</span>
            <div>
              <h3>{grupo.nombre}</h3>
              <p>
                {grupo.predios}{" "}
                {grupo.predios === 1 ? "predio" : "predios"} ·{" "}
                {formatNumber(grupo.hectareas)} ha ·{" "}
                {formatNumber(grupo.elotePct, 0)}% elote
              </p>
            </div>
          </header>

          {grupo.productores.length ? (
            <ul className="calidad-producer-list">
              {grupo.productores.map((productor) => (
                <li key={productor.nombre}>
                  <button
                    type="button"
                    className="calidad-producer"
                    onClick={() => onSelect?.(productor.nombre)}
                    title={`Filtrar por ${productor.nombre}`}
                  >
                    <span className="calidad-producer-name">
                      {productor.nombre}
                    </span>
                    <span className="calidad-producer-meta">
                      {productor.predios}{" "}
                      {productor.predios === 1 ? "predio" : "predios"} ·{" "}
                      {formatNumber(productor.hectareas)} ha
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="calidad-empty">
              Ningún productor tiene predios con este dictamen.
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
