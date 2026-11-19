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

> **¿Solo querés mostrar la app?** Render **free** sirve como demo (proceso Node,
> sin disco): los datos se borran en cada deploy. Ver §3.1. Para conservarlos sin
> pagar, ver §10.

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
| `DATABASE_PATH` | `data/novastore.db` (free) · `/var/lib/novastore/novastore.db` (disco) | Ver §3. En free es **efímera**; con disco, **absoluta** dentro del `mountPath` |
| `ADMIN_EMAIL` | tu correo | Se usa solo al crear la base por primera vez |
| `ADMIN_PASSWORD` | contraseña fuerte | Ídem; cambiarla después no actualiza el admin existente |
| `SESSION_TTL_DAYS` | `7` | Duración de la sesión |
| `ALLOWED_ORIGINS` | `https://tudominio.com` | Con esquema `https://`; separá varios por coma |
| `TRUST_PROXY` | `true` | Detrás de un proxy inverso (Render, nginx, etc.) |
| `NG_ALLOWED_HOSTS` | `tudominio.com` | Hosts permitidos por el SSR de Angular (ver §5) |

`dotenv` **no** sobreescribe variables ya definidas por el entorno, así que el
`PORT` que inyecta el hosting tiene prioridad sobre cualquier `.env`.

---

## 3. Render

Render ofrece un **Web Service**. Hay dos modalidades según querés pagar o no.

### 3.1 Modo free (demo, datos efímeros)

Ideal para **mostrar la app** sin costo. El build y el arranque funcionan, pero:

- **El filesystem es efímero:** usuarios, sesiones, productos y pedidos se
  **borran en cada deploy/reinicio**.
- **El servicio se suspende** a los 15 min sin tráfico y tarda ~1 min en
  despertar.
- **No admite discos** (eso requiere plan pago).

Configuración:

1. **New → Blueprint** y elegí el repositorio (usa [`render.yaml`](../render.yaml),
   que ya viene con `plan: free` y `DATABASE_PATH=data/novastore.db`).
2. Completá `ADMIN_EMAIL` y `ADMIN_PASSWORD` cuando las pida. **Recordá:** el admin
   se recrea en cada arranque porque la base se borra.
3. **Apply**.

### 3.2 Modo persistente (plan pago, recomendado para producción)

Con un **Persistent Disk**, los datos sobreviven a deploys y reinicios.

> ⚠️ Los discos **requieren plan pago** (Starter o superior) y solo se pueden
> montar en **una instancia**. Nada de autoescalado ni varias réplicas: SQLite no
> soporta escrituras concurrentes entre procesos.

En el [`render.yaml`](../render.yaml): cambiá `plan: free` por
`plan: 0.5c-512mb`, apuntá `DATABASE_PATH` a `/var/lib/novastore/novastore.db` y
descomentá el bloque `disk`.

### 3.3 Manual (dashboard)

1. **New → Web Service** y conectá el repositorio.
2. Configurá:
   - **Runtime:** Node
   - **Build Command:** `npm ci --include=dev && npm run build`
   - **Start Command:** `node dist/shop-tex/server/server.mjs`
   - **Health Check Path:** `/`
   - **Instance Type:** Free (demo) o Starter (`0.5c-512mb`, para disco)
3. **Environment → Add Environment Variable** con las variables de §2.
4. *(Solo modo persistente)* **Add Disk**: nombre `novastore-data`,
   **Mount Path** `/var/lib/novastore`, tamaño `1 GB`, y `DATABASE_PATH` dentro
   de esa ruta.
5. **Create Web Service**.

### 3.4 Qué pasa en el primer deploy

1. El **build** corre en un filesystem efímero. `npm run build` prerenderiza `/`,
   `/login` y `/register`, y **no necesita la base de datos**.
2. Al **arrancar**, la app crea el archivo SQLite, las tablas y siembra el
   administrador.
3. Con **disco**, todo lo escrito en `/var/lib/novastore` **sobrevive** a deploys
   y reinicios. **Sin disco**, se reinicia de cero en cada arranque.

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
| Reiniciar el servicio *(solo con disco)* | Los usuarios/sesiones siguen ahí |

