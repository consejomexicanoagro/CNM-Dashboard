import { ZONA_MAP } from "../../data/catalogos";
import { formatNumber } from "../../utils/metrics";

/**
 * Resumen de predios por zona de acopio.
 *
 * Cada fila es un botón que filtra el panel por la zona seleccionada. Las
 * localidades de la zona se muestran como texto de apoyo.
 *
 * @param {Object} props - Propiedades del bloque.
 * @param {Array<Record<string, any>>} props.zonas - Resultado de `resumenZonas`.
 * @param {string} [props.active="todas"] - Zona activa (`todas`, `zona-1`…).
 * @param {(zona: string) => void} [props.onSelect] - Cambia el filtro de zona.
 * @returns {React.JSX.Element} Lista de zonas.
 */
export default function ZonasCard({ zonas, active = "todas", onSelect }) {
  return (
    <div className="zonas-list">
      {zonas.map((zona) => {
        const key = zona.id || "sin-zona";
        const activa = active === key;
        const localidades = ZONA_MAP[zona.id]?.localidades || [];

        return (
          <button
            type="button"
            key={key}
            className={`zona-row${activa ? " is-active" : ""}`}
            onClick={() => onSelect?.(activa ? "todas" : key)}
            aria-pressed={activa}
            title={localidades.length ? localidades.join(", ") : undefined}
          >
            <span
              className="zona-badge"
              style={{ "--z-color": zona.color, "--z-soft": zona.suave }}
            >
              {zona.id ? zona.nombre.replace("Zona ", "") : "—"}
            </span>

            <span className="zona-main">
              <span className="zona-top">
                <strong>{zona.nombre}</strong>
                <span>{zona.rango}</span>
              </span>
              <span className="zona-bar" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.min(Math.max(zona.pctPredios, 0), 100)}%`,
                    background: zona.color,
                  }}
                />
              </span>
              <span className="zona-meta">
                {zona.predios}{" "}
                {zona.predios === 1 ? "predio" : "predios"} ·{" "}
                {zona.productores}{" "}
                {zona.productores === 1 ? "productor" : "productores"} ·{" "}
                {formatNumber(zona.hectareas)} ha ·{" "}
                {formatNumber(zona.elotePct, 0)}% elote
              </span>
              {localidades.length ? (
                <span className="zona-localidades">
                  {localidades.join(" · ")}
                </span>
              ) : null}
            </span>

            <span className="zona-pct">
              {formatNumber(zona.pctPredios, 0)}%
            </span>
          </button>
        );
      })}
    </div>
  );
}
