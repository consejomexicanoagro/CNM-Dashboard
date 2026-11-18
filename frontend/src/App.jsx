import { useCallback, useMemo, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import BitacoraForm from "./components/bitacora/BitacoraForm";
import ConfirmDialog from "./components/ui/ConfirmDialog";
import Dashboard from "./pages/Dashboard";
import Bitacora from "./pages/Bitacora";
import Productores from "./pages/Productores";
import CultivoPlaceholder from "./pages/CultivoPlaceholder";
import { CULTIVOS } from "./data/constants";
import { usePredios } from "./store/prediosContext";
import { useToast } from "./store/toastContext";

/**
 * Raíz de la aplicación: coordina la navegación, el formulario y los diálogos.
 *
 * La navegación es local (estado) porque el prototipo es una SPA de una sola
 * entrada; no se requiere un router para dos vistas.
 *
 * @returns {React.JSX.Element} Shell con barra lateral, topbar y contenido.
 */
export default function App() {
  const { predios, resetDemo } = usePredios();
  const toast = useToast();

  const [page, setPage] = useState("dashboard");
  const [form, setForm] = useState({ open: false, predio: null });
  const [focusRequest, setFocusRequest] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);

  /**
   * Cambia de página y vuelve al inicio del documento.
   *
   * @param {string} nextPage - Identificador de la página.
   * @returns {void}
   */
  const navigate = useCallback((nextPage) => {
    setFocusRequest(null);
    setPage(nextPage);
    window.scrollTo(0, 0);
  }, []);

  /**
   * Abre el formulario para una captura nueva.
   *
   * @returns {void}
   */
  const openCreate = useCallback(() => {
    setForm({ open: true, predio: null });
  }, []);

  /**
   * Abre el formulario para editar un predio.
   *
   * @param {Record<string, any>} predio - Predio a editar.
   * @returns {void}
   */
  const openEdit = useCallback((predio) => {
    setForm({ open: true, predio });
  }, []);

  /**
   * Cierra el formulario y limpia el predio en edición.
   *
   * @returns {void}
   */
  const closeForm = useCallback(() => {
    setForm({ open: false, predio: null });
  }, []);

  /**
   * Abre la bitácora con la ficha de un predio seleccionada.
   *
   * @param {Record<string, any>} predio - Predio a consultar.
   * @returns {void}
   */
  const openPredio = useCallback((predio) => {
    setFocusRequest({ id: predio.id, at: Date.now() });
    setPage("bitacora");
    window.scrollTo(0, 0);
  }, []);

  /**
   * Restaura los datos de demostración.
   *
   * @returns {void}
   */
  const handleReset = useCallback(() => {
    resetDemo();
    setResetOpen(false);
    setFocusRequest(null);
    toast.success("Datos demo restaurados correctamente.");
  }, [resetDemo, toast]);

  const cultivoActivo = useMemo(
    () =>
      CULTIVOS.find(
        (cultivo) => cultivo.id === page && cultivo.estado !== "activo",
      ) || null,
    [page],
  );

  const currentLabel = useMemo(() => {
    if (page === "dashboard") return "Panel general";
    if (page === "productores") return "Productores";
    if (page === "bitacora") return "Bitácora Silo";

    return cultivoActivo
      ? `Cultivo · ${cultivoActivo.nombre}`
      : "Panel general";
  }, [page, cultivoActivo]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido
      </a>

      <Sidebar
        currentPage={page}
        onNavigate={navigate}
        siloCount={predios.length}
        onReset={() => setResetOpen(true)}
      />

      <div className="app-main">
        <Topbar currentLabel={currentLabel} />

        <main
          id="contenido-principal"
          className="app-content"
          tabIndex={-1}
        >
          {page === "dashboard" ? (
            <Dashboard
              onNew={openCreate}
              onOpenBitacora={() => navigate("bitacora")}
              onOpenProductores={() => navigate("productores")}
              onOpenPredio={openPredio}
            />
          ) : null}

          {page === "productores" ? (
            <Productores
              onCreate={openCreate}
              onOpenPredio={openPredio}
            />
          ) : null}

          {page === "bitacora" ? (
            <Bitacora
              onCreate={openCreate}
              onEdit={openEdit}
              focusRequest={focusRequest}
            />
          ) : null}

          {cultivoActivo ? (
            <CultivoPlaceholder
              cultivo={cultivoActivo}
              onGoDashboard={() => navigate("dashboard")}
              onGoSilo={() => navigate("bitacora")}
            />
          ) : null}
        </main>
      </div>

      {form.open ? (
        <BitacoraForm
          key={form.predio?.id || "nuevo"}
          predio={form.predio}
          onClose={closeForm}
        />
      ) : null}

      <ConfirmDialog
        open={resetOpen}
        title="Restaurar datos demo"
        message={
          <>
            Se reemplazarán todos los registros actuales por los{" "}
            <strong>16 predios de demostración</strong>. Los cambios que hayas
            capturado se perderán. Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Sí, restaurar"
        onConfirm={handleReset}
        onClose={() => setResetOpen(false)}
      />
    </div>
  );
}
