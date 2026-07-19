# Mobile Shop

SPA en React para explorar y comprar dispositivos móviles, construida como prueba técnica. Consume la API real `https://itx-frontend-test.onrender.com` y consta de dos vistas: listado de productos (PLP) y detalle de producto (PDP).

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
npm run build       # build de producción
npm run preview      # sirve el build de producción localmente
npm run test          # tests unitarios (Vitest)
npm run test:e2e       # tests end-to-end (Playwright)
npm run lint             # comprobación de ESLint
npm run format             # formatea el proyecto con Prettier
```

## Estructura del proyecto

Arquitectura por capas inspirada en hexagonal, adaptada a frontend:

```
src/
├── domain/           → modelos y lógica pura
├── application/      → casos de uso y hooks de orquestación
├── infrastructure/   → detalles técnicos
│   ├── api/          → cliente HTTP (fetch) con los 3 endpoints del API
│   ├── cache/        → caché con TTL de 1 hora sobre localStorage
│   └── storage/      → persistencia del contador de la cesta
└── ui/               → presentación (solo pinta y emite eventos)
```

Reglas de dependencia: `domain` no importa React ni fetch; `ui` nunca llama al API directamente (siempre a través de los hooks de `application`); la caché vive en `infrastructure` y es transparente para el resto de capas.

### Capa de infraestructura

- `api/config.js` — URL base del API, sobreescribible vía `VITE_API_BASE_URL` (ver `.env.example`).
- `api/ApiError.js` — error unificado con `status` HTTP (`0` = fallo de red).
- `api/httpClient.js` — wrapper de `fetch`: resuelve con JSON o rechaza siempre con `ApiError`.
- `api/productApi.js` — repositorio con los 3 endpoints (`getProducts`, `getProductById`, `postCart`). Los GET componen la caché de forma transparente; el POST nunca cachea.
- `cache/cache.js` — ver sección de caché.
- `storage/cartStorage.js` — persistencia del contador de la cesta (sin TTL: no expira).

## Decisiones técnicas

- **Vite** como boilerplate: dev server instantáneo, build de producción optimizada out-of-the-box y configuración mínima, sin el peso ni el acoplamiento de un framework con SSR (el enunciado exige SPA pura).
- **JavaScript, no TypeScript**: requisito explícito del enunciado. Se compensa con normalización de datos en la capa de dominio (el API devuelve campos vacíos y formas inconsistentes) y con tests.
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

Tests unitarios con Vitest (jsdom) + React Testing Library; `npm run test` los ejecuta todos.

- **Caché** (`cache.test.js`): entrada fresca servida sin fetch, expiración pasada 1 h (fake timers, incluido el caso frontera exacto), JSON corrupto / entradas malformadas tratadas como miss sin lanzar, fallo de escritura silencioso.
- **Repositorio API** (`productApi.test.js`): caché fresca ⇒ cero peticiones; caducada ⇒ revalidación; respuestas fallidas no se cachean; cada detalle bajo su propia clave; `postCart` nunca cachea.
- **HTTP client** (`httpClient.test.js`): contrato de `ApiError` para status no-OK, fallo de red y JSON inválido.
- **Cart storage** (`cartStorage.test.js`): rehidratación, valores corruptos/negativos ⇒ `0`, escrituras inválidas ignoradas.
