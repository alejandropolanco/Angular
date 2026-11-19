# Despliegue en producción

NovaStore **no es un sitio estático**. Es una app full-stack donde un único
proceso Node hace tres cosas a la vez:

| Pieza | Qué necesita |
| --- | --- |
| Angular SSR (render en servidor) | Proceso Node de larga duración |
| API Express (`/api/auth/*`, …) | Proceso Node de larga duración |
| SQLite (usuarios, sesiones, productos, pedidos) | **Disco persistente** |

Por eso **no encaja en hostings serverless** (Netlify, Vercel): no ofrecen
proceso persistente ni almacenamiento duradero. Necesitás un servicio con
proceso Node continuo **y** un disco/volumen persistente.

---

## 1. Cómo se construye y arranca

```bash
npm ci --include=dev   # instala TODO (el CLI de Angular es devDependency) y compila better-sqlite3
npm run build          # -> dist/shop-tex/  (browser/ + server/server.mjs)
node dist/shop-tex/server/server.mjs   # = npm run serve:ssr:shop-tex
```

> **`--include=dev` no es opcional.** Con `NODE_ENV=production` en el entorno, npm
> omite las devDependencies y el CLI de Angular (`ng`) es una de ellas; sin el
> flag el build falla con `sh: 1: ng: not found`. Ver §9.

`src/server.ts` monta `/api` **antes** de los archivos estáticos y del render de
Angular, así que web y API comparten origen y puerto.

> **`npm ci` en el servidor, nunca copiar `node_modules` desde Windows.**
> `better-sqlite3` es un módulo nativo compilado por plataforma y ABI de Node.

---

## 2. Variables de entorno

| Variable | Producción | Notas |
| --- | --- | --- |
| `NODE_ENV` | `production` | Activa cookies `secure`, prefijo `__Host-` y HSTS |
| `PORT` | *(lo inyecta el hosting)* | El servidor lee `process.env.PORT` |
| `NODE_VERSION` | `24` | Coincidir con la versión de desarrollo |
| `DATABASE_PATH` | `/var/lib/novastore/novastore.db` | **Absoluta**, dentro del disco persistente |
| `ADMIN_EMAIL` | tu correo | Se usa solo al crear la base por primera vez |
| `ADMIN_PASSWORD` | contraseña fuerte | Ídem; cambiarla después no actualiza el admin existente |
| `SESSION_TTL_DAYS` | `7` | Duración de la sesión |
| `ALLOWED_ORIGINS` | `https://tudominio.com` | Con esquema `https://`; separá varios por coma |
| `TRUST_PROXY` | `true` | Detrás de un proxy inverso (Render, nginx, etc.) |
| `NG_ALLOWED_HOSTS` | `tudominio.com` | Hosts permitidos por el SSR de Angular (ver §5) |

`dotenv` **no** sobreescribe variables ya definidas por el entorno, así que el
`PORT` que inyecta el hosting tiene prioridad sobre cualquier `.env`.

---

## 3. Render (recomendado)

Render ofrece un **Web Service** con **Persistent Disk**: es la opción más simple
para este stack.

> ⚠️ Los discos persistentes **requieren un plan pago** (Starter o superior) y
> solo se pueden montar en **una instancia**. Nada de autoescalado ni varias
> réplicas: SQLite no soporta escrituras concurrentes entre procesos.

### 3.1 Con Blueprint (usa `render.yaml`)

El repo incluye [`render.yaml`](../render.yaml). En Render:

1. **New → Blueprint** y elegí el repositorio.
2. Revisá `name` (define el dominio `<name>.onrender.com`), `region` y `plan`.
3. Completá `ADMIN_EMAIL` y `ADMIN_PASSWORD` cuando las pida.
4. **Apply**.

### 3.2 Manual (dashboard)

1. **New → Web Service** y conectá el repositorio.
2. Configurá:
   - **Runtime:** Node
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `node dist/shop-tex/server/server.mjs`
   - **Health Check Path:** `/`
   - **Instance Type:** Starter (`0.5c-512mb`; los discos requieren plan pago)
3. **Add Disk**: nombre `novastore-data`, **Mount Path** `/var/lib/novastore`,
   tamaño `1 GB`.
4. **Environment → Add Environment Variable** con las variables de §2.
5. **Create Web Service**.

### 3.3 Qué pasa en el primer deploy

1. El **build** corre en un filesystem efímero (el disco **no** está montado
   todavía). `npm run build` prerenderiza `/`, `/login` y `/register`, y **no
   necesita la base de datos**.
2. Al **arrancar**, Render monta el disco en `/var/lib/novastore`; la app crea
   el archivo SQLite, las tablas y siembra el administrador.
