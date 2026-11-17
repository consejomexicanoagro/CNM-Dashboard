import { createContext, useContext } from "react";

/**
 * @typedef {"success"|"error"|"info"} ToastTone
 */

/**
 * Forma del valor expuesto por `ToastProvider`.
 *
 * @typedef {Object} ToastContextValue
 * @property {(message: string, tone?: ToastTone) => void} push - Muestra una notificación.
 * @property {(message: string) => void} success - Notificación de éxito.
 * @property {(message: string) => void} error - Notificación de error.
 * @property {(message: string) => void} info - Notificación informativa.
 */

/** Contexto global de notificaciones. Se consume mediante `useToast`. */
export const ToastContext = createContext(null);

/**
 * Hook de acceso al sistema de notificaciones.
 *
 * @returns {ToastContextValue} Acciones para mostrar toasts.
 * @throws {Error} Si se usa fuera de `<ToastProvider>`.
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }

  return context;
}