> En **modo free** los datos se pierden en cada deploy/reinicio: el admin se
> vuelve a sembrar desde `ADMIN_EMAIL`/`ADMIN_PASSWORD`, así que el login siempre
> funciona, pero los registros previos desaparecen.

---

## 7. Backups de SQLite

*(Solo aplica en modo persistente: en free no hay nada que respaldar.)*

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
  apuntar dentro del `mountPath` (o, en free, a una ruta relativa escribible).
- **Un solo disco = una sola instancia.** Sin autoescalado.
- **Los deploys no son instantáneos:** el arranque vuelve a montar el disco y la
  app se reinicia (breve corte).
- **`DATABASE_PATH` debe ser escribible** por el usuario del servicio.
- **Netlify/Vercel no sirven** para este backend (serverless, sin disco).

---

## 9. Problemas comunes

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `sh: 1: ng: not found` en el build | `NODE_ENV=production` hace que npm **omita las devDependencies**, y `@angular/cli` es una de ellas | Build command: `npm ci --include=dev && npm run build` |
| `ENOENT: mkdir '/var/lib/novastore'` en el build | El prerender cargaba el entry del servidor y abría SQLite, pero el disco no está montado durante el build | Ya resuelto: `src/server.ts` solo monta la API/DB cuando es el proceso servidor (`isMainModule`/PM2) |
| `EACCES: permission denied, mkdir '/var/lib/novastore'` al arrancar | `DATABASE_PATH` apunta a una ruta del disco, pero **el disco no está montado** (modo free o falta agregarlo) | Montá el Disk (§3.2) o usá `DATABASE_PATH=data/novastore.db` en modo free (§3.1) |
| El deploy "pasa" pero el servicio no responde / health check falla | `src/server.ts` no arranca Express (`app.listen`) | Asegurate de que `ssr.entry` apunte al servidor Express, no a un handler serverless |
| `400 Host is not allowed` | Falta el dominio en la lista permitida | Definí `NG_ALLOWED_HOSTS` (ver §5) |
| Login funciona pero la sesión no persiste | Sin HTTPS o cookie mal configurada | Entrá por `https://` y verificá `NODE_ENV=production` |
| Los datos desaparecen tras cada deploy | `DATABASE_PATH` fuera del disco persistente | Apuntalo dentro del `mountPath` del disco |
| `403 ORIGIN_NOT_ALLOWED` en llamadas a `/api` | Falta el dominio en `ALLOWED_ORIGINS` | Agregalo con esquema `https://` |

---

## 10. Alternativas (y cómo seguir gratis)

Los **PaaS gratuitos** (Render free, Netlify, Vercel, Koyeb) no dan disco
persistente: sirven para demo, no para conservar datos. Si querés persistencia
sin pagar, la salida es una **máquina con disco real**:

| Opción | Costo | Persistente | Cambios de código |
| --- | --- | --- | --- |
| **Render free** (§3.1) | $0 | ❌ efímero | Ninguno |
| **VM gratis** (Oracle Cloud Always Free / GCP `e2-micro`) | $0 | ✅ | Ninguno |
| **Tu PC/Raspberry + Cloudflare Tunnel** | $0 | ✅ (tu disco) | Ninguno |
| **PaaS + DB externa** (Turso/Neon) | $0 | ✅ gestionada | **Alto** (capa de datos async) |
| **Render + Disk** (§3.2) | pago | ✅ | Ninguno |
| **Railway** (Volume) / **Fly.io** (Volumes) | pago | ✅ | Ninguno |
| **VPS** (Hetzner/DigitalOcean + nginx + systemd) | pago, barato | ✅ | Ninguno |

**Oracle Cloud Always Free** da una VM ARM (Ampere A1) más Block Volume gratis, y
**GCP** una `e2-micro` con disco de 30 GB. En ambos, el despliegue es el camino de
VPS: `npm ci --include=dev && npm run build`, `node dist/shop-tex/server/server.mjs`,
`systemd`, `nginx` y HTTPS con `certbot`. Piden tarjeta para verificar identidad
(aunque no cobran).

Un `Dockerfile` multi-stage (que compila el nativo dentro de Linux) también es
portable a cualquier nube con volumen para `/data`.
