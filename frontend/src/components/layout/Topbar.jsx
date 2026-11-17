/**
 * Barra superior con la ruta actual y el contexto del usuario.
 *
 * @param {Object} props - Propiedades de la barra.
 * @param {string} props.currentLabel - Nombre de la página activa.
 * @returns {React.JSX.Element} Barra superior.
 */
export default function Topbar({ currentLabel }) {
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
