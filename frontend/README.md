# ConsejoApp · Frontend

Aplicación web del **Consejo Mexicano Agroempresarial** para la dictaminación
de predios del módulo **Silo** (maíz para ensilaje). Incluye panel general,
bitácora, captura de muestreo, dictamen de calidad y mapa de ubicaciones.

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
│   ├── dashboard/KpiCard.jsx
│   ├── layout/                 # Sidebar y Topbar
│   ├── map/PredioMap.jsx       # Mapa de predios y selector de ubicación
│   └── ui/                     # Icon, Modal y ConfirmDialog
├── data/
│   ├── constants.js            # Dictámenes, cultivos, textos y constantes
│   └── seed.js                 # 16 predios demo con fechas relativas
├── pages/                      # Dashboard, Bitacora y CultivoPlaceholder
├── store/
│   ├── PrediosProvider.jsx     # Estado global + persistencia
│   ├── prediosContext.js       # Contexto y hook usePredios
│   ├── ToastProvider.jsx       # Notificaciones
│   └── toastContext.js         # Contexto y hook useToast
├── styles/                     # CSS por dominio
└── utils/
    ├── csv.js                  # Generación y descarga de CSV
    ├── dates.js                # Fechas ISO sin desfase de zona horaria
    └── metrics.js              # Agregaciones y formateo numérico
```

## Arquitectura

- **Estado global mínimo:** `PrediosProvider` concentra los registros y expone
  acciones estables (`addPredio`, `updatePredio`, `deletePredio`, `resetDemo`).
- **Persistencia local:** los datos se guardan en `localStorage` con la clave
  `cma.predios.silo.v1`. Si el navegador bloquea el almacenamiento, la app sigue
  funcionando en memoria.
- **Lógica separada de la vista:** validación y normalización del formulario en
  `formModel.js`; fechas y métricas en `utils/`.
- **Sin router:** la navegación entre panel, bitácora y cultivos es estado local.
  Al agregar más módulos, se recomienda introducir React Router.
- **Mapas:** Leaflet se monta una sola vez por contenedor; los marcadores se
  actualizan en un efecto separado y los popups escapan el HTML antes de
  insertarlo.

## Datos y backend

Este frontend **no consume el backend todavía**: es un prototipo local. Para
conectarlo, sustituye la lectura/escritura de `PrediosProvider` por llamadas a la
API (por ejemplo, con `fetch` y una variable `VITE_API_URL`).

## Accesibilidad

- Diálogos con `role="dialog"`, bloqueo de scroll, cierre con `Escape`, foco
  inicial y trampa de foco.
- Filas de la tabla operables con teclado (`Enter` / `Espacio`) y botones de
  acción con etiquetas `aria-label`.
- Enlace «Saltar al contenido», etiquetas `aria-label`, `aria-invalid` y
  mensajes de error asociados con `aria-describedby`.
- Respeto a `prefers-reduced-motion`.

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
