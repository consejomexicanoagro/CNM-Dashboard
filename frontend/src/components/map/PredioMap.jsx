import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Icon from "../ui/Icon";
import { DICTAMEN_MAP } from "../../data/constants";
import { formatDate } from "../../utils/dates";
import { formatNumber } from "../../utils/metrics";

/** Plantilla de teselas de OpenStreetMap. */
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

/** Atribución obligatoria de OpenStreetMap. */
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Centro inicial de México cuando no hay predios ubicados. */
const DEFAULT_CENTER = [23.6, -102.5];

/**
 * Escapa caracteres especiales para insertar texto dentro de HTML.
 *
 * @param {unknown} value - Valor a escapar.
 * @returns {string} Texto seguro para `innerHTML`.
 */
function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

/**
 * Crea el icono de un pin coloreado según el dictamen.
 *
 * @param {string} [dictamenId] - Código del dictamen.
 * @returns {L.DivIcon} Icono de Leaflet.
 */
function markerIcon(dictamenId) {
  const color = DICTAMEN_MAP[dictamenId]?.color || "var(--dictamen-cp1)";

  return L.divIcon({
    className: "predio-pin-wrap",
    html: `<span class="predio-pin" style="--pin:${color}"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -18],
  });
}

/**
 * Crea el icono del marcador usado por el selector de ubicación.
 *
 * @returns {L.DivIcon} Icono de Leaflet.
 */
function pickerIcon() {
  return L.divIcon({
    className: "predio-pin-wrap",
    html: '<span class="picker-pin"></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

/**
 * Construye el HTML del popup de un predio.
 *
 * @param {Record<string, any>} predio - Registro del predio.
 * @param {boolean} withAction - Si debe incluir el botón "Ver ficha".
 * @returns {string} HTML escapado del popup.
 */
function buildPopup(predio, withAction) {
  const dictamen = DICTAMEN_MAP[predio.dictamen];
  const color = dictamen?.color || "var(--dictamen-cp1)";
  const soft = dictamen?.suave || "var(--dictamen-cp1-soft)";
  const meta = predio.fechaCorte
    ? `${formatNumber(predio.hectareas)} ha · corte ${formatDate(
        predio.fechaCorte,
        { day: "2-digit", month: "short" },
      )}`
    : `${formatNumber(predio.hectareas)} ha`;

  return `
    <div class="map-popup">
      <span class="map-popup-tag" style="--pin:${color};--pin-soft:${soft}">
        ${escapeHtml(predio.dictamen)} · ${escapeHtml(dictamen?.nombre || "")}
      </span>
      <strong>${escapeHtml(predio.predio)}</strong>
      <span>${escapeHtml(predio.nombre)}</span>
      <span class="map-popup-meta">${escapeHtml(meta)}</span>
      ${
        withAction
          ? '<button type="button" class="map-popup-btn" data-open-predio>Ver ficha <span aria-hidden="true">→</span></button>'
          : ""
      }
    </div>
  `;
}

/**
 * Mapa de predios dictaminados.
 *
 * @param {Object} props - Propiedades del mapa.
 * @param {Array<Record<string, any>>} [props.predios=[]] - Predios con ubicación.
 * @param {(predio: Record<string, any>) => void} [props.onOpen] - Abre la ficha
 * del predio desde el popup.
 * @param {number} [props.height=330] - Altura del mapa en píxeles.
 * @param {boolean} [props.interactive=true] - Habilita arrastre y zoom con controles.
 * @returns {React.JSX.Element} Contenedor del mapa.
 */
export default function PredioMap({
  predios = [],
  onOpen,
  height = 330,
  interactive = true,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const onOpenRef = useRef(onOpen);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 5,
      zoomControl: interactive,
      scrollWheelZoom: false,
      dragging: interactive,
      doubleClickZoom: interactive,
    });

    L.tileLayer(TILE_URL, {
      subdomains: "abcd",
      maxZoom: 19,
      attribution: TILE_ATTRIBUTION,
    }).addTo(map);

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const group = L.layerGroup();
    /** @type {Array<[number, number]>} */
    const bounds = [];
    const hasAction = Boolean(onOpenRef.current);

    predios.forEach((predio) => {
      const lat = Number(predio?.ubicacion?.lat);
      const lng = Number(predio?.ubicacion?.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const marker = L.marker([lat, lng], {
        icon: markerIcon(predio.dictamen),
        title: `${predio.predio} · ${predio.nombre}`,
      });

      marker.bindPopup(buildPopup(predio, hasAction), { closeButton: false });

      if (hasAction) {
        marker.on("popupopen", (event) => {
          const button = event.popup
            .getElement()
            ?.querySelector("[data-open-predio]");

          button?.addEventListener("click", () =>
            onOpenRef.current?.(predio),
          );
        });
      }

      marker.addTo(group);
      bounds.push([lat, lng]);
    });

    group.addTo(map);
    layerRef.current = group;

    if (bounds.length === 1) {
      map.setView(bounds[0], 11);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [38, 38], maxZoom: 10 });
    } else {
      map.setView(DEFAULT_CENTER, 5);
    }
  }, [predios]);

  const mapHeight = `clamp(220px, 46vw, ${height}px)`;

  return (
    <div className="map-frame" style={{ height: mapHeight }}>
      <div
        ref={containerRef}
        className="predio-map"
        style={{ height: mapHeight }}
        role="application"
        aria-label="Mapa de predios dictaminados"
      />
    </div>
  );
}

/**
 * Selector de ubicación sobre un mapa.
 *
 * Permite hacer clic para colocar el marcador o arrastrarlo para ajustar las
 * coordenadas. El valor se redondea a seis decimales (precisión aproximada de
 * 10 cm).
 *
 * @param {Object} props - Propiedades del selector.
 * @param {{lat: number, lng: number}|null} props.value - Coordenadas actuales.
 * @param {(value: {lat: number, lng: number}|null) => void} props.onChange - Notifica cambios.
 * @param {number} [props.height=260] - Altura del mapa en píxeles.
 * @param {boolean} [props.invalid=false] - Muestra el borde de error.
 * @returns {React.JSX.Element} Selector de ubicación.
 */
export function LocationPicker({
  value,
  onChange,
  height = 260,
  invalid = false,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const start = initialValueRef.current;
    const center = start
      ? [Number(start.lat), Number(start.lng)]
      : DEFAULT_CENTER;

    const map = L.map(containerRef.current, {
      center,
      zoom: start ? 12 : 5,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer(TILE_URL, {
      subdomains: "abcd",
      maxZoom: 19,
      attribution: TILE_ATTRIBUTION,
    }).addTo(map);

    map.on("click", (event) => {
      onChangeRef.current?.({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      });
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    if (value) {
      const position = [Number(value.lat), Number(value.lng)];

      if (!Number.isFinite(position[0]) || !Number.isFinite(position[1])) {
        return;
      }

      if (!markerRef.current) {
        markerRef.current = L.marker(position, {
          icon: pickerIcon(),
          draggable: true,
        }).addTo(map);

        markerRef.current.on("dragend", () => {
          const point = markerRef.current?.getLatLng();

          if (!point) return;

          onChangeRef.current?.({
            lat: Number(point.lat.toFixed(6)),
            lng: Number(point.lng.toFixed(6)),
          });
        });
      } else {
        markerRef.current.setLatLng(position);
      }

      try {
        if (!map.getBounds().pad(-0.25).contains(position)) {
          map.setView(position, 12);
        }
      } catch {
        map.setView(position, 12);
      }
    } else if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  }, [value]);

  const mapHeight = `clamp(200px, 52vw, ${height}px)`;

  return (
    <div
      className={`location-picker-shell${invalid ? " invalid" : ""}`}
      style={{ height: mapHeight }}
    >
      <div
        ref={containerRef}
        className="location-picker"
        style={{ height: mapHeight }}
        role="application"
        aria-label="Selector de ubicación del predio"
      />
      <span className="picker-hint">
        <Icon name="mapPin" size={12} />
        Haz clic en el mapa para ubicar el predio
      </span>
      {value ? (
        <>
          <button
            type="button"
            className="picker-clear"
            onClick={() => onChange?.(null)}
          >
            <Icon name="x" size={11} />
            Quitar
          </button>
          <span className="picker-coords">
            {Number(value.lat).toFixed(5)}, {Number(value.lng).toFixed(5)}
          </span>
        </>
      ) : null}
    </div>
  );
}
