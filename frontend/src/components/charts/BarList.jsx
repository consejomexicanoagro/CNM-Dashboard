/**
 * @typedef {Object} BarListItem
 * @property {string} label - Etiqueta visible.
 * @property {number} value - Valor de la barra.
 * @property {string} [id] - Identificador estable (por defecto usa `label`).
 * @property {string} [color] - Color personalizado de la barra.
 */

/**
 * Lista horizontal de barras proporcionales.
 *
 * @param {Object} props - Propiedades del gráfico.
 * @param {BarListItem[]} [props.data=[]] - Filas a graficar.
 * @param {(value: number) => string} [props.formatValue] - Formateador del valor.
 * @param {string} [props.emptyLabel] - Mensaje cuando no hay datos.
 * @param {number} [props.maxValue] - Máximo forzado para la escala.
 * @returns {React.JSX.Element} Lista de barras o mensaje vacío.
 */
export default function BarList({
  data = [],
  formatValue = (value) => value,
  emptyLabel = "Sin datos para mostrar",
  maxValue,
}) {
  if (!data.length) {
    return <p className="columns-empty">{emptyLabel}</p>;
  }

  const max = Math.max(
    Number(maxValue) || 0,
    ...data.map((item) => Number(item.value) || 0),
    1,
  );

  return (
    <div className="barlist">
      {data.map((item, index) => {
        const value = Number(item.value) || 0;
        const width = value > 0 ? Math.max((value / max) * 100, 2) : 0;

        return (
          <div
            className="barlist-row"
            key={item.id ?? item.label ?? index}
          >
            <span className="barlist-label" title={item.label}>
              {item.label}
            </span>
            <div
              className="barlist-track"
              role="img"
              aria-label={`${item.label}: ${formatValue(value)}`}
            >
              <span
                className="barlist-fill"
                style={{
                  width: `${width}%`,
                  background: item.color
                    ? `linear-gradient(90deg, ${item.color}, color-mix(in srgb, ${item.color} 78%, transparent))`
                    : undefined,
                }}
              />
            </div>
            <span className="barlist-value">{formatValue(value)}</span>
          </div>
        );
      })}
    </div>
  );
}
