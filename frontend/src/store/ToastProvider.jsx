import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "../components/ui/Icon";
import { ToastContext } from "./toastContext";

/** Tiempo que permanece visible cada notificación (ms). */
const TOAST_DURATION_MS = 4000;

/** Icono asociado a cada tono de notificación. */
const TONE_ICON = {
  success: "check",
  error: "alert",
  info: "info",
};

/**
 * Genera un identificador único para una notificación.
 *
 * @returns {string} Identificador con prefijo `toast-`.
 */
function makeToastId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `toast-${globalThis.crypto.randomUUID()}`;
  }

  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * @typedef {Object} ToastItem
 * @property {string} id - Identificador único.
 * @property {string} message - Texto visible.
 * @property {"success"|"error"|"info"} tone - Tono visual.
 */

/**
 * Proveedor de notificaciones tipo toast.
 *
 * Mantiene los temporizadores en un `Map` para poder cancelarlos al cerrar una
 * notificación o desmontar el componente, evitando actualizaciones de estado
 * sobre componentes ya desmontados.
 *
 * @param {{children: React.ReactNode}} props - Componentes hijos.
 * @returns {React.JSX.Element} Proveedor y pila de notificaciones.
 */
export default function ToastProvider({ children }) {
  /** @type {[ToastItem[], React.Dispatch<React.SetStateAction<ToastItem[]>>]} */
  const [toasts, setToasts] = useState([]);
  /** @type {React.MutableRefObject<Map<string, number>>} */
  const timers = useRef(new Map());

  /**
   * Cierra una notificación y cancela su temporizador.
   *
   * @param {string} id - Identificador de la notificación.
   * @returns {void}
   */
  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    const timer = timers.current.get(id);

    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  /**
   * Muestra una notificación con cierre automático.
   *
   * @param {string} message - Texto a mostrar.
   * @param {"success"|"error"|"info"} [tone="success"] - Tono visual.
   * @returns {void}
   */
  const push = useCallback(
    (message, tone = "success") => {
      const id = makeToastId();

      setToasts((prev) => [...prev, { id, message, tone }]);

      const timer = window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  /** @param {string} message - Texto a mostrar. */
  const success = useCallback((message) => push(message, "success"), [push]);
  /** @param {string} message - Texto a mostrar. */
  const error = useCallback((message) => push(message, "error"), [push]);
  /** @param {string} message - Texto a mostrar. */
  const info = useCallback((message) => push(message, "info"), [push]);

  useEffect(() => {
    const pendingTimers = timers.current;

    return () => {
      pendingTimers.forEach((timer) => window.clearTimeout(timer));
      pendingTimers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ push, success, error, info }),
    [push, success, error, info],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast tone-${toast.tone}`}>
            <Icon name={TONE_ICON[toast.tone] || "info"} size={16} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
