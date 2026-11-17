import Icon from "../ui/Icon";
import { CULTIVOS } from "../../data/constants";

/** Cultivos aún no habilitados, calculados una sola vez. */
const CULTIVOS_PENDIENTES = CULTIVOS.filter(
  (cultivo) => cultivo.estado !== "activo",
);

/**
 * Navegación lateral de la aplicación.
 *
 * @param {Object} props - Propiedades de la barra lateral.
 * @param {string} props.currentPage - Página activa.
 * @param {(page: string) => void} props.onNavigate - Cambia de página.
 * @param {number} [props.siloCount=0] - Registros de la bitácora Silo.
 * @param {() => void} [props.onReset] - Abre la confirmación de restauración.
 * @returns {React.JSX.Element} Barra lateral.
 */
export default function Sidebar({
  currentPage,
  onNavigate,
  siloCount = 0,
  onReset,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Icon name="sprout" size={21} />
        </span>
        <span className="brand-text">
          <strong>CMA</strong>
          <span>Agroempresarial</span>
        </span>
      </div>

      <nav className="sidebar-nav" aria-label="Navegación principal">
        <span className="nav-label">General</span>

        <button
          type="button"
          className={`nav-item${currentPage === "dashboard" ? " active" : ""}`}
          onClick={() => onNavigate("dashboard")}
          aria-current={currentPage === "dashboard" ? "page" : undefined}
        >
          <Icon name="dashboard" size={17} />
          <span className="nav-item-text">Panel general</span>
        </button>

        <button
          type="button"
          className={`nav-item${currentPage === "bitacora" ? " active" : ""}`}
          onClick={() => onNavigate("bitacora")}
          aria-current={currentPage === "bitacora" ? "page" : undefined}
        >
          <Icon name="clipboard" size={17} />
          <span className="nav-item-text">Bitácora Silo</span>
          <span className="nav-count">{siloCount}</span>
        </button>

        <span className="nav-label">Cultivos</span>

        {CULTIVOS_PENDIENTES.map((cultivo) => (
          <button
            type="button"
            key={cultivo.id}
            className={`nav-item soon${
              currentPage === cultivo.id ? " active" : ""
            }`}
            onClick={() => onNavigate(cultivo.id)}
            aria-current={currentPage === cultivo.id ? "page" : undefined}
          >
            <Icon name={cultivo.icon} size={17} />
            <span className="nav-item-text">{cultivo.nombre}</span>
            <span className="nav-soon">Pronto</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-note">
        <div className="sidebar-note-head">
          <span className="status-dot" />
          Prototipo local
        </div>
        <p>
          Los registros se guardan en este navegador. No se envía información a
          ningún servidor.
        </p>
        <button type="button" className="sidebar-reset" onClick={onReset}>
          <Icon name="rotateCcw" size={12} />
          Restaurar datos demo
        </button>
      </div>
    </aside>
  );
}
