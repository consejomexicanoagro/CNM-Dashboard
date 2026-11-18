import Icon from "../ui/Icon";
import { formatNumber } from "../../utils/metrics";
import { formatDate } from "../../utils/dates";

/**
 * Panel de un productor con sus predios separados.
 *
 * A diferencia del resumen general, cada tarjeta muestra un bloque por predio
 * con superficie, fecha de siembra, porcentaje de elote y puntaje de calidad.
 *
 * @param {Object} props - Propiedades del panel.
 * @param {Record<string, any>} props.productor - Productor del ranking.
 * @param {(predio: Record<string, any>) => void} [props.onOpenPredio] - Abre la ficha de un predio.
 * @returns {React.JSX.Element} Tarjeta del productor.
 */
function ProductorPanel({ productor, onOpenPredio }) {
  return (
    <article
      className="productor-panel"
      style={{ "--s-color": productor.semaforo.color }}
    >
      <header className="productor-head">
        <span className="rank-badge is-top">{productor.posicion}</span>

        <div className="productor-id">
          <h3>{productor.nombre}</h3>
          <p>
            {productor.predios}{" "}
            {productor.predios === 1 ? "predio" : "predios"} ·{" "}
            {formatNumber(productor.hectareas)} ha ·{" "}
            {formatNumber(productor.elotePct, 0)}% elote
          </p>
        </div>

        <div className="productor-score">
          <span className="semaforo-pill">
            <span className="semaforo-dot" aria-hidden="true" />
            {productor.semaforo.nombre}
          </span>
          <strong>{formatNumber(productor.puntaje, 1)}</strong>
          <small>puntos</small>
        </div>
      </header>

      <div className="productor-tags">
        {productor.zonas.map((zona) => (
          <span className="tag tag-zone" key={zona.id}>
            <Icon name="mapPin" size={11} />
            {zona.nombre}
          </span>
        ))}
        {productor.variedades.map((variedad) => (
          <span className="tag" key={variedad.id}>
            {variedad.nombre}
          </span>
        ))}
        <span className="tag">
          <Icon name="package" size={11} />
          {formatNumber(productor.paquetesPct, 0)}% con paquete
        </span>
      </div>

      <div className="productor-predios">
        {productor.lista.map((predio) => (
          <button
            type="button"
            className="predio-tile"
            key={predio.id}
            onClick={() => onOpenPredio?.(predio)}
            aria-label={`Abrir ficha de ${predio.predio}`}
          >
            <span className="predio-tile-top">
              <span className="predio-tile-name">{predio.predio}</span>
              <span className={`badge badge-${predio.dictamen}`}>
                {predio.dictamen}
              </span>
            </span>

            <span className="predio-tile-loc">
              <Icon name="mapPin" size={11} />
              {predio.localidad || "Sin localidad"} ·{" "}
              {predio.zonaInfo?.nombre || "Sin zona"}
            </span>

            <span className="predio-tile-stats">
              <span>
                <small>Superficie</small>
                <strong>{formatNumber(predio.hectareas)} ha</strong>
              </span>
              <span>
                <small>Elote</small>
                <strong>{formatNumber(predio.elotePct, 1)}%</strong>
              </span>
              <span>
                <small>Puntaje</small>
                <strong>{formatNumber(predio.puntaje, 1)}</strong>
              </span>
            </span>

            <span className="predio-tile-foot">
              <span>
                <Icon name="calendar" size={11} />
                Siembra {formatDate(predio.fechaSiembra)}
              </span>
              <span>
                {predio.variedadInfo?.nombre || "Sin variedad"} ·{" "}
                {predio.regimenInfo?.nombre || "Sin régimen"}
              </span>
              <span
                className={`pkg-tag${predio.conPaquete ? " is-on" : ""}`}
              >
                {predio.conPaquete ? "Con paquete" : "Sin paquete"}
              </span>
            </span>
          </button>
        ))}
      </div>
    </article>
  );
}

/**
 * Lista de paneles, uno por productor, con el desglose de sus predios.
 *
 * @param {Object} props - Propiedades de la lista.
 * @param {Array<Record<string, any>>} props.productores - Ranking de productores.
 * @param {(predio: Record<string, any>) => void} [props.onOpenPredio] - Abre una ficha.
 * @param {number} [props.limit] - Máximo de productores a mostrar.
 * @returns {React.JSX.Element} Paneles de productores.
 */
export default function ProductorPanels({
  productores,
  onOpenPredio,
  limit,
}) {
  const lista =
    typeof limit === "number" ? productores.slice(0, limit) : productores;

  if (!lista.length) {
    return (
      <p className="columns-empty">Sin productores para los filtros actuales.</p>
    );
  }

  return (
    <div className="productor-panels">
      {lista.map((productor) => (
        <ProductorPanel
          key={productor.nombre}
          productor={productor}
          onOpenPredio={onOpenPredio}
        />
      ))}
    </div>
  );
}
