import { useMemo, useState } from "react";
import { usePredios } from "../store/prediosContext";
import {
  DICTAMENES,
  LOGISTICA_DESTACADOS,
  TRANSPORTE_LABEL,
} from "../data/constants";
import {
  formatNumber,
  groupByProductor,
  monthlyCuts,
  summarize,
  upcomingCuts,
} from "../utils/metrics";
import { dateParts, relativeCut } from "../utils/dates";
import Icon from "../components/ui/Icon";
import KpiCard from "../components/dashboard/KpiCard";
import DonutChart from "../components/charts/DonutChart";
import BarList from "../components/charts/BarList";
import ColumnChart from "../components/charts/ColumnChart";
import PredioMap from "../components/map/PredioMap";

/**
 * Panel general con KPIs, distribución de calidad, superficie, cortes y mapa.
 *
 * @param {Object} props - Propiedades del panel.
 * @param {() => void} props.onNew - Abre el formulario de nueva dictaminación.
 * @param {() => void} [props.onOpenBitacora] - Navega a la bitácora.
 * @param {(predio: Record<string, any>) => void} [props.onOpenPredio] - Abre la ficha de un predio.
 * @returns {React.JSX.Element} Panel general.
 */
export default function Dashboard({ onNew, onOpenBitacora, onOpenPredio }) {
  const { predios } = usePredios();
  const [productor, setProductor] = useState("todos");

  const productores = useMemo(
    () =>
      [...new Set(predios.map((predio) => predio.nombre).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, "es"),
      ),
    [predios],
  );

  const filtered = useMemo(
    () =>
      productor === "todos"
        ? predios
        : predios.filter((predio) => predio.nombre === productor),
    [predios, productor],
  );

  const stats = useMemo(() => summarize(filtered), [filtered]);
  const porProductor = useMemo(() => groupByProductor(filtered), [filtered]);
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
        ? porProductor.slice(0, 8).map((row) => ({
            label: row.nombre,
            value: row.hectareas,
          }))
        : filtered
            .map((predio) => ({
              label: predio.predio,
              value: Number(predio.hectareas) || 0,
            }))
            .sort((a, b) => b.value - a.value),
    [productor, porProductor, filtered],
  );

  const eloteData = useMemo(
    () =>
      porProductor.slice(0, 8).map((row) => ({
        label: row.nombre,
        value: row.elotePct,
      })),
    [porProductor],
  );

  const year = new Date().getFullYear();
  const scopedLabel = productor === "todos" ? "todos los predios" : productor;

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
            Resumen ejecutivo de {scopedLabel}: calidad, superficie, muestreo
            de campo y cortes programados.
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
          label="Calidad premium"
          value={formatNumber(stats.premiumPct, 0)}
          suffix="%"
          sub={
            <>
              <strong>{stats.premium}</strong> de {stats.total}{" "}
              {stats.total === 1 ? "predio" : "predios"} con dictamen CP-1
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

        <section className="card col-4" style={{ animationDelay: "100ms" }}>
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

        <section className="card col-4" style={{ animationDelay: "140ms" }}>
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

        <section
          className="card col-8 map-card"
          style={{ animationDelay: "180ms" }}
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

        <section className="card col-4" style={{ animationDelay: "220ms" }}>
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

        <section className="card col-7" style={{ animationDelay: "260ms" }}>
          <div className="card-head">
            <div>
              <h2 className="card-title">Plantas con elote</h2>
              <p className="card-sub">
                Porcentaje de la muestra de campo por productor
              </p>
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
              El indicador compara las plantas con elote contra las plantas
              contadas en la muestra de cada predio. Un valor más alto sugiere
              mejor llenado y uniformidad.
            </span>
          </div>
        </section>

        <section className="card col-5" style={{ animationDelay: "300ms" }}>
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
