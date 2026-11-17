/**
 * @typedef {Object} DonutSegment
 * @property {string} label - Etiqueta del segmento.
 * @property {number} value - Valor del segmento.
 * @property {string} color - Color del trazo.
 * @property {string} [id] - Identificador estable (por defecto usa `label`).
 */

/**
 * Gráfico de dona construido con trazos SVG.
 *
 * @param {Object} props - Propiedades del gráfico.
 * @param {DonutSegment[]} [props.data=[]] - Segmentos a dibujar.
 * @param {number} [props.total] - Total para calcular proporciones; si se omite,
 * se usa la suma de los valores.
 * @param {number} [props.size=176] - Diámetro del gráfico en píxeles.
 * @param {number} [props.stroke=18] - Grosor del trazo.
 * @param {string|number} [props.centerValue] - Valor central; por defecto el total.
 * @param {string} [props.centerLabel="Total"] - Etiqueta central.
 * @returns {React.JSX.Element} Gráfico de dona con leyenda accesible.
 */
export default function DonutChart({
  data = [],
  total,
  size = 176,
  stroke = 18,
  centerValue,
  centerLabel,
}) {
  const values = data.map((item) => Number(item.value) || 0);
  const safeTotal =
    typeof total === "number"
      ? total
      : values.reduce((sum, value) => sum + value, 0);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const activeSegments = values.filter((value) => value > 0);
  const gap = activeSegments.length > 1 ? 3 : 0;

  const segments = data
    .map((item, index) => {
      const value = values[index];

      if (!value || !safeTotal) return null;

      const previous = values
        .slice(0, index)
        .reduce((sum, current) => sum + current, 0);
      const length = (value / safeTotal) * circumference;

      return {
        key: item.id ?? item.label ?? index,
        color: item.color,
        dash: Math.max(length - gap, 0),
        offset: (previous / safeTotal) * circumference,
      };
    })
    .filter(Boolean);

  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Distribución: ${data
          .map((item) => `${item.label} ${item.value}`)
          .join(", ")}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-soft)"
          strokeWidth={stroke}
        />
        {segments.map((segment) => (
          <circle
            key={segment.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${segment.dash} ${circumference}`}
            strokeDashoffset={-segment.offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
      </svg>
      <div className="donut-center">
        <strong>{centerValue ?? safeTotal}</strong>
        <span>{centerLabel ?? "Total"}</span>
      </div>
    </div>
  );
}
