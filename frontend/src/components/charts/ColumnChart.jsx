/**
 * @typedef {Object} ColumnChartItem
 * @property {string} key - Identificador del periodo.
 * @property {string} label - Etiqueta corta del eje X.
 * @property {string} full - Descripción completa para el tooltip.
 * @property {number} value - Cantidad del periodo.
 */

/**
 * Gráfico de columnas verticales para series mensuales.
 *
 * @param {Object} props - Propiedades del gráfico.
 * @param {ColumnChartItem[]} [props.data=[]] - Periodos a graficar.
 * @param {string} [props.highlightKey] - Clave del periodo resaltado.
 * @param {string} [props.emptyLabel] - Mensaje cuando no hay datos.
 * @returns {React.JSX.Element} Gráfico de columnas o mensaje vacío.
 */
export default function ColumnChart({
  data = [],
  highlightKey,
  emptyLabel = "Sin cortes programados",
}) {
  const total = data.reduce(
    (sum, item) => sum + (Number(item.value) || 0),
    0,
  );
  const max = Math.max(...data.map((item) => Number(item.value) || 0), 1);

  if (!data.length || total === 0) {
    return <p className="columns-empty">{emptyLabel}</p>;
  }

  return (
    <div className="columns">
      {data.map((item) => {
        const value = Number(item.value) || 0;
        const height = value ? Math.max((value / max) * 100, 8) : 0;
        const isCurrent = item.key === highlightKey;

        return (
          <div
            className={`column${isCurrent ? " is-current" : ""}`}
            key={item.key}
            title={`${item.full}: ${value} corte${value === 1 ? "" : "s"}`}
          >
            <span className="column-value">{value}</span>
            <div className="column-track">
              <span className="column-fill" style={{ height: `${height}%` }} />
            </div>
            <span className="column-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
