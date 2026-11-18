# ConsejoApp · Frontend

Aplicación web del **Consejo Mexicano Agroempresarial** para la dictaminación
de predios del módulo **Silo** (maíz para ensilaje). Incluye panel general,
bitácora, captura de muestreo, dictamen de calidad, semáforo y ranking de
productores, separación por predio, zonas de acopio, observaciones y mapa de
ubicaciones.

Migrada desde el prototipo `cma/demo-predios` y documentada con JSDoc.

## Stack

- [React 19](https://react.dev/)
- [Vite 8](https://vite.dev/)
- [Leaflet 1.9](https://leafletjs.com/) + OpenStreetMap
- CSS plano con variables de diseño (sin framework)
- ESLint 10 + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`

## Requisitos

- Node.js 20.19+ o 22.12+ (requisito de Vite 8)
- npm 10+

## Instalación y scripts

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # build de producción en dist/
npm run preview  # sirve el build
npm run lint     # análisis estático
```

## Funcionalidades

- **Panel general:** KPIs, distribución de dictámenes, superficie, zonas,
  cortes, mapa, semáforo y detalle por predio.
- **Productores:** semáforo, ranking de calidad, grupos por dictamen y un panel
  por productor con sus predios separados.
- **Bitácora:** búsqueda y filtros por productor, zona y calidad; tabla, tarjetas,
  ficha lateral, edición, eliminación y exportación CSV con los campos nuevos.
- **Formulario:** variedad, régimen hídrico, localidad con zona automática,
  superficie, fecha de siembra por predio, paquete tecnológico y observaciones.
- **Ficha del predio:** puntaje, semáforo, manejo agronómico, muestreo,
  observaciones y logística.
- **Tema claro y oscuro:** cubre toda la aplicación (paneles, tablas, mapas,
  formularios, modales y fichas). Respeta la preferencia del sistema, se
  conserva en `localStorage` y se aplica antes del primer paint.
- **Diseño responsivo:** probado desde 320 px, móviles, plegables, tablets,
  escritorio y orientación horizontal; tablas con desplazamiento interno,
  modales tipo hoja inferior y barras de navegación adaptativas.

## Estructura

```text
src/
├── App.jsx                     # Shell: navegación, formulario y diálogos
├── main.jsx                    # Entrada: providers y estilos globales
├── components/
│   ├── bitacora/
│   │   ├── BitacoraForm.jsx    # Modal de alta/edición (solo presentación)
│   │   ├── formModel.js        # Estado inicial, validación, payload y muestreo
│   │   └── PredioDrawer.jsx    # Ficha lateral del predio
│   ├── charts/                 # BarList, ColumnChart y DonutChart (SVG/CSS)
│   ├── dashboard/              # KpiCard, ZonasCard, PredioDetailList y ObservacionesCard
│   ├── layout/                 # Sidebar y Topbar
│   ├── map/PredioMap.jsx       # Mapa de predios y selector de ubicación
│   ├── productores/            # SemaforoBoard, RankingTable, CalidadGroups y ProductorPanels
│   └── ui/                     # Icon, Modal y ConfirmDialog
├── data/
│   ├── constants.js            # Dictámenes, cultivos, textos y constantes
│   ├── catalogos.js            # Variedades, regímenes, zonas, localidades y paquete
│   ├── predioModel.js          # Normalización y migración de registros
│   └── seed.js                 # 16 predios demo con fechas relativas
├── pages/                      # Dashboard, Productores, Bitacora y CultivoPlaceholder
├── store/
│   ├── PrediosProvider.jsx     # Estado global + persistencia
│   ├── prediosContext.js       # Contexto y hook usePredios
│   ├── ThemeProvider.jsx       # Tema claro/oscuro + preferencia del sistema
│   ├── themeContext.js         # Contexto y hook useTheme
│   ├── ToastProvider.jsx       # Notificaciones
│   └── toastContext.js         # Contexto y hook useToast
├── styles/                     # CSS por dominio (incluye productores.css)
└── utils/
    ├── analytics.js            # Puntaje, semáforo, ranking, zonas y observaciones
    ├── csv.js                  # Generación y descarga de CSV
    ├── dates.js                # Fechas ISO sin desfase de zona horaria
    └── metrics.js              # Agregaciones y formateo numérico
```

## Arquitectura

- **Estado global mínimo:** `PrediosProvider` concentra los registros y expone
  acciones estables (`addPredio`, `updatePredio`, `deletePredio`, `resetDemo`).
  `ThemeProvider` resuelve y persiste el tema claro/oscuro.
- **Persistencia local:** los datos se guardan en `localStorage` con la clave
  `cma.predios.silo.v1` y el tema con `cma.tema`. Si el navegador bloquea el
  almacenamiento, la app sigue funcionando en memoria.
- **Tema por variables CSS:** los colores viven en `index.css`; los catálogos de
  dictámenes, semáforo y zonas referencian variables (`var(--...)`) para que los
  colores de gráficas, pines y etiquetas cambien con el tema.
- **Lógica separada de la vista:** validación y normalización del formulario en
  `formModel.js`; fechas y métricas en `utils/`.
- **Sin router:** la navegación entre panel, productores, bitácora y cultivos es
  estado local. Al agregar más módulos, se recomienda introducir React Router.
- **Mapas:** Leaflet se monta una sola vez por contenedor; los marcadores se
  actualizan en un efecto separado y los popups escapan el HTML antes de
  insertarlo.

## Calidad, semáforo y ranking

El puntaje de un predio combina el dictamen asignado en campo con el porcentaje
de plantas con elote de su propia muestra:

```text
puntaje = 0.6 × base_dictamen + 0.4 × % de plantas con elote
base_dictamen: CP-1 = 100, 1C = 75, 2C = 50
```

- **Semáforo:** verde con 80 puntos o más, amarillo desde 60 y rojo por debajo
  de 60.
- **Productor:** su puntaje se pondera por superficie, de modo que un predio
  grande no queda opacado por uno pequeño con mejor muestra.
- **Ranking:** ordena por puntaje, luego por porcentaje de elote y superficie.
- **Separación por predio:** los paneles de productor muestran superficie,
  siembra, variedad, régimen, paquete, elote y puntaje de cada predio.
- **Observaciones:** se resume la adopción de paquete tecnológico y se listan
  las notas capturadas, ordenadas por actualización.

Los cálculos viven en `src/utils/analytics.js`; las vistas solo consumen sus
resultados.

## Zonas de acopio

Las zonas se miden desde el **Rancho de Grupo Ganadero Delite**, en Oriental,
Puebla, dentro de un radio de 65 km. La localidad asigna la zona de forma
automática, aunque el formulario permite corregirla.

| Zona | Distancia | Localidades |
| --- | --- | --- |
| Zona 1 | 11–20 km | El Carmen, Oriental, Nuevo México, Coyotepec, Libres, Mazatepec |
| Zona 2 | 21–30 km | San José Ozumba, Cuapiaxtla, Altzayanca |
| Zona 3 | 31–45 km | Santa María Ixtiyucal, Nopalucan, Chapultepec, Grajales |
| Zona 4 | 55–62 km | Zitlaltepec, El Rincón, Ixtenco, Perote |

`zonaPorDistancia(km)` queda disponible como apoyo para clasificar por
coordenadas; el flujo principal usa el catálogo de localidades.

## Datos y backend

Este frontend **no consume el backend todavía**: es un prototipo local. Para
conectarlo, sustituye la lectura/escritura de `PrediosProvider` por llamadas a la
API (por ejemplo, con `fetch` y una variable `VITE_API_URL`).

Al leer `localStorage`, `predioModel.js` completa los registros antiguos con los
campos nuevos (`variedad`, `regimenHidrico`, `localidad`, `zona`,
`paqueteTecnologico`, `observaciones`). Los registros demo de versiones previas
se reemplazan por la semilla vigente; los capturados por el usuario solo se
normalizan, sin inventar información agronómica.

## Tema y responsividad

- `index.html` aplica el tema antes del primer render leyendo `cma.tema` y
  `prefers-color-scheme`, evitando el destello de tema.
- `ThemeProvider` acepta `light`, `dark` y `system`; el botón de la barra
  superior alterna entre claro y oscuro y guarda la elección.
- Los colores semánticos (`--surface`, `--ink`, `--line`, dictámenes, semáforo y
  zonas) se redefinen en `[data-theme="dark"]`.
- Puntos de quiebre principales: 1240, 1100, 1000, 920, 720, 640, 560, 480, 400
  y 360 px, además de una regla para poca altura en horizontal.
- En móvil la barra lateral se convierte en una barra superior con menú
  desplegable (sin desplazamiento horizontal), el formulario pasa a hoja
  inferior y las tablas de ranking y detalle por predio se reorganizan como
  tarjetas.

## Accesibilidad

- Diálogos con `role="dialog"`, bloqueo de scroll, cierre con `Escape`, foco
  inicial y trampa de foco.
- Filas de la tabla operables con teclado (`Enter` / `Espacio`) y botones de
  acción con etiquetas `aria-label`.
- Enlace «Saltar al contenido», etiquetas `aria-label`, `aria-invalid` y
  mensajes de error asociados con `aria-describedby`.
- Respeto a `prefers-reduced-motion` y a `prefers-color-scheme` para el tema
  inicial.
- Interruptor de tema con `aria-label` y `aria-pressed` en la barra superior.

## Convenciones

- Componentes en `PascalCase.jsx`; utilidades en `camelCase.js`.
- Funciones y componentes documentados con JSDoc en español.
- Estilos globales importados únicamente en `main.jsx`.
- No se usa `dangerouslySetInnerHTML` en React: los popups de Leaflet se
  construyen como cadena y se escapan explícitamente.

## Notas de la migración

- Se agregó `leaflet` a las dependencias.
- Se corrigieron caracteres dañados del prototipo (`Â·`, `â†’`, `ubicaciÃ³n`).
- La prueba de conexión al backend del scaffold anterior fue reemplazada por la
  aplicación real; el backend sigue disponible en `../backend`.
