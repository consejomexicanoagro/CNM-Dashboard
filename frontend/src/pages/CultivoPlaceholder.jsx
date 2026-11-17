import Icon from "../components/ui/Icon";

/**
 * Contenido planeado para cada cultivo aún no habilitado.
 *
 * @type {Record<string, Array<{icon: string, titulo: string, detalle: string}>>}
 */
const PLANNED = {
  cebada: [
    {
      icon: "wheat",
      titulo: "Calidad maltera",
      detalle: "Calibre de grano, proteína y germinación.",
    },
    {
      icon: "ruler",
      titulo: "Humedad y rendimiento",
      detalle: "Registro de humedad por lote y toneladas por hectárea.",
    },
    {
      icon: "truck",
      titulo: "Logística a maltería",
      detalle: "Coordinación de camiones y destino comercial.",
    },
  ],
  "maiz-azul": [
    {
      icon: "sparkles",
      titulo: "Pigmentación",
      detalle: "Intensidad de color y uniformidad de la mazorca.",
    },
    {
      icon: "leaf",
      titulo: "Sanidad",
      detalle: "Daño de plagas, humedad y presencia de impurezas.",
    },
    {
      icon: "clipboard",
      titulo: "Dictamen de calidad",
      detalle: "Categorías propias para maíz azul y su destino.",
    },
  ],
  "maiz-blanco": [
    {
      icon: "ruler",
      titulo: "Humedad e impurezas",
      detalle: "Parámetros de recibo y limpieza del grano.",
    },
    {
      icon: "barChart",
      titulo: "Rendimiento",
      detalle: "Producción por hectárea y comparativo por productor.",
    },
    {
      icon: "truck",
      titulo: "Comercialización",
      detalle: "Destino, precio y logística de salida.",
    },
  ],
  pacas: [
    {
      icon: "package",
      titulo: "Peso y densidad",
      detalle: "Control de peso por paca y densidad del forraje.",
    },
    {
      icon: "ruler",
      titulo: "Humedad de la paca",
      detalle: "Verificación antes de almacenar para evitar hongos.",
    },
    {
      icon: "truck",
      titulo: "Acarreo y almacenaje",
      detalle: "Rutas de camión, capacidad y ubicación del almacén.",
    },
  ],
};

/**
 * Página informativa para cultivos que todavía no tienen módulo activo.
 *
 * @param {Object} props - Propiedades de la página.
 * @param {{id: string, nombre: string, descripcion: string, icon: string}} props.cultivo - Cultivo seleccionado.
 * @param {() => void} props.onGoDashboard - Vuelve al panel general.
 * @param {() => void} props.onGoSilo - Abre el módulo Silo.
 * @returns {React.JSX.Element} Página de módulo en preparación.
 */
export default function CultivoPlaceholder({
  cultivo,
  onGoDashboard,
  onGoSilo,
}) {
  const planned = PLANNED[cultivo.id] || [];

  return (
    <>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Módulo en preparación</span>
          <h1>{cultivo.nombre}</h1>
          <p className="page-sub">
            Este cultivo se integrará a la bitácora y al dashboard con sus
            propios indicadores.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onGoDashboard}
          >
            <Icon name="dashboard" size={15} />
            Ir al panel
          </button>
          <button type="button" className="btn btn-primary" onClick={onGoSilo}>
            <Icon name="sprout" size={15} />
            Ver módulo Silo
          </button>
        </div>
      </div>

      <section className="cultivo-hero">
        <div className="cultivo-hero-copy">
          <span className="cultivo-badge">
            <Icon name="clock" size={11} />
            Próximamente
          </span>
          <h2>{cultivo.nombre} todavía no está disponible</h2>
          <p>
            {cultivo.descripcion}. El Consejo ya contempla este cultivo dentro
            del prototipo, pero aún no existen predios capturados para
            habilitar su bitácora y sus gráficas.
          </p>
          <div className="cultivo-hero-actions">
            <button type="button" className="btn btn-primary" onClick={onGoSilo}>
              <Icon name="arrowRight" size={15} />
              Explorar Silo
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onGoDashboard}
            >
              Volver al panel
            </button>
          </div>
        </div>

        <div className="cultivo-art" aria-hidden="true">
          <div className="cultivo-art-orb">
            <Icon name={cultivo.icon} size={58} strokeWidth={1.3} />
          </div>
          <span className="cultivo-art-tag tag-1">
            <strong>0</strong> predios
          </span>
          <span className="cultivo-art-tag tag-2">Módulo planeado</span>
        </div>
      </section>

      <section className="cultivo-planned">
        <h3>Qué incluirá el módulo</h3>
        <p>
          La misma lógica de la bitácora de Silo, adaptada a los indicadores de{" "}
          {cultivo.nombre.toLowerCase()}.
        </p>

        <div className="planned-grid">
          {planned.map((item) => (
            <div className="planned-item" key={item.titulo}>
              <Icon name={item.icon} size={17} />
              <div>
                <strong>{item.titulo}</strong>
                <span>{item.detalle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
