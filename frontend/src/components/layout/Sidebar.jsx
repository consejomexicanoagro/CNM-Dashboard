import { useEffect, useId, useRef, useState } from "react";
import Icon from "../ui/Icon";
import { CULTIVOS } from "../../data/constants";

/** Cultivos aún no habilitados, calculados una sola vez. */
const CULTIVOS_PENDIENTES = CULTIVOS.filter(
  (cultivo) => cultivo.estado !== "activo",
);

/** Consulta de medios a partir de la cual se usa la barra lateral completa. */
const DESKTOP_QUERY = "(min-width: 921px)";

/**
 * Navegación de la aplicación.
 *
 * En escritorio es una barra lateral fija. En pantallas angostas se convierte
 * en una barra superior con un botón que abre el menú completo, de modo que
 * nunca se necesita desplazamiento horizontal para llegar a una sección.
 *
 * @param {Object} props - Propiedades de la navegación.
 * @param {string} props.currentPage - Página activa.
 * @param {(page: string) => void} props.onNavigate - Cambia de página.
 * @param {number} [props.siloCount=0] - Registros de la bitácora Silo.
 * @param {() => void} [props.onReset] - Abre la confirmación de restauración.
 * @returns {React.JSX.Element} Barra lateral o barra superior con menú.
 */
export default function Sidebar({
  currentPage,
  onNavigate,
  siloCount = 0,
  onReset,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const navId = useId();
  const toggleRef = useRef(null);

  // Cierra el menú al navegar y evita que quede abierto en escritorio.
  const handleNavigate = (page) => {
    setIsOpen(false);
    onNavigate(page);
  };

  const handleReset = () => {
    setIsOpen(false);
    onReset?.();
  };

  // Escape cierra el menú y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      setIsOpen(false);
      toggleRef.current?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Si la ventana crece hasta el diseño de escritorio, el menú se descarta.
  useEffect(() => {
    if (!window.matchMedia) return undefined;

    const media = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event) => {
      if (event.matches) setIsOpen(false);
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);

      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);

    return () => media.removeListener(handleChange);
  }, []);

  return (
    <aside className={`sidebar${isOpen ? " is-open" : ""}`}>
      <button
        type="button"
        className="nav-backdrop"
        aria-label="Cerrar menú"
        tabIndex={-1}
        onClick={() => setIsOpen(false)}
      />

      <div className="brand">
        <span className="brand-mark">
          <Icon name="sprout" size={21} />
        </span>
        <span className="brand-text">
          <strong>CMA</strong>
          <span>Agroempresarial</span>
        </span>
      </div>

      <button
        type="button"
        ref={toggleRef}
        className="nav-toggle"
        aria-expanded={isOpen}
        aria-controls={navId}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Icon name={isOpen ? "x" : "menu"} size={17} />
        <span className="nav-toggle-text">{isOpen ? "Cerrar" : "Menú"}</span>
      </button>

      <nav id={navId} className="sidebar-nav" aria-label="Navegación principal">
        <span className="nav-label">General</span>

        <button
          type="button"
          className={`nav-item${currentPage === "dashboard" ? " active" : ""}`}
          onClick={() => handleNavigate("dashboard")}
          aria-current={currentPage === "dashboard" ? "page" : undefined}
        >
          <Icon name="dashboard" size={17} />
          <span className="nav-item-text">Panel general</span>
        </button>

        <button
          type="button"
          className={`nav-item${currentPage === "productores" ? " active" : ""}`}
          onClick={() => handleNavigate("productores")}
          aria-current={currentPage === "productores" ? "page" : undefined}
        >
          <Icon name="user" size={17} />
          <span className="nav-item-text">Productores</span>
        </button>

        <button
          type="button"
          className={`nav-item${currentPage === "bitacora" ? " active" : ""}`}
          onClick={() => handleNavigate("bitacora")}
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
            onClick={() => handleNavigate(cultivo.id)}
            aria-current={currentPage === cultivo.id ? "page" : undefined}
          >
            <Icon name={cultivo.icon} size={17} />
            <span className="nav-item-text">{cultivo.nombre}</span>
            <span className="nav-soon">Pronto</span>
          </button>
        ))}

        <div className="sidebar-note">
          <div className="sidebar-note-head">
            <span className="status-dot" />
            Prototipo local
          </div>
          <p>
            Los registros se guardan en este navegador. No se envía información
            a ningún servidor.
          </p>
          <button type="button" className="sidebar-reset" onClick={handleReset}>
            <Icon name="rotateCcw" size={12} />
            Restaurar datos demo
          </button>
        </div>
      </nav>
    </aside>
  );
}
