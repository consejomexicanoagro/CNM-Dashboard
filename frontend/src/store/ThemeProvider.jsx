import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./themeContext";

/** Clave de `localStorage` compartida con el script de `index.html`. */
const STORAGE_KEY = "cma.tema";

/** Valores aceptados para la preferencia de tema. */
const VALID_PREFERENCES = ["light", "dark", "system"];

/** Consulta de medios usada para seguir la preferencia del sistema. */
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Color de la barra del navegador en cada tema. */
const THEME_COLORS = { light: "#123a29", dark: "#0e1512" };

/**
 * Obtiene el tema que prefiere el sistema operativo.
 *
 * @returns {"light"|"dark"} Tema del sistema.
 */
function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";

  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/**
 * Lee la preferencia guardada en el navegador.
 *
 * @returns {"light"|"dark"|"system"} Preferencia válida o `system`.
 */
function readPreference() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    return VALID_PREFERENCES.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

/**
 * Aplica el tema al documento y sincroniza el color de la barra del navegador.
 *
 * @param {"light"|"dark"} theme - Tema resuelto.
 * @returns {void}
 */
function applyTheme(theme) {
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');

  if (meta) meta.setAttribute("content", THEME_COLORS[theme]);
}

/**
 * Proveedor del tema claro/oscuro de toda la aplicación.
 *
 * La preferencia puede ser `light`, `dark` o `system`. Cuando es `system` se
 * sigue en vivo la configuración del sistema operativo.
 *
 * @param {{children: React.ReactNode}} props - Componentes hijos.
 * @returns {React.JSX.Element} Proveedor del contexto.
 */
export default function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readPreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolvedTheme = preference === "system" ? systemTheme : preference;
  const isDark = resolvedTheme === "dark";

  // Escucha cambios del sistema para actualizar el tema resuelto.
  useEffect(() => {
    if (!window.matchMedia) return undefined;

    const media = window.matchMedia(DARK_QUERY);
    const handleChange = (event) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);

      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);

    return () => media.removeListener(handleChange);
  }, []);

  // Aplica el tema cada vez que cambia y lo persiste para la próxima visita.
  useEffect(() => {
    applyTheme(resolvedTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // El tema sigue funcionando en memoria si el almacenamiento está bloqueado.
    }
  }, [preference, resolvedTheme]);

  // Mantiene sincronizadas varias pestañas abiertas.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;

      if (VALID_PREFERENCES.includes(event.newValue)) {
        setPreference(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  /**
   * Cambia la preferencia de tema.
   *
   * @param {"light"|"dark"|"system"} theme - Nueva preferencia.
   * @returns {void}
   */
  const setTheme = useCallback((theme) => {
    if (VALID_PREFERENCES.includes(theme)) setPreference(theme);
  }, []);

  /**
   * Alterna entre claro y oscuro tomando como base el tema resuelto.
   *
   * @returns {void}
   */
  const toggleTheme = useCallback(() => {
    setPreference((current) => {
      const resolved = current === "system" ? getSystemTheme() : current;

      return resolved === "dark" ? "light" : "dark";
    });
  }, []);

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      isDark,
      setTheme,
      toggleTheme,
    }),
    [preference, resolvedTheme, isDark, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