3. A partir de ahí, todo lo escrito en `/var/lib/novastore` **sobrevive** a
   deploys y reinicios.

---

## 4. Dominio propio

1. En Render: **Settings → Custom Domain → Add**.
2. Creá el registro DNS que te indique (normalmente un `CNAME`).
3. Actualizá estas variables con el dominio real y redeployá:
   - `NG_ALLOWED_HOSTS=tudominio.com,www.tudominio.com`
   - `ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com`

Render emite el certificado TLS automáticamente. **HTTPS es obligatorio**: la
cookie de producción usa el prefijo `__Host-`, que exige `Secure`.

---

## 5. El error "Host is not allowed" (se olvida siempre)

El SSR de Angular valida el encabezado `Host` contra una lista permitida.
`angular.json` trae `security.allowedHosts: ["localhost", "127.0.0.1"]`, así que
en producción el SSR responde **400** para tu dominio.

Hay dos soluciones:

- **Sin recompilar (recomendado):** definir `NG_ALLOWED_HOSTS` con tu dominio.
  El motor SSR lee esa variable y la **fusiona** con la de `angular.json`.
- **En el build:** agregar el dominio a `security.allowedHosts` en
  `angular.json` y recompilar.

---

## 6. Verificación post-deploy

| Comprobación | Resultado esperado |
| --- | --- |
| `GET https://tudominio.com/` | `200` y HTML de la portada (sin 400) |
| `GET https://tudominio.com/api/auth/me` sin cookie | `401` |
| Login con `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `200` y cookie `__Host-novastore_session` |
| Recargar la página tras el login | La sesión persiste (cookie `secure` + HTTPS) |
| Reiniciar el servicio | Los usuarios/sesiones siguen ahí (disco persistente) |

---

## 7. Backups de SQLite

```bash
# Copia consistente aunque la app esté corriendo
sqlite3 /var/lib/novastore/novastore.db ".backup '/backups/novastore-$(date +%F).db'"
```

Programalo con `cron` y guardá también el `.env` **fuera** del repositorio.

---

## 8. Gotchas

- **`node_modules` de Windows no sirve** en el servidor (módulo nativo).
- **El disco solo se monta en runtime.** No escribas la base ni corras
  migraciones durante el build; el contenido se descarta.
- **Todo lo que esté fuera del disco es efímero.** Por eso `DATABASE_PATH` debe
  apuntar dentro del `mountPath`.
- **Un solo disco = una sola instancia.** Sin autoescalado.
- **Los deploys no son instantáneos:** el arranque vuelve a montar el disco y la
  app se reinicia (breve corte).
- **`DATABASE_PATH` debe ser absoluta y escribible** por el usuario del servicio.
- **Netlify/Vercel no sirven** para este backend (serverless, sin disco).

---

## 9. Problemas comunes

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `sh: 1: ng: not found` en el build | `NODE_ENV=production` hace que npm **omita las devDependencies**, y `@angular/cli` es una de ellas | Build command: `npm ci --include=dev && npm run build` |
| El deploy "pasa" pero el servicio no responde / health check falla | `src/server.ts` no arranca Express (`app.listen`) | Asegurate de que `ssr.entry` apunte al servidor Express, no a un handler serverless |
| `400 Host is not allowed` | Falta el dominio en la lista permitida | Definí `NG_ALLOWED_HOSTS` (ver §5) |
| Login funciona pero la sesión no persiste | Sin HTTPS o cookie mal configurada | Entrá por `https://` y verificá `NODE_ENV=production` |
| Los datos desaparecen tras cada deploy | `DATABASE_PATH` fuera del disco persistente | Apuntalo dentro del `mountPath` del disco |
| `403 ORIGIN_NOT_ALLOWED` en llamadas a `/api` | Falta el dominio en `ALLOWED_ORIGINS` | Agregalo con esquema `https://` |

---

## 10. Alternativas

| Opción | Cuándo conviene |
| --- | --- |
| **Render** (Web Service + Disk) | La más simple; ver §3 |
| **Railway** (Volume) | Similar a Render, cómodo desde el repo |
| **Fly.io** (Volumes) | Buen precio; `better-sqlite3` compila en su builder |
| **VPS** (Hetzner/DigitalOcean + nginx + systemd) | Más control y el más barato a largo plazo |
| **Docker** en cualquier nube | Portable; multi-stage con volumen para `/data` |

Para el VPS, un `Dockerfile` multi-stage (compila el nativo dentro de Linux) y
una unidad `systemd` + `nginx` como reverse proxy con `certbot` son el camino
habitual. El resto de la configuración (variables, build y start) es idéntica.
