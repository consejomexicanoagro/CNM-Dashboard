import { useMemo, useState } from "react";
import { usePredios } from "../store/prediosContext";
import { ZONAS } from "../data/catalogos";
import {
  conteoSemaforo,
  productoresPorCalidad,
  puntajePromedio,
  rankProductores,
  resumenObservaciones,
  semaforoPorPuntaje,
} from "../utils/analytics";
import { formatNumber } from "../utils/metrics";
import Icon from "../components/ui/Icon";
import KpiCard from "../components/dashboard/KpiCard";
import SemaforoBoard from "../components/productores/SemaforoBoard";
import SemaforoSummary from "../components/productores/SemaforoSummary";
import RankingTable from "../components/productores/RankingTable";
import CalidadGroups from "../components/productores/CalidadGroups";
import ProductorPanels from "../components/productores/ProductorPanels";

/**
 * Página de productores: semáforo, ranking, calidad y desglose por predio.
 *
 * @param {Object} props - Propiedades de la página.
 * @param {(predio: Record<string, any>) => void} [props.onOpenPredio] - Abre la ficha de un predio.
 * @param {() => void} [props.onCreate] - Abre el formulario de alta.
 * @returns {React.JSX.Element} Página de productores.
 */
export default function Productores({ onOpenPredio, onCreate }) {
  const { predios } = usePredios();

  const [productor, setProductor] = useState("todos");
  const [zona, setZona] = useState("todas");

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

  const filtered = useMemo(
    () =>
      zona === "todas"
        ? scope
        : scope.filter((predio) =>
            zona === "sin-zona" ? !predio.zona : predio.zona === zona,
          ),
    [scope, zona],
  );

  const ranking = useMemo(() => rankProductores(filtered), [filtered]);
  const grupos = useMemo(() => productoresPorCalidad(filtered), [filtered]);
  const conteo = useMemo(() => conteoSemaforo(ranking), [ranking]);
  const promedio = useMemo(() => puntajePromedio(filtered), [filtered]);
  const semaforoGlobal = useMemo(
    () => semaforoPorPuntaje(promedio),
    [promedio],
  );
  const observaciones = useMemo(() => resumenObservaciones(filtered), [filtered]);

  const paquetePct =
    observaciones.conPaquete + observaciones.sinPaquete
      ? (observaciones.conPaquete /
          (observaciones.conPaquete + observaciones.sinPaquete)) *
        100
      : 0;

  const hasFilters = productor !== "todos" || zona !== "todas";

  /**
   * Restablece los filtros de la página.
   *
   * @returns {void}
   */
  const clearFilters = () => {
    setProductor("todos");
    setZona("todas");
  };

  if (!predios.length) {
    return (
      <>
        <div className="page-head">
          <div>
            <span className="page-eyebrow">Módulo Silo</span>
            <h1>Productores</h1>
            <p className="page-sub">
              Sin registros todavía. Captura la primera dictaminación para
              calcular el semáforo y el ranking de calidad.
            </p>
          </div>
        </div>

        <section className="card">
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="user" size={24} />
            </span>
            <h3>Aún no hay productores</h3>
            <p>
              El semáforo, el ranking y los paneles por productor se construyen
              con los predios de la bitácora.
            </p>
            <button type="button" className="btn btn-primary" onClick={onCreate}>
              <Icon name="plus" size={16} />
              Nueva dictaminación
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">
            Campaña {new Date().getFullYear()} · Módulo Silo
          </span>
          <h1>Productores</h1>
          <p className="page-sub">
            Calidad por productor y por predio. El puntaje combina 60% del
            dictamen con 40% del porcentaje de plantas con elote.
          </p>
        </div>

        <div className="page-actions">
          <div className="producer-filter">
            <Icon name="user" size={15} />
            <select
              className="select"
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
          </div>

          <div className="producer-filter">
            <Icon name="mapPin" size={15} />
            <select
              className="select"
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
          </div>

          {hasFilters ? (
            <button type="button" className="btn btn-ghost" onClick={clearFilters}>
              <Icon name="x" size={14} />
              Limpiar filtros
            </button>
          ) : null}

          <button type="button" className="btn btn-primary" onClick={onCreate}>
            <Icon name="plus" size={16} />
            Nueva dictaminación
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard
          icon="user"
          tone="green"
          label="Productores evaluados"
          value={formatNumber(ranking.length)}
          sub={
            <>
              <strong>{filtered.length}</strong>{" "}
              {filtered.length === 1 ? "predio en el filtro" : "predios en el filtro"}
            </>
          }
          delay={0}
        />
        <KpiCard
          icon="sparkles"
          tone="clay"
          label="Puntaje promedio"
          value={formatNumber(promedio, 1)}
          suffix="/100"
          sub={
            <>
              Semáforo <strong>{semaforoGlobal.nombre}</strong> · ponderado por
              superficie
            </>
          }
          delay={40}
        />
        <KpiCard
          icon="trendingUp"
          tone="green"
          label="Semáforo verde"
          value={formatNumber(conteo.verde || 0)}
          sub={
            <>
              de <strong>{ranking.length}</strong>{" "}
              {ranking.length === 1 ? "productor" : "productores"} con calidad alta
            </>
          }
          delay={80}
        />
        <KpiCard
          icon="package"
          tone="gold"
          label="Paquete tecnológico"
          value={formatNumber(paquetePct, 0)}
          suffix="%"
          sub={
            <>
              <strong>{observaciones.conPaquete}</strong> de{" "}
              {observaciones.conPaquete + observaciones.sinPaquete} predios con
              paquete
            </>
          }
          delay={120}
        />
      </div>

      <div className="dash-grid">
        <section className="card col-12" style={{ animationDelay: "60ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Semáforo de productores</h2>
              <p className="card-sub">
                Verde ≥ 80 puntos · Amarillo ≥ 60 · Rojo &lt; 60. Haz clic en un
                productor para filtrar la página.
              </p>
            </div>
          </div>
          <SemaforoBoard productores={ranking} onSelect={setProductor} />
        </section>

        <section className="card col-8" style={{ animationDelay: "100ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Ranking de calidad</h2>
              <p className="card-sub">
                Ordenado por puntaje ponderado por superficie
              </p>
            </div>
            <span className="badge badge-neutral plain">
              {ranking.length} {ranking.length === 1 ? "productor" : "productores"}
            </span>
          </div>
          <RankingTable productores={ranking} onSelect={setProductor} />
        </section>

        <section className="card col-4" style={{ animationDelay: "140ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Distribución del semáforo</h2>
              <p className="card-sub">Productores por color</p>
            </div>
          </div>
          <SemaforoSummary conteo={conteo} productores={ranking} />
        </section>

        <section className="card col-12" style={{ animationDelay: "180ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Productores separados por calidad</h2>
              <p className="card-sub">
                Cada productor aparece en los dictámenes donde tiene predios
              </p>
            </div>
          </div>
          <CalidadGroups grupos={grupos} onSelect={setProductor} />
        </section>

        <section className="card col-12" style={{ animationDelay: "220ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Predios por productor</h2>
              <p className="card-sub">
                Cada panel separa los predios del productor, sin mezclar sus
                totales
              </p>
            </div>
          </div>
          <ProductorPanels
            productores={ranking}
            onOpenPredio={onOpenPredio}
          />
        </section>
      </div>
    </>
  );
}
