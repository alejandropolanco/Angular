# NovaStore

Tienda de tecnología premium construida con **Angular 21**, **PrimeNG**, **SSR** y una **API real con Express**. Incluye catálogo con búsqueda, filtros por categoría, ordenamiento, carrito persistente, registro de usuarios y autenticación mediante sesiones seguras en el servidor.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![PrimeNG](https://img.shields.io/badge/PrimeNG-21-06b6d4)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)

## Características

- Diseño oscuro premium con bordes neón, gradientes y tipografías Space Grotesk + Inter.
- Catálogo de productos con búsqueda por nombre, categoría o descripción.
- Filtros por categoría y ordenamiento por precio, valoración y nombre.
- Filtros sincronizados con la URL (`?q=`, `?cat=`, `?sort=`) sin perder la posición de scroll.
- Carrito con cantidades, subtotal, envío, progreso de envío gratis y diálogo de confirmación.
- Registro de usuarios con validación en cliente y servidor.
- Sesiones con cookie `httpOnly`, token aleatorio y hash SHA-256 almacenado en SQLite.
- Contraseñas con hash bcrypt (coste 12) y política mínima de seguridad.
- Rutas protegidas con guards, redirección de retorno y página 404 personalizada.
- SSR con renderizado en cliente para las rutas privadas.
- API con Helmet, CSP, rate limiting, validación Zod y protección de origen.

## Requisitos

- Node.js 20 o superior (probado con Node 24)
- npm 11 o superior

## Puesta en marcha

```bash
npm install
npm start
```

`npm start` levanta dos procesos en paralelo:

| Proceso | URL                     | Descripción                    |
| ------- | ----------------------- | ------------------------------ |
| Web     | `http://localhost:4200` | Angular con proxy `/api`       |
| API     | `http://localhost:4000` | Express + SQLite en desarrollo |

La primera ejecución crea la base de datos en `data/novastore.db` y siembra el usuario administrador.

> **Importante:** usá `npm start`, no `ng serve` suelto. Si el frontend corre solo, el proxy `/api` devuelve `ECONNREFUSED` porque nadie está escuchando en el puerto `4000`. Si preferís dos terminales, ejecutá `npm run start:web` y `npm run start:api` en paralelo.

## Variables de entorno

Copiá `.env.example` a `.env` y ajustá los valores. En desarrollo funciona sin `.env` usando los valores por defecto.

| Variable           | Por defecto                                   | Descripción                                       |
| ------------------ | --------------------------------------------- | ------------------------------------------------- |
| `NODE_ENV`         | `development`                                 | En `production` activa cookies `secure` y HSTS    |
| `PORT`             | `4000`                                        | Puerto de la API / SSR                            |
| `DATABASE_PATH`    | `data/novastore.db`                           | Ruta del archivo SQLite                           |
| `ADMIN_EMAIL`      | `admin@gmail.com`                             | Correo del administrador inicial                  |
| `ADMIN_PASSWORD`   | `1234`                                        | Contraseña inicial del administrador              |
| `SESSION_TTL_DAYS` | `7`                                           | Duración de la sesión en días                     |
| `ALLOWED_ORIGINS`  | `http://localhost:4200,http://localhost:4000` | Orígenes permitidos para solicitudes a `/api`     |
| `TRUST_PROXY`      | `false`                                       | Activar solo detrás de un proxy inverso confiable |

> En producción definí siempre `ADMIN_PASSWORD` con una contraseña fuerte. Si no lo hacés, la API crea el administrador con la contraseña por defecto y emite una advertencia.

## Credenciales de demostración

| Campo      | Valor             |
| ---------- | ----------------- |
| Correo     | `admin@gmail.com` |
| Contraseña | `1234`            |

El correo se normaliza a minúsculas, por lo que `Admin@gmail.com` también funciona. Estas credenciales son solo para desarrollo local.

## Registro de usuarios

La página `/register` solicita:

- Nombre completo (2–80 caracteres).
- Correo electrónico válido (máximo 254 caracteres).
- Contraseña de 8–72 caracteres con al menos una letra y un número.
- Confirmación de contraseña.
- Aceptación de términos y privacidad.

Al registrarse correctamente el usuario **no inicia sesión automáticamente**: se lo redirige a `/login?registered=1`, donde se muestra un aviso de éxito. La verificación de correo y la recuperación de contraseña quedan para una segunda etapa.

## API

La API se monta en `/api` y comparte el servidor Express con Angular SSR en producción.

| Método | Ruta                 | Descripción                                   | Respuesta |
| ------ | -------------------- | --------------------------------------------- | --------- |
| `POST` | `/api/auth/register` | Crea una cuenta                               | `201`     |
| `POST` | `/api/auth/login`    | Inicia sesión y establece la cookie de sesión | `200`     |
| `GET`  | `/api/auth/me`       | Devuelve el usuario autenticado               | `200`     |
| `POST` | `/api/auth/logout`   | Cierra la sesión                              | `204`     |

Los errores usan un formato uniforme:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "El correo o la contraseña no son correctos."
  }
}
```

La validación devuelve `422` con el detalle por campo en `error.fields`.

## Scripts disponibles

| Comando                      | Descripción                                    |
| ---------------------------- | ---------------------------------------------- |
| `npm start`                  | Web + API en desarrollo con recarga automática |
| `npm run start:web`          | Solo Angular en `http://localhost:4200`        |
| `npm run start:api`          | Solo la API en `http://localhost:4000`         |
| `npm run build`              | Build de producción con SSR y prerenderizado   |
| `npm run watch`              | Build de desarrollo en modo watch              |
| `npm test`                   | Pruebas unitarias con Vitest                   |
| `npm run serve:ssr:shop-tex` | Sirve el build SSR de producción con la API    |

