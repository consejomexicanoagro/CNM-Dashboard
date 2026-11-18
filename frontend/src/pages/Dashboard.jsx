import { useMemo, useState } from "react";
import { usePredios } from "../store/prediosContext";
import {
  DICTAMENES,
  LOGISTICA_DESTACADOS,
  TRANSPORTE_LABEL,
} from "../data/constants";
import { ZONAS } from "../data/catalogos";
import {
  formatNumber,
  monthlyCuts,
  summarize,
  upcomingCuts,
} from "../utils/metrics";
import {
  conteoSemaforo,
  detallePredio,
  puntajePromedio,
  rankProductores,
  resumenObservaciones,
  resumenZonas,
  semaforoPorPuntaje,
} from "../utils/analytics";
import { dateParts, relativeCut } from "../utils/dates";
import Icon from "../components/ui/Icon";
import KpiCard from "../components/dashboard/KpiCard";
import DonutChart from "../components/charts/DonutChart";
import BarList from "../components/charts/BarList";
import ColumnChart from "../components/charts/ColumnChart";
import PredioMap from "../components/map/PredioMap";
import ZonasCard from "../components/dashboard/ZonasCard";
import PredioDetailList from "../components/dashboard/PredioDetailList";
import ObservacionesCard from "../components/dashboard/ObservacionesCard";
import RankingTable from "../components/productores/RankingTable";
import SemaforoSummary from "../components/productores/SemaforoSummary";
import ProductorPanels from "../components/productores/ProductorPanels";

/**
 * Panel general con KPIs, calidad, zonas, muestreo por predio y cortes.
 *
 * @param {Object} props - Propiedades del panel.
 * @param {() => void} props.onNew - Abre el formulario de nueva dictaminación.
 * @param {() => void} [props.onOpenBitacora] - Navega a la bitácora.
 * @param {() => void} [props.onOpenProductores] - Navega a la página de productores.
 * @param {(predio: Record<string, any>) => void} [props.onOpenPredio] - Abre la ficha de un predio.
 * @returns {React.JSX.Element} Panel general.
 */
