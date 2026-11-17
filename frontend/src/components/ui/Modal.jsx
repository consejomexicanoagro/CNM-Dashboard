import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";

/** Selector de elementos que pueden recibir foco dentro del diálogo. */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Diálogo modal accesible con portal, bloqueo de scroll, cierre con `Escape`
 * y trampa de foco.
 *
 * @param {Object} props - Propiedades del modal.
 * @param {boolean} props.open - Controla la visibilidad.
 * @param {() => void} [props.onClose] - Se ejecuta al cerrar (Escape, botón o fondo).
 * @param {React.ReactNode} props.title - Título del diálogo.
 * @param {React.ReactNode} [props.subtitle] - Texto secundario.
 * @param {React.ReactNode} props.children - Contenido del cuerpo.
 * @param {React.ReactNode} [props.footer] - Acciones del pie.
 * @param {"sm"|"lg"} [props.size="lg"] - Ancho máximo del diálogo.
 * @returns {React.JSX.Element|null} Modal renderizado o `null` si está cerrado.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "lg",
}) {
  const titleId = useId();
  const subtitleId = useId();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // Evita volver a montar los listeners cuando el padre pasa una función nueva.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const dialog = dialogRef.current;
    const activeElement = document.activeElement;

    previousFocusRef.current =
      activeElement instanceof HTMLElement ? activeElement : null;

    const wasLocked = document.body.classList.contains("is-locked");
    document.body.classList.add("is-locked");

    // Enfoca el control marcado con `data-autofocus` o, en su defecto, el
    // primer control del diálogo. Se difiere un frame para que los hijos
    // (por ejemplo, Leaflet) terminen de montarse y no roben el foco.
    const focusFrame = window.requestAnimationFrame(() => {
      const initialFocus =
        dialog?.querySelector("[data-autofocus]") ||
        dialog?.querySelector(FOCUSABLE_SELECTOR);

      if (initialFocus instanceof HTMLElement) {
        initialFocus.focus();
      } else {
        dialog?.focus();
      }
    });

    /**
     * Maneja `Escape` y mantiene el foco dentro del diálogo al tabular.
     *
     * @param {KeyboardEvent} event - Evento de teclado.
     * @returns {void}
     */
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const focusables = [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)];

      if (focusables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || current === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.cancelAnimationFrame(focusFrame);

      if (!wasLocked) document.body.classList.remove("is-locked");

      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current?.();
      }}
    >
      <div
        ref={dialogRef}
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
      >
        <header className="modal-head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle ? <p id={subtitleId}>{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={() => onCloseRef.current?.()}
            aria-label="Cerrar"
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <div className="modal-body">{children}</div>

        {footer ? <footer className="modal-foot">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