## Rutas principales

| Ruta        | Descripción                               | Acceso         |
| ----------- | ----------------------------------------- | -------------- |
| `/`         | Redirige según el estado de autenticación | Público        |
| `/login`    | Inicio de sesión                          | Solo invitados |
| `/register` | Registro de cuenta                        | Solo invitados |
| `/store`    | Catálogo de productos                     | Autenticado    |
| `/cart`     | Carrito de compras                        | Autenticado    |
| `/**`       | Página 404                                | Público        |

## Estructura del proyecto

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/          # authGuard, guestGuard, rootRedirectGuard
│   │   ├── interceptors/    # withCredentials para /api
│   │   └── theme/           # Preset de PrimeNG (NovaPreset)
│   ├── features/
│   │   ├── auth/            # Login, registro, sesión y modelos
│   │   ├── cart/            # Carrito, totales y persistencia
│   │   ├── not-found/       # Página 404
│   │   └── store/           # Catálogo, productos y filtros
│   ├── layout/              # Header, footer y layouts
│   └── shared/              # BrandLogo, EmptyState, ProductCard
├── server/
│   ├── api/
│   │   ├── app.ts           # Montaje de la API y manejo de errores
│   │   ├── auth.ts          # Registro, login, me y logout
│   │   ├── config.ts        # Configuración por entorno
│   │   ├── db.ts            # Esquema SQLite y usuarios
│   │   ├── security.ts      # Helmet, CSP, rate limiting y origen
│   │   ├── sessions.ts      # Sesiones y cookies
│   │   └── standalone.ts    # API independiente para desarrollo
│   └── server.ts            # Express + Angular SSR + API
├── styles/                  # Tokens, base y overrides de PrimeNG
├── styles.scss
└── index.html
```

## Decisiones técnicas

- **API real con Express:** la autenticación dejó de ser una demo de `localStorage`. El estado de sesión vive en SQLite y el navegador solo conserva una cookie opaca.
- **SQLite con `better-sqlite3`:** almacenamiento simple, transaccional y sin servicios externos. Se usa WAL y consultas preparadas.
- **Angular SSR + API en un solo proceso:** en producción `src/server.ts` monta `/api` antes de los archivos estáticos y del render de Angular.
- **Dos procesos en desarrollo:** `ng serve` en `4200` y la API con `tsx watch` en `4000`, unidos por `proxy.conf.json`.
- **Signals:** estado reactivo para sesión, carrito, filtros y totales.
- **Lazy loading:** las rutas de tienda, carrito, login, registro y 404 se cargan bajo demanda.
- **SSR selectivo:** `/store` y `/cart` se renderizan en el cliente para evitar redirecciones de autenticación durante el prerender. `/login` y `/register` se prerenderizan.
- **Persistencia tolerante a fallos:** el carrito captura errores de `localStorage` (modo privado, cuotas, datos corruptos).
- **Filtros sin saltos:** las actualizaciones de query params usan `scroll: 'manual'` para no volver al tope de la página.

## Seguridad

Las medidas implementadas y los riesgos residuales están documentados en [SECURITY_AUDIT.md](./SECURITY_AUDIT.md). Resumen:

- Contraseñas con bcrypt (coste 12), nunca en texto plano.
- Tokens de sesión aleatorios de 32 bytes; en la base solo se guarda su hash SHA-256.
- Cookie `httpOnly`, `sameSite=lax`, `secure` y prefijo `__Host-` en producción.
- Validación de entrada con Zod, consultas preparadas y límite de body de 10 kB.
- Helmet con CSP, `X-Frame-Options`, `nosniff` y HSTS en producción.
- Rate limiting global y específico para login y registro (5 registros/hora por IP en producción; cupos amplios en desarrollo para no bloquear pruebas).
- Mensajes de error genéricos en login y comparación con hash dummy para reducir fugas por tiempo.

## Pruebas

```bash
npm test
```

La suite cubre servicios, guards, interceptor, páginas de login y registro, y componentes de layout con Vitest y jsdom.

## Build de producción

```bash
npm run build
npm run serve:ssr:shop-tex
```

Definí `NODE_ENV=production`, `ADMIN_PASSWORD` y `ALLOWED_ORIGINS` antes de servir. El resultado se genera en `dist/shop-tex/`.
