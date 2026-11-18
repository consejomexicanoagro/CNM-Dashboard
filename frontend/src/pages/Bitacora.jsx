import { useMemo, useState } from "react";
import { usePredios } from "../store/prediosContext";
import { useToast } from "../store/toastContext";
import { DICTAMENES, TRANSPORTE_LABEL } from "../data/constants";
import {
  REGIMEN_MAP,
  VARIEDAD_MAP,
  ZONA_MAP,
  ZONAS,
} from "../data/catalogos";
import { formatDate, todayISO } from "../utils/dates";
import {
  formatNumber,
  initials,
  predioDensidad,
  predioElotePct,
} from "../utils/metrics";
import { detallePredio, PAQUETE_LABEL } from "../utils/analytics";
import { downloadCsv } from "../utils/csv";
import Icon from "../components/ui/Icon";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import PredioDrawer from "../components/bitacora/PredioDrawer";

/**
 * Botones de acción de una fila o tarjeta de la bitácora.
 *
 * @param {Object} props - Propiedades de las acciones.
 * @param {Record<string, any>} props.predio - Predio de la fila.
 * @param {(predio: Record<string, any>) => void} props.onView - Abre la ficha.
 * @param {(predio: Record<string, any>) => void} props.onEdit - Edita el predio.
 * @param {(predio: Record<string, any>) => void} props.onDelete - Pide confirmación para eliminar.
 * @returns {React.JSX.Element} Grupo de botones.
 */
