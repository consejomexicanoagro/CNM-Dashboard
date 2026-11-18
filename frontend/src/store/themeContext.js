import { createContext, useContext } from "react";

/**
 * @typedef {"light"|"dark"|"system"} ThemePreference
 * @typedef {"light"|"dark"} ResolvedTheme
 */

/**
 * Forma del valor expuesto por `ThemeProvider`.
 *
 * @typedef {Object} ThemeContextValue
 * @property {ThemePreference} preference - Preferencia elegida por la persona.
 * @property {ResolvedTheme} resolvedTheme - Tema realmente aplicado.
 * @property {boolean} isDark - Atajo para el tema oscuro resuelto.
 * @property {(theme: ThemePreference) => void} setTheme - Cambia la preferencia.
 * @property {() => void} toggleTheme - Alterna entre claro y oscuro.
 */

/** Contexto global de tema. Se consume mediante `useTheme`. */
export const ThemeContext = createContext(null);

/**
 * Hook de acceso al contexto de tema.
 *
 * @returns {ThemeContextValue} Preferencia, tema resuelto y acciones.
 * @throws {Error} Si se usa fuera de `<ThemeProvider>`.
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }

  return context;
}