export default function Dashboard({
  onNew,
  onOpenBitacora,
  onOpenProductores,
  onOpenPredio,
}) {
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

  const stats = useMemo(() => summarize(filtered), [filtered]);
  const ranking = useMemo(() => rankProductores(filtered), [filtered]);
  const conteo = useMemo(() => conteoSemaforo(ranking), [ranking]);
  const zonas = useMemo(() => resumenZonas(scope), [scope]);
  const observaciones = useMemo(() => resumenObservaciones(filtered), [filtered]);
  const puntaje = useMemo(() => puntajePromedio(filtered), [filtered]);
  const semaforoGlobal = useMemo(
    () => semaforoPorPuntaje(puntaje),
    [puntaje],
  );

  const detalle = useMemo(
    () =>
      filtered
        .map(detallePredio)
        .sort(
          (a, b) => b.puntaje - a.puntaje || b.elotePct - a.elotePct,
        ),
    [filtered],
  );

  const months = useMemo(() => monthlyCuts(filtered, 6), [filtered]);
  const proximos = useMemo(() => upcomingCuts(filtered, 5), [filtered]);

  const calidadData = useMemo(
    () =>
      DICTAMENES.map((dictamen) => ({
        id: dictamen.id,
        label: dictamen.corto,
        nombre: dictamen.nombre,
        value: stats.calidad[dictamen.id] || 0,
        color: dictamen.color,
      })),
    [stats],
  );

  const superficieData = useMemo(
    () =>
      productor === "todos"
        ? ranking.slice(0, 8).map((row) => ({
            label: row.nombre,
            value: row.hectareas,
          }))
        : detalle
            .map((predio) => ({
              label: predio.predio,
              value: Number(predio.hectareas) || 0,
            }))
            .sort((a, b) => b.value - a.value),
    [productor, ranking, detalle],
  );

  const eloteData = useMemo(
    () =>
      [...detalle]
        .sort((a, b) => b.elotePct - a.elotePct)
        .slice(0, 8)
        .map((predio) => ({
          label: predio.predio,
          value: predio.elotePct,
        })),
    [detalle],
  );

  const year = new Date().getFullYear();
  const zonaEtiqueta =
    zona === "todas"
      ? null
      : zona === "sin-zona"
        ? "sin zona"
        : ZONAS.find((item) => item.id === zona)?.nombre;
  const scopedLabel = [
    productor === "todos" ? "todos los productores" : productor,
    zonaEtiqueta,
  ]
    .filter(Boolean)
    .join(" · ");

  if (predios.length === 0) {
    return (
      <>
        <div className="page-head">
          <div>
            <span className="page-eyebrow">Módulo Silo</span>
            <h1>Panel de dictaminación</h1>
            <p className="page-sub">
              Sin registros todavía. Crea la primera dictaminación para empezar
              a ver indicadores, gráficas y mapa.
            </p>
          </div>
          <div className="page-actions">
            <button type="button" className="btn btn-primary" onClick={onNew}>
              <Icon name="plus" size={16} />
              Nueva dictaminación
            </button>
          </div>
        </div>

        <section className="card">
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="clipboard" size={24} />
            </span>
            <h3>La bitácora está vacía</h3>
            <p>
              Captura un predio para generar KPIs, distribución de calidad,
              superficie, calendario de cortes y ubicación en el mapa.
            </p>
            <button type="button" className="btn btn-primary" onClick={onNew}>
              <Icon name="plus" size={16} />
              Crear primera dictaminación
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
            Campaña {year} · Módulo Silo
          </span>
          <h1>Panel de dictaminación</h1>
          <p className="page-sub">
            Resumen ejecutivo de {scopedLabel}: calidad, superficie, zonas,
            muestreo por predio y cortes programados.
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

          <button type="button" className="btn btn-primary" onClick={onNew}>
            <Icon name="plus" size={16} />
            Nueva dictaminación
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard
          icon="clipboard"
          tone="green"
          label="Predios dictaminados"
          value={formatNumber(stats.total)}
          sub={
            productor === "todos" ? (
              <>
                <strong>{stats.productores}</strong> productores registrados
              </>
            ) : (
              <>Vista individual del productor</>
            )
          }
          delay={0}
        />
        <KpiCard
          icon="ruler"
          tone="gold"
          label="Superficie dictaminada"
          value={formatNumber(stats.hectareas)}
          suffix="ha"
          sub={
            <>
              Promedio de{" "}
              <strong>{formatNumber(stats.promedioHa, 1)} ha</strong> por predio
            </>
          }
          delay={40}
        />
        <KpiCard
          icon="sprout"
          tone="green"
          label="Plantas con elote"
          value={formatNumber(stats.elotePct, 1)}
          suffix="%"
          sub={
            <>
              <strong>{formatNumber(stats.conElote)}</strong> de{" "}
              {formatNumber(stats.muestra)} plantas muestreadas
            </>
          }
          delay={80}
        />
        <KpiCard
          icon="sparkles"
          tone="clay"
          label="Puntaje de calidad"
          value={formatNumber(puntaje, 1)}
          suffix="/100"
          sub={
            <>
              Semáforo <strong>{semaforoGlobal.nombre}</strong> · 60% dictamen +
              40% elote
            </>
          }
          delay={120}
        />
      </div>

      <div className="dash-grid">
        <section className="card col-4" style={{ animationDelay: "60ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Dictamen de calidad</h2>
              <p className="card-sub">Distribución de predios dictaminados</p>
            </div>
          </div>

          <div className="donut-wrap">
            <DonutChart
              data={calidadData}
              total={stats.total}
              size={168}
              centerValue={stats.total}
              centerLabel="Predios"
            />
            <div className="donut-legend">
              {calidadData.map((item) => (
                <div className="legend-row" key={item.id}>
                  <span
                    className="legend-dot"
                    style={{ "--dot": item.color }}
                  />
                  <span className="legend-name" title={item.nombre}>
                    {item.label}
                  </span>
                  <span className="legend-value">{item.value}</span>
                  <span className="legend-pct">
                    {stats.total
                      ? `${Math.round((item.value / stats.total) * 100)}%`
                      : "0%"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card col-8" style={{ animationDelay: "100ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Zonas de acopio</h2>
              <p className="card-sub">
                Radio de 65 km desde el Rancho de Grupo Ganadero Delite,
                Oriental, Puebla
              </p>
            </div>
            <button
              type="button"
              className="card-link"
              onClick={() => onOpenProductores?.()}
            >
              Ver productores
              <Icon name="arrowRight" size={12} />
            </button>
          </div>

          <ZonasCard zonas={zonas} active={zona} onSelect={setZona} />
        </section>

        <section className="card col-4" style={{ animationDelay: "140ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">
                Superficie por{" "}
                {productor === "todos" ? "productor" : "predio"}
              </h2>
              <p className="card-sub">
                {formatNumber(stats.hectareas)} hectáreas dictaminadas
              </p>
            </div>
          </div>
          <BarList
            data={superficieData}
            formatValue={(value) => `${formatNumber(value)} ha`}
            emptyLabel="Sin superficie registrada"
          />
        </section>

        <section className="card col-4" style={{ animationDelay: "180ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Cortes programados</h2>
              <p className="card-sub">
                Próximos 6 meses · mes actual en dorado
              </p>
            </div>
          </div>
          <ColumnChart data={months} highlightKey={months[0]?.key} />
        </section>

        <section className="card col-4" style={{ animationDelay: "220ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Semáforo de productores</h2>
              <p className="card-sub">Calidad alta, media y por revisar</p>
            </div>
            <button
              type="button"
              className="card-link"
              onClick={() => onOpenProductores?.()}
            >
              Ver detalle
              <Icon name="arrowRight" size={12} />
            </button>
          </div>
          <SemaforoSummary conteo={conteo} productores={ranking} />
        </section>

        <section
          className="card col-8 map-card"
          style={{ animationDelay: "260ms" }}
        >
          <div className="card-head">
            <div>
              <h2 className="card-title">Predios dictaminados</h2>
              <p className="card-sub">
                {filtered.length} ubicaciones · haz clic en un pin para abrir la
                ficha
              </p>
            </div>
            <button
              type="button"
              className="card-link"
              onClick={() => onOpenBitacora?.()}
            >
              Ver bitácora
              <Icon name="arrowRight" size={12} />
            </button>
          </div>

          <div className="map-card-body">
            <PredioMap
              predios={filtered}
              height={336}
              onOpen={onOpenPredio}
            />
            <div className="map-legend">
              {DICTAMENES.map((dictamen) => (
                <span className="map-legend-item" key={dictamen.id}>
                  <i style={{ "--dot": dictamen.color }} />
                  {dictamen.corto}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="card col-4" style={{ animationDelay: "300ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Próximos cortes</h2>
              <p className="card-sub">Ordenados por fecha estimada</p>
            </div>
          </div>

          {proximos.length ? (
            <div className="cut-list">
              {proximos.map((predio) => {
                const parts = dateParts(predio.fechaCorte);
                const relative = relativeCut(predio.fechaCorte);

                return (
                  <div className="cut-row" key={predio.id}>
                    <div className="cut-date">
                      <strong>{parts.day}</strong>
                      <span>{parts.month}</span>
                    </div>
                    <div className="cut-info">
                      <strong>{predio.predio}</strong>
                      <span>{predio.nombre}</span>
                    </div>
                    <div className="cut-when">
                      <span
                        className={`cut-days${
                          relative.tone === "urgent" ? " is-urgent" : ""
                        }${relative.tone === "late" ? " is-late" : ""}`}
                      >
                        {relative.label}
                      </span>
                      <span className="cut-ha">
                        {formatNumber(predio.hectareas)} ha
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="columns-empty">
              No hay cortes próximos para este filtro.
            </p>
          )}
        </section>

        <section className="card col-8" style={{ animationDelay: "340ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Detalle por predio</h2>
              <p className="card-sub">
                Superficie, siembra, elote y puntaje separados en cada predio
              </p>
            </div>
            <span className="badge badge-neutral plain">
              {detalle.length} {detalle.length === 1 ? "predio" : "predios"}
            </span>
          </div>
          <PredioDetailList predios={detalle} onOpenPredio={onOpenPredio} />
        </section>

        <section className="card col-4" style={{ animationDelay: "380ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Observaciones</h2>
              <p className="card-sub">
                Paquete tecnológico y notas de campo
              </p>
            </div>
            <span className="badge badge-neutral plain">
              {observaciones.conObservaciones}
            </span>
          </div>
          <ObservacionesCard
            resumen={observaciones}
            onOpenPredio={onOpenPredio}
          />
        </section>

        <section className="card col-7" style={{ animationDelay: "420ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Ranking de calidad</h2>
              <p className="card-sub">Los cinco mejores productores del filtro</p>
            </div>
            <button
              type="button"
              className="card-link"
              onClick={() => onOpenProductores?.()}
            >
              Ver ranking completo
              <Icon name="arrowRight" size={12} />
            </button>
          </div>
          <RankingTable
            productores={ranking}
            onSelect={setProductor}
            limit={5}
          />
        </section>

        <section className="card col-5" style={{ animationDelay: "460ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Plantas con elote</h2>
              <p className="card-sub">Porcentaje de la muestra en cada predio</p>
            </div>
            <span className="badge badge-neutral plain">
              Muestra: {formatNumber(stats.densidad, 1)} plantas/m
            </span>
          </div>
          <BarList
            data={eloteData}
            maxValue={100}
            formatValue={(value) => `${formatNumber(value, 0)}%`}
            emptyLabel="Sin muestreo registrado"
          />
          <div className="sample-note">
            <Icon name="info" size={13} />
            <span>
              Cada barra es un predio. Compara el porcentaje de plantas con
              elote contra las plantas contadas en su propia muestra.
            </span>
          </div>
        </section>

        <section className="card col-12" style={{ animationDelay: "500ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Detalle por productor</h2>
              <p className="card-sub">
                Predios separados dentro de cada productor, con su propia
                superficie y muestreo
              </p>
            </div>
            <button
              type="button"
              className="card-link"
              onClick={() => onOpenProductores?.()}
            >
              Ver todos los productores
              <Icon name="arrowRight" size={12} />
            </button>
          </div>
          <ProductorPanels
            productores={ranking}
            onOpenPredio={onOpenPredio}
            limit={productor === "todos" ? 3 : undefined}
          />
        </section>

        <section className="card col-12" style={{ animationDelay: "540ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Antes de cortar</h2>
              <p className="card-sub">Buenas prácticas de acarreo y suelo</p>
            </div>
          </div>

          <div className="logistics-card">
            <div className="logistics-top">
              <span className="logistics-icon">
                <Icon name="truck" size={17} />
              </span>
              <div>
                <strong>{TRANSPORTE_LABEL}</strong>
                <small>Único transporte habilitado para el módulo Silo</small>
              </div>
            </div>
            <ul className="tips-list">
              {LOGISTICA_DESTACADOS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginTop: 14, width: "100%" }}
            onClick={onNew}
          >
            <Icon name="plus" size={14} />
            Registrar dictaminación
          </button>
        </section>
      </div>
    </>
  );
}
