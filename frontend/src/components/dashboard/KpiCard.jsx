import Icon from "../ui/Icon";

/**
 * Tarjeta de indicador clave (KPI) del panel general.
 *
 * @param {Object} props - Propiedades de la tarjeta.
 * @param {string} props.icon - Nombre del icono.
 * @param {"green"|"gold"|"clay"} [props.tone="green"] - Tono visual.
 * @param {string} props.label - Etiqueta del indicador.
 * @param {string|number} props.value - Valor principal ya formateado.
 * @param {string} [props.suffix] - Unidad mostrada junto al valor.
 * @param {React.ReactNode} props.sub - Texto o nodo secundario.
 * @param {number} [props.delay=0] - Retraso de la animación de entrada (ms).
 * @returns {React.JSX.Element} Tarjeta del KPI.
 */
export default function KpiCard({
  icon,
  tone = "green",
  label,
  value,
  suffix,
  sub,
  delay = 0,
}) {
  return (
    <article
      className={`kpi kpi-${tone}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="kpi-top">
        <span className="kpi-icon">
          <Icon name={icon} size={16} />
        </span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value">
        {value}
        {suffix ? <em>{suffix}</em> : null}
      </div>
      <p className="kpi-sub">{sub}</p>
    </article>
  );
}
