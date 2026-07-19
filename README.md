# Mobile Shop

SPA en React para explorar y comprar dispositivos móviles. Consume la API `https://itx-frontend-test.onrender.com` y consta de dos vistas: listado de productos (PLP) y detalle de producto (PDP).

## Stack

- [React 19](https://react.dev/) + JavaScript (ES6+, sin TypeScript)
- [Vite 8](https://vite.dev/) como bundler y entorno de desarrollo
- [React Router](https://reactrouter.com/) para el enrutado en cliente (SPA)
- Context API + hooks para el estado (sin librerías externas de estado)
- CSS Modules para los estilos de componente
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react) para tests unitarios
- [Playwright](https://playwright.dev/) para tests end-to-end
- ESLint + Prettier

## Requisitos

- Node.js 20+
- npm 10+

## Instalación y scripts

```bash
npm install

npm run start      # entorno de desarrollo (Vite dev server)
npm run build      # build de producción
npm run preview    # sirve el build de producción localmente
npm run test       # todos los tests: unitarios (Vitest) + e2e (Playwright)
npm run test:unit  # solo tests unitarios
npm run test:e2e   # solo tests end-to-end
npm run lint       # comprobación de ESLint
npm run format     # formatea el proyecto con Prettier
```

Antes de la primera ejecución de los e2e hace falta instalar el navegador: `npx playwright install chromium`. Los e2e levantan solos el dev server (o reutilizan uno ya arrancado en el puerto 5173).

## Estructura del proyecto

Arquitectura por capas inspirada en hexagonal, adaptada a frontend:

```
src/
├── domain/           → modelos y lógica pura (sin React, sin fetch)
│   ├── models/       → mappers/normalizadores del producto
│   └── services/     → filtrado por marca+modelo, selección de opciones
├── application/      → casos de uso y hooks de orquestación
│   ├── useProducts / useProductDetail
│   └── CartProvider / useCart (CartContext)
├── infrastructure/   → detalles técnicos
│   ├── api/          → cliente HTTP (fetch) con los 3 endpoints del API
│   ├── cache/        → caché con TTL de 1 hora sobre localStorage
│   └── storage/      → persistencia del contador de la cesta
└── ui/               → presentación (solo pinta y emite eventos)
    ├── components/   → Header, SearchBar, ProductCard, ProductGrid, ProductImage,
    │                   ProductDescription, ProductActions, Breadcrumbs, Loader,
    │                   ErrorMessage, EmptyState
    ├── pages/        → ProductListPage (PLP), ProductDetailPage (PDP)
    └── router/       → definición de rutas
```

Reglas de dependencia: `domain` no importa React ni fetch; `ui` nunca llama al API directamente (siempre a través de los hooks de `application`); la caché vive en `infrastructure` y es transparente para el resto de capas.

### Capa de infraestructura

- `api/config.js` — URL base del API, sobreescribible vía `VITE_API_BASE_URL` (ver `.env.example`).
- `api/ApiError.js` — error unificado con `status` HTTP (`0` = fallo de red).
- `api/httpClient.js` — wrapper de `fetch`: resuelve con JSON o rechaza siempre con `ApiError`.
- `api/productApi.js` — repositorio con los 3 endpoints (`getProducts`, `getProductById`, `postCart`). Los GET componen la caché de forma transparente; el POST nunca cachea.
- `cache/cache.js` — ver sección de caché.
- `storage/cartStorage.js` — persistencia del contador de la cesta (sin TTL: no expira).

### Capa de dominio

- `models/product.js` — mappers modelados contra la respuesta real del API, que tiene sus peculiaridades: campos mal escritos en el wire (`dimentions`, `secondaryCmera`), cámaras que llegan como string o como array, y strings vacíos para datos desconocidos. Todo campo vacío se normaliza a `null`; la UI nunca muestra `undefined` ni `NaN`, sino un fallback («—» en el listado, «No disponible» en el detalle).
- `services/filterProducts.js` — búsqueda en cliente, case-insensitive, contra la etiqueta combinada «marca modelo» (cubre búsquedas por marca, por modelo o cruzadas como «acer liquid»).
- `services/cartSelection.js` — política de selección por defecto (**la primera opción que devuelve el API**, también cuando solo hay una) y validación de códigos antes del POST.

### Capa de aplicación

- `useProducts` / `useProductDetail` — cargan a través del repositorio cacheado y exponen `{ loading, error, retry }`. En el detalle, un id inválido se distingue del resto de errores para renderizar «producto no encontrado» con enlace de vuelta (el API real responde 500, no 404, ante ids desconocidos).
- `CartProvider` + `useCart` — el provider rehidrata el contador desde `localStorage` al montar y persiste cada actualización; `useCart` expone `addToCart` con el ciclo `idle | loading | success | error` que gobierna los estados del botón Añadir. El contador mostrado es el `count` que devuelve el API.

### Vistas y estados de pantalla

- **PLP (`/`)**: grid `ul` con CSS Grid de máximo 4 columnas (4 → 3 → 2 → 1 en 1100/820/540 px), búsqueda en tiempo real, y estados de carga, error con reintento, catálogo vacío y búsqueda sin resultados.
- **PDP (`/product/:id`)**: dos columnas (imagen | descripción y acciones) apiladas en móvil, enlace de vuelta, breadcrumb «Home / Marca Modelo», ficha de características (marca, modelo, precio, CPU, RAM, sistema operativo, resolución, batería, cámaras, dimensiones y peso), selectores de almacenamiento y color siempre visibles, y estados de carga, producto no encontrado y error recuperable.
- Transversal: cabecera fija con logo-enlace, breadcrumbs y contador de cesta; imágenes con placeholder ante URL ausente o rota; HTML semántico (`header`/`nav`/`main`, `label` asociados, botones reales) y foco visible.

## Decisiones técnicas

- **Vite** como boilerplate: dev server instantáneo, build de producción optimizada out-of-the-box y configuración mínima, sin el peso ni el acoplamiento de un framework con SSR para una SPA pura.
- **JavaScript (ES6+), sin TypeScript**: la ausencia de tipos estáticos se compensa con normalización de datos en la capa de dominio (el API devuelve campos vacíos y formas inconsistentes) y con tests.
- **Context API en vez de Redux/Zustand**: el único estado global de la app es el contador de la cesta (un número). Cualquier librería externa de estado sería una dependencia injustificada para este alcance.
- **Caché de respuestas crudas**: se cachea lo que devuelve el API, no el modelo normalizado, de modo que los mappers de dominio puedan evolucionar sin invalidar entradas ya guardadas.
- **ESLint (flat config) + Prettier separados**: linting y formato como preocupaciones independientes (`eslint-config-prettier` desactiva solo las reglas estilísticas conflictivas).
- **`react-hooks` y `react-refresh`** como únicos plugins de lint de React: los necesarios para detectar errores reales de hooks y de HMR, nada más.

## Caché y persistencia del carrito

**Caché de 1 hora** (`src/infrastructure/cache/cache.js`):

- Cada respuesta GET del API se guarda en `localStorage` como `{ value, timestamp }`, bajo las claves `products` (listado) y `product:{id}` (cada detalle).
- El TTL es de 1 hora (`CACHE_TTL_MS = 3_600_000`), definido en un único sitio.
- Al leer, si han pasado más de `CACHE_TTL_MS` ms la entrada se considera inválida y se revalida contra el API. Mientras la entrada sea válida **no se hace ninguna petición de red**.
- Se cachea la respuesta **cruda** del API (no el modelo normalizado): así un cambio en los mappers de dominio nunca obliga a invalidar caché.
- Tolerante a fallos: JSON corrupto, entradas malformadas o `localStorage` no disponible se tratan como cache-miss y nunca rompen la app; los fallos de escritura (cuota) se ignoran (best-effort).

**Contador de la cesta** (`src/infrastructure/storage/cartStorage.js`): se persiste aparte, sin TTL, porque debe sobrevivir indefinidamente a recargas. Valores corruptos o inválidos se normalizan a `0`. El Header lo lee desde cualquier vista a través de `CartContext`, que rehidrata el valor al cargar la app.

## Testing

`npm run test` ejecuta la suite completa (unitarios y e2e).

**Unitarios** — Vitest (jsdom) + React Testing Library:

- **Caché** (`cache.test.js`): entrada fresca servida sin fetch, expiración pasada 1 h (fake timers, incluido el caso frontera exacto), JSON corrupto / entradas malformadas tratadas como miss sin lanzar, fallo de escritura silencioso.
- **Repositorio API** (`productApi.test.js`): caché fresca ⇒ cero peticiones; caducada ⇒ revalidación; respuestas fallidas no se cachean; cada detalle bajo su propia clave; `postCart` nunca cachea.
- **HTTP client** (`httpClient.test.js`): contrato de `ApiError` para status no-OK, fallo de red y JSON inválido.
- **Cart storage** (`cartStorage.test.js`): rehidratación, valores corruptos/negativos ⇒ `0`, escrituras inválidas ignoradas.
- **Dominio**: mappers con fixtures del formato real (campos mal escritos, cámaras string/array, precios vacíos), filtrado por marca/modelo y selección por defecto.
- **Aplicación**: hooks con el repositorio mockeado (carga, error + retry, cambio de id, payload inesperado) y carrito (rehidratación, persistencia tras añadir, fallo del POST sin perder el contador, contador compartido entre consumidores).
- **UI**: ProductCard (datos, enlace, precio ausente, imagen rota), Header (contador persistido, breadcrumbs), ProductActions (defaults, botón en vuelo, feedback), y tests de integración de ambas páginas con el API mockeado.

**End-to-end** — Playwright (`e2e/shop.spec.js`), con la red mockeada vía `page.route` para que sean deterministas:

1. Carga de la PLP y render del grid.
2. Búsqueda en tiempo real por marca y por modelo (y estado sin resultados).
3. Navegación PLP → PDP y vuelta con el enlace.
4. Añadir a la cesta (verificando el body del POST) con contador actualizado y persistente tras recargar.
5. Estado de error cuando el API falla.

## Notas

- El POST de `/api/cart` siempre responde `{ "count": 1 }`; la cabecera muestra el valor devuelto por el API.
- El API responde `500` (no `404`) ante un id de producto inexistente; la PDP trata ambos como «producto no encontrado» y reserva el estado de error recuperable (con Reintentar) para fallos de red.
