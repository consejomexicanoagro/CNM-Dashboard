import Icon from "../ui/Icon";
import { useTheme } from "../../store/themeContext";

/**
 * Barra superior con la ruta actual, el tema y el contexto del usuario.
 *
 * @param {Object} props - Propiedades de la barra.
 * @param {string} props.currentLabel - Nombre de la página activa.
 * @returns {React.JSX.Element} Barra superior.
 */
export default function Topbar({ currentLabel }) {
  const { isDark, toggleTheme } = useTheme();
  const themeLabel = isDark ? "Activar modo claro" : "Activar modo oscuro";

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-crumb">
          <strong>Consejo Mexicano Agroempresarial</strong>
          <span className="crumb-sep">/</span>
          <span className="crumb-current" aria-current="page">
            {currentLabel}
          </span>
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={themeLabel}
            aria-pressed={isDark}
            title={themeLabel}
          >
            <Icon name={isDark ? "sun" : "moon"} size={15} />
            <span className="theme-toggle-text">
              {isDark ? "Modo claro" : "Modo oscuro"}
            </span>
          </button>

          <span className="env-pill">
            <span className="status-dot" />
            Prototipo
          </span>

          <div className="user-chip">
            <span className="avatar" aria-hidden="true">
              PR
            </span>
            <span className="user-meta">
              <strong>Presidencia</strong>
              <small>Consejo Agroempresarial</small>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