function RowActions({ predio, onView, onEdit, onDelete }) {
  return (
    <div
      className="cell-actions"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        onClick={() => onView(predio)}
        aria-label={`Ver ficha de ${predio.predio}`}
        title="Ver ficha"
      >
        <Icon name="externalLink" size={14} />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        onClick={() => onEdit(predio)}
        aria-label={`Editar ${predio.predio}`}
        title="Editar"
      >
        <Icon name="pencil" size={14} />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-icon btn-danger-text"
        onClick={() => onDelete(predio)}
        aria-label={`Eliminar ${predio.predio}`}
        title="Eliminar"
      >
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

/**
 * Bitácora de predios: búsqueda, filtros, tabla, tarjetas, exportación y ficha.
 *
 * @param {Object} props - Propiedades de la página.
 * @param {() => void} props.onCreate - Abre el formulario de alta.
 * @param {(predio: Record<string, any>) => void} props.onEdit - Abre el formulario de edición.
 * @param {{id: string, at: number}|null} [props.focusRequest] - Solicitud para abrir una ficha concreta.
 * @returns {React.JSX.Element} Página de bitácora.
 */
export default function Bitacora({ onCreate, onEdit, focusRequest }) {
  const { predios, deletePredio } = usePredios();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [calidad, setCalidad] = useState("todas");
  const [productor, setProductor] = useState("todos");
  const [zona, setZona] = useState("todas");
  const [selectedId, setSelectedId] = useState(
    () => focusRequest?.id || null,
  );
  const [lastFocusRequest, setLastFocusRequest] = useState(focusRequest);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Ajuste de estado durante el render (patrón recomendado por React) para
  // abrir una ficha si llega una nueva solicitud con la página ya montada.
  if (focusRequest !== lastFocusRequest) {
    setLastFocusRequest(focusRequest);

    if (focusRequest?.id) setSelectedId(focusRequest.id);
  }

  const productores = useMemo(
    () =>
      [...new Set(predios.map((predio) => predio.nombre).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, "es"),
      ),
    [predios],
  );

  const scope = useMemo(
    () =>
      productor === "todos"
        ? predios
        : predios.filter((predio) => predio.nombre === productor),
    [predios, productor],
  );

  const calidadCounts = useMemo(
    () =>
      Object.fromEntries(
        DICTAMENES.map((dictamen) => [
          dictamen.id,
          scope.filter((predio) => predio.dictamen === dictamen.id).length,
        ]),
      ),
    [scope],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return predios
      .filter((predio) => {
        if (calidad !== "todas" && predio.dictamen !== calidad) return false;
        if (productor !== "todos" && predio.nombre !== productor) return false;
        if (
          zona !== "todas" &&
          (zona === "sin-zona" ? predio.zona : predio.zona !== zona)
        ) {
          return false;
        }
        if (!term) return true;

        return [
          predio.nombre,
          predio.predio,
          predio.telefono,
          predio.localidad,
          VARIEDAD_MAP[predio.variedad]?.nombre,
          ZONA_MAP[predio.zona]?.nombre,
          predio.ubicacion?.referencia,
          predio.dictamen,
        ].some((value) => String(value || "").toLowerCase().includes(term));
      })
      .sort((a, b) =>
        String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
      );
  }, [predios, query, calidad, productor, zona]);

  const totals = useMemo(
    () => ({
      hectareas: filtered.reduce(
        (sum, predio) => sum + (Number(predio.hectareas) || 0),
        0,
      ),
      premium: filtered.filter((predio) => predio.dictamen === "CP-1").length,
      conPaquete: filtered.filter(
        (predio) => predio.paqueteTecnologico === "si",
      ).length,
    }),
    [filtered],
  );

  const selected = useMemo(
    () => predios.find((predio) => predio.id === selectedId) || null,
    [predios, selectedId],
  );

  const hasFilters =
    query.trim() !== "" ||
    calidad !== "todas" ||
    productor !== "todos" ||
    zona !== "todas";

  /**
   * Restablece la búsqueda y todos los filtros.
   *
   * @returns {void}
   */
  const clearFilters = () => {
    setQuery("");
    setCalidad("todas");
    setProductor("todos");
    setZona("todas");
  };

  /**
   * Abre la ficha de un predio mediante teclado.
   *
   * @param {React.KeyboardEvent} event - Evento de teclado.
   * @param {Record<string, any>} predio - Predio enfocado.
   * @returns {void}
   */
  const handleOpenKeyDown = (event, predio) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    setSelectedId(predio.id);
  };

  /**
   * Exporta los registros filtrados a un archivo CSV.
   *
   * @returns {void}
   */
  const handleExport = () => {
    if (!filtered.length) {
      toast.info("No hay registros para exportar con los filtros actuales.");
      return;
    }

    const headers = [
      "Productor",
      "Teléfono",
      "Predio",
      "Localidad",
      "Zona",
      "Hectáreas",
      "Variedad",
      "Régimen hídrico",
      "Paquete tecnológico",
      "Fecha de siembra",
      "Fecha de corte",
      "Plantas contadas",
      "Metros lineales",
      "Plantas con elote",
      "Densidad (plantas/m)",
      "% con elote",
      "Puntaje de calidad",
      "Semáforo",
      "Dictamen",
      "Logística",
      "Latitud",
      "Longitud",
      "Referencia",
      "Observaciones",
      "Notas",
    ];

    const rows = filtered.map((predio) => {
      const detalle = detallePredio(predio);

      return [
        predio.nombre,
        predio.telefono,
        predio.predio,
        predio.localidad,
        ZONA_MAP[predio.zona]?.nombre || "Sin zona",
        predio.hectareas,
        VARIEDAD_MAP[predio.variedad]?.nombre || "",
        REGIMEN_MAP[predio.regimenHidrico]?.nombre || "",
        PAQUETE_LABEL[predio.paqueteTecnologico] || "",
        predio.fechaSiembra,
        predio.fechaCorte,
        predio.muestraPlantas,
        predio.muestraMetros,
        predio.plantasConElote,
        predioDensidad(predio).toFixed(2),
        predioElotePct(predio).toFixed(1),
        detalle.puntaje.toFixed(1),
        detalle.semaforo.nombre,
        predio.dictamen,
        TRANSPORTE_LABEL,
        predio.ubicacion?.lat,
        predio.ubicacion?.lng,
        predio.ubicacion?.referencia,
        predio.observaciones,
        predio.notas,
      ];
    });

    downloadCsv(`bitacora-silo-${todayISO()}`, headers, rows);

    toast.success(`Se exportaron ${filtered.length} registros a CSV.`);
  };

  /**
   * Elimina el predio seleccionado para borrar.
   *
   * @returns {void}
   */
  const handleDelete = () => {
    if (!deleteTarget) return;

    deletePredio(deleteTarget.id);
    toast.success(`Se eliminó "${deleteTarget.predio}" de la bitácora.`);

    if (selectedId === deleteTarget.id) setSelectedId(null);

    setDeleteTarget(null);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Campaña {new Date().getFullYear()}</span>
          <h1>Bitácora Silo</h1>
          <p className="page-sub">
            Dictaminación de predios de maíz para ensilaje. Captura, consulta y
            edita los indicadores de cada productor.
          </p>
        </div>

        <div className="page-actions">
          <button type="button" className="btn btn-ghost" onClick={handleExport}>
            <Icon name="download" size={15} />
            Exportar CSV
          </button>
          <button type="button" className="btn btn-primary" onClick={onCreate}>
            <Icon name="plus" size={16} />
            Nueva dictaminación
          </button>
        </div>
      </div>

      <div className="bitacora-summary">
        <span className="summary-pill">
          <Icon name="clipboard" size={14} />
          <strong>{filtered.length}</strong> registros
        </span>
        <span className="summary-pill">
          <Icon name="ruler" size={14} />
          <strong>{formatNumber(totals.hectareas)}</strong> ha
        </span>
        <span className="summary-pill">
          <Icon name="sparkles" size={14} />
          <strong>{totals.premium}</strong> con dictamen CP-1
        </span>
        <span className="summary-pill">
          <Icon name="package" size={14} />
          <strong>{totals.conPaquete}</strong> con paquete tecnológico
        </span>
        <span className="summary-pill">
          <Icon name="truck" size={14} />
          {TRANSPORTE_LABEL}
        </span>
      </div>

      <section className="card bitacora-card">
        <div className="bitacora-toolbar">
          <div className="input-group toolbar-search">
            <Icon name="search" size={15} />
            <input
              className="input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar productor, predio, teléfono…"
              aria-label="Buscar en la bitácora"
            />
          </div>

          <select
            className="select toolbar-select"
            value={productor}
            onChange={(event) => setProductor(event.target.value)}
            aria-label="Filtrar por productor"
          >
            <option value="todos">Todos los productores</option>
            {productores.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>

          <select
            className="select toolbar-select"
            value={zona}
            onChange={(event) => setZona(event.target.value)}
            aria-label="Filtrar por zona"
          >
            <option value="todas">Todas las zonas</option>
            {ZONAS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre} · {item.rango}
              </option>
            ))}
            {predios.some((predio) => !predio.zona) ? (
              <option value="sin-zona">Sin zona</option>
            ) : null}
          </select>

          <div className="bitacora-filters">
            <button
              type="button"
              className={`chip${calidad === "todas" ? " active" : ""}`}
              onClick={() => setCalidad("todas")}
            >
              Todos
              <span className="chip-count">{scope.length}</span>
            </button>
            {DICTAMENES.map((dictamen) => (
              <button
                key={dictamen.id}
                type="button"
                className={`chip${
                  calidad === dictamen.id ? " active" : ""
                }`}
                onClick={() => setCalidad(dictamen.id)}
              >
                {dictamen.corto}
                <span className="chip-count">
                  {calidadCounts[dictamen.id] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="toolbar-spacer" />

          <span className="toolbar-count">
            <strong>{filtered.length}</strong> de {predios.length} registros
          </span>
        </div>

        {filtered.length ? (
          <>
            <div className="table-wrap bitacora-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Productor</th>
                    <th scope="col">Predio</th>
                    <th scope="col">Superficie</th>
                    <th scope="col">Siembra / corte</th>
                    <th scope="col">Muestreo</th>
                    <th scope="col">Manejo</th>
                    <th scope="col">Calidad</th>
                    <th scope="col" aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((predio) => {
                    const density = predioDensidad(predio);
                    const elotePct = predioElotePct(predio);
                    const detalle = detallePredio(predio);

                    return (
                      <tr
                        key={predio.id}
                        onClick={() => setSelectedId(predio.id)}
                        onKeyDown={(event) =>
                          handleOpenKeyDown(event, predio)
                        }
                        tabIndex={0}
                        aria-label={`Ver ficha de ${predio.predio}`}
                      >
                        <td>
                          <div className="cell-main">
                            <span className="producer-avatar">
                              {initials(predio.nombre)}
                            </span>
                            <span className="cell-stack">
                              <strong>{predio.nombre}</strong>
                              <span>{predio.telefono}</span>
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <strong>{predio.predio}</strong>
                            <span
                              title={predio.ubicacion?.referencia}
                            >
                              {predio.localidad || "Sin localidad"} ·{" "}
                              {ZONA_MAP[predio.zona]?.nombre || "Sin zona"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="cell-strong num">
                            {formatNumber(predio.hectareas)} ha
                          </span>
                        </td>
                        <td>
                          <div className="cell-dates">
                            <span>Siembra {formatDate(predio.fechaSiembra)}</span>
                            <span>Corte {formatDate(predio.fechaCorte)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <strong>{formatNumber(density, 1)} plantas/m</strong>
                            <span>{formatNumber(elotePct, 0)}% con elote</span>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <strong>
                              {VARIEDAD_MAP[predio.variedad]?.nombre ||
                                "Sin variedad"}
                            </strong>
                            <span>
                              {REGIMEN_MAP[predio.regimenHidrico]?.nombre ||
                                "Sin régimen"}{" "}
                              ·{" "}
                              {predio.paqueteTecnologico === "si"
                                ? "Con paquete"
                                : "Sin paquete"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="cell-stack">
                            <span className={`badge badge-${predio.dictamen}`}>
                              {predio.dictamen}
                            </span>
                            <span>{formatNumber(detalle.puntaje, 1)} pts</span>
                          </div>
                        </td>
                        <td>
                          <RowActions
                            predio={predio}
                            onView={(item) => setSelectedId(item.id)}
                            onEdit={onEdit}
                            onDelete={setDeleteTarget}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="record-grid">
              {filtered.map((predio) => {
                const density = predioDensidad(predio);
                const elotePct = predioElotePct(predio);

                return (
                  <article
                    className="record-card"
                    key={predio.id}
                    onClick={() => setSelectedId(predio.id)}
                  >
                    <div className="record-card-top">
                      <div className="cell-main">
                        <span className="producer-avatar">
                          {initials(predio.nombre)}
                        </span>
                        <span className="cell-stack">
                          <strong>{predio.nombre}</strong>
                          <span>{predio.telefono}</span>
                        </span>
                      </div>
                      <span className={`badge badge-${predio.dictamen}`}>
                        {predio.dictamen}
                      </span>
                    </div>

                    <div className="record-card-predio">
                      <strong>{predio.predio}</strong>
                      <span>
                        {predio.localidad || "Sin localidad"} ·{" "}
                        {ZONA_MAP[predio.zona]?.nombre || "Sin zona"}
                      </span>
                    </div>

                    <div className="record-card-stats">
                      <div>
                        <span>Superficie</span>
                        <strong>{formatNumber(predio.hectareas)} ha</strong>
                      </div>
                      <div>
                        <span>Corte</span>
                        <strong>{formatDate(predio.fechaCorte)}</strong>
                      </div>
                      <div>
                        <span>Muestreo</span>
                        <strong>
                          {formatNumber(density, 1)}/m ·{" "}
                          {formatNumber(elotePct, 0)}%
                        </strong>
                      </div>
                    </div>

                    <div className="record-card-tags">
                      <span className="tag">
                        {VARIEDAD_MAP[predio.variedad]?.nombre ||
                          "Sin variedad"}
                      </span>
                      <span className="tag">
                        {REGIMEN_MAP[predio.regimenHidrico]?.nombre ||
                          "Sin régimen"}
                      </span>
                      <span
                        className={`tag${
                          predio.paqueteTecnologico === "si" ? " is-on" : ""
                        }`}
                      >
                        {predio.paqueteTecnologico === "si"
                          ? "Con paquete"
                          : "Sin paquete"}
                      </span>
                    </div>

                    <div className="record-card-foot">
                      <span>Siembra {formatDate(predio.fechaSiembra)}</span>
                      <RowActions
                        predio={predio}
                        onView={(item) => setSelectedId(item.id)}
                        onEdit={onEdit}
                        onDelete={setDeleteTarget}
                      />
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="bitacora-foot">
              <span>
                <strong>{filtered.length}</strong> registros mostrados · datos
                guardados en este navegador
              </span>
              <span>Silo · {new Date().getFullYear()}</span>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="clipboard" size={24} />
            </span>
            <h3>
              {predios.length
                ? "Sin resultados con estos filtros"
                : "Aún no hay dictaminaciones"}
            </h3>
            <p>
              {predios.length
                ? "Prueba con otro término de búsqueda o limpia los filtros para ver todos los registros."
                : "Captura el primer predio para empezar a construir la bitácora y el dashboard."}
            </p>
            {hasFilters ? (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onCreate}
              >
                <Icon name="plus" size={15} />
                Nueva dictaminación
              </button>
            )}
          </div>
        )}
      </section>

      <PredioDrawer
        predio={selected}
        onClose={() => setSelectedId(null)}
        onEdit={(predio) => {
          setSelectedId(null);
          onEdit(predio);
        }}
        onDelete={(predio) => {
          setSelectedId(null);
          setDeleteTarget(predio);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar dictaminación"
        message={
          deleteTarget ? (
            <>
              Se eliminará el registro de <strong>{deleteTarget.predio}</strong>{" "}
              de <strong>{deleteTarget.nombre}</strong>. Esta acción no se puede
              deshacer.
            </>
          ) : null
        }
        confirmLabel="Sí, eliminar"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
