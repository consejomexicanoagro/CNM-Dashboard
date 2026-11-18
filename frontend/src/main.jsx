/**
 * Punto de entrada de la aplicación.
 *
 * Los estilos globales se importan aquí para que `App` solo contenga lógica y
 * JSX, sin efectos secundarios de carga de CSS.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./App.css";
import "./styles/ui.css";
import "./styles/dashboard.css";
import "./styles/bitacora.css";
import "./styles/productores.css";
import "./styles/map.css";
import "./styles/cultivos.css";

import App from "./App.jsx";
import ThemeProvider from "./store/ThemeProvider.jsx";
import PrediosProvider from "./store/PrediosProvider.jsx";
import ToastProvider from "./store/ToastProvider.jsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'No se encontró el elemento "#root" en index.html. Revisa la plantilla de Vite.',
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <PrediosProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </PrediosProvider>
    </ThemeProvider>
  </StrictMode>,
);
