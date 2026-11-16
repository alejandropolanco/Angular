# Auditoría de seguridad — NovaStore

**Fecha:** 2 de noviembre de 2026
**Alcance:** API de autenticación (`/api/auth/*`), sesiones, base SQLite, configuración de Express/SSR, dependencias y flujo de registro/login del frontend.
**Entorno auditado:** Node.js 24.13.1, npm 11.8.0, Angular 21.2.25, Express 5.3.0, better-sqlite3 13.0.3.

> Este documento describe lo implementado y los riesgos que quedan abiertos. No reemplaza una revisión profesional ni un pentest, pero deja trazabilidad de las decisiones y de las verificaciones ejecutadas.

## 1. Resumen ejecutivo

La autenticación dejó de ser una demo de `localStorage` y ahora se apoya en una API real con sesiones persistidas en SQLite. Las medidas principales son: hash bcrypt de contraseñas, tokens de sesión aleatorios con hash SHA-256 en base, cookie `httpOnly`/`SameSite`, validación de entrada con Zod, consultas preparadas, rate limiting, allowlist de orígenes y cabeceras de seguridad con Helmet.

Resultado de dependencias:

| Comando                | Resultado                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `npm audit --omit=dev` | **0 vulnerabilidades**                                                               |
| `npm audit`            | **16 moderadas**, todas en la cadena de desarrollo de `@angular/cli` (build tooling) |

No hay vulnerabilidades conocidas en dependencias que se ejecuten en producción. Las 16 moderadas de desarrollo no se envían al bundle ni al servidor; el fix sugerido por npm implicaría un downgrade inválido a `@angular/cli@17.3.17`. Se recomienda reevaluar al migrar a Angular 22.

Verificaciones ejecutadas:

| Prueba                                                         | Resultado             |
| -------------------------------------------------------------- | --------------------- |
| Smoke test de API en desarrollo                                | 11/11 checks          |
| Smoke test de SSR + API sobre build de producción              | 13/13 checks          |
| Cabeceras de producción (HSTS, CSP, cookie `Secure`/`__Host-`) | Verificado            |
| Suite unitaria                                                 | 18 archivos, 74 tests |

## 2. Arquitectura de autenticación

- `POST /api/auth/register`: valida nombre, email, contraseña y aceptación de términos; crea el usuario y **no** inicia sesión.
- `POST /api/auth/login`: verifica credenciales, elimina una sesión previa si existía y emite una nueva.
- `GET /api/auth/me`: devuelve el usuario de la sesión activa o `401`.
- `POST /api/auth/logout`: borra la sesión en base y limpia la cookie.
- En desarrollo la API corre en `:4000` con `tsx watch` y Angular en `:4200` con proxy `/api`.
- En producción `src/server.ts` monta `/api` antes de los estáticos y del render SSR, en un único proceso.

## 3. Medidas implementadas

### 3.1 Contraseñas

- Hash con **bcrypt, coste 12** (`bcryptjs`); nunca se almacena ni se registra la contraseña en claro.
- Política mínima: 8–72 caracteres, al menos una letra y un número. El máximo de 72 respeta el límite de bcrypt.
- La confirmación de contraseña se valida en el cliente; el servidor recibe solo la contraseña definitiva.
- En login se compara contra un **hash dummy** cuando el email no existe, para reducir diferencias de tiempo que permitan enumerar cuentas.
- El error de login es genérico: `INVALID_CREDENTIALS` no distingue entre email inexistente y contraseña incorrecta.

### 3.2 Sesiones

- Token de **32 bytes aleatorios** (`crypto.randomBytes`) codificado en base64url.
- En la base solo se guarda el **hash SHA-256** del token; un volcado de la DB no permite reutilizar sesiones.
- Cookie `httpOnly`, `sameSite=lax`, `path=/`, `maxAge` de 7 días configurable con `SESSION_TTL_DAYS`.
- En producción: `secure=true` y nombre con prefijo `__Host-` (`__Host-novastore_session`), que impide fijar la cookie desde un subdominio.
- `logout` elimina la fila de la sesión, no solo la cookie.
- Limpieza de sesiones expiradas al arrancar y cada hora.

### 3.3 Validación y errores

- Esquemas **Zod** para registro y login; el email se normaliza a minúsculas y se recorta.
- Validación de nombre con allowlist de letras Unicode, espacios, apóstrofes, puntos y guiones.
- Respuestas de error uniformes con `error.code` y `error.message`; los detalles por campo van en `error.fields` solo para `422`.
- Límite de body JSON de **10 kB**; `400` para JSON inválido y `413` para payload demasiado grande.
- En producción el handler de errores no devuelve stack traces ni mensajes internos.

### 3.4 Base de datos

- SQLite con `better-sqlite3`, `journal_mode=WAL`, `foreign_keys=ON` y `busy_timeout`.
- **Consultas preparadas** en todas las operaciones con datos de usuario.
- Restricción `UNIQUE COLLATE NOCASE` en email y `CHECK` en `role`.
- Borrado en cascada de sesiones al eliminar un usuario.
- La ruta de la DB se configura con `DATABASE_PATH` y los archivos `*.db*` están ignorados por Git.

### 3.5 Red y cabeceras

- `helmet` con CSP: `default-src 'self'`, `script-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, `form-action 'self'`.
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`.
- `crossOriginOpenerPolicy` y `crossOriginResourcePolicy` en `same-origin`; `crossOriginEmbedderPolicy` desactivado para no romper recursos del sitio.
- HSTS (`max-age=31536000; includeSubDomains`) solo en producción.
- `x-powered-by` deshabilitado.
- `originGuard`: si la solicitud trae `Origin`, debe estar en `ALLOWED_ORIGINS`; si no, `403`.
- Rate limiting: en producción 300 solicitudes/15 min por IP para `/api`, 10 intentos/15 min para login y 5 registros/hora; en desarrollo los cupos son más amplios (1000, 100 y 100) para no bloquear pruebas.
- `trust proxy` desactivado por defecto y activable solo con `TRUST_PROXY=true` detrás de un proxy confiable.

### 3.6 Frontend

- `AuthService` mantiene el estado con signals y consulta `/api/auth/me` al iniciar la app.
- Interceptor que agrega `withCredentials` a las llamadas a `/api`.
- Guards `authGuard`, `guestGuard` y `rootRedirectGuard` basados en el estado real de la sesión.
- La cookie de sesión **no es accesible desde JavaScript**; el frontend nunca guarda el token.
- Tras registrarse se redirige a `/login?registered=1` y no se crea sesión automáticamente.

## 4. Pruebas de seguridad ejecutadas

### 4.1 API en desarrollo (11/11)

- `GET /api/auth/me` sin sesión → `401`.
- Registro con payload inválido → `422` con errores por campo.
- Registro válido → `201` y **sin** cookie de sesión.
- Registro duplicado → `409 EMAIL_TAKEN`.
- Login con contraseña incorrecta → `401` genérico.
- Login válido → `200` con cookie `HttpOnly` y `SameSite=Lax`.
- `GET /api/auth/me` con sesión → `200`.
- Login desde origen no permitido → `403 ORIGIN_NOT_ALLOWED`.
- Logout → `204`.
- `GET /api/auth/me` tras logout → `401`.
- Cabeceras de seguridad presentes (CSP, `nosniff`, `X-Frame-Options`).

### 4.2 SSR de producción (13/13)

- `/login` y `/register` se sirven prerenderizados con el HTML esperado.
- CSP del HTML no incluye `'unsafe-inline'` en `script-src`.
- `nosniff`, `X-Frame-Options` y ausencia de `X-Powered-By`.
- Flujo completo registro → login → `/me` → logout contra el servidor SSR.
- Ruta desconocida de `/api` → `404` JSON uniforme.
- Origen no permitido → `403`.

### 4.3 Flags de producción

- HSTS presente con `max-age=31536000; includeSubDomains`.
- CSP con `upgrade-insecure-requests`.
- Cookie emitida: `__Host-novastore_session=…; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax`.

## 5. Riesgos residuales

| #   | Riesgo                                                                                      | Severidad         | Estado / mitigación                                                                                                                            | Recomendación                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Admin con contraseña por defecto** (`admin@gmail.com` / `1234`).                          | Alta              | El seed solo crea el admin si no existe; `ADMIN_PASSWORD` **solo aplica en la primera creación**. Una DB ya creada conserva la clave anterior. | En producción definir `ADMIN_PASSWORD` antes del primer arranque y rotar la clave si la DB ya existía. A futuro, forzar cambio en el primer login. |
| 2   | **CSRF sin token**: la protección depende de `SameSite=Lax` + `Origin` allowlist.           | Baja              | `SameSite=Lax` impide el envío de la cookie en POST cross-site y `originGuard` rechaza orígenes desconocidos. No hay token CSRF explícito.     | Si se agregan formularios cross-site o se baja `SameSite`, implementar double-submit token.                                                        |
| 3   | **Rate limiting en memoria**: se reinicia con el proceso y no se comparte entre instancias. | Media             | Suficiente para un despliegue de una sola instancia.                                                                                           | Usar almacén compartido (Redis) si se escala horizontalmente.                                                                                      |
| 4   | **bcrypt síncrono** (`hashSync`/`compareSync`) bloquea el event loop.                       | Media             | Coste 12 y límites de login/registro acotan el abuso, pero un pico de intentos puede elevar la latencia.                                       | Migrar a las variantes asíncronas o mover el hash a un worker.                                                                                     |
| 5   | **Enumeración de emails en registro**: `409 EMAIL_TAKEN` confirma si una cuenta existe.     | Baja              | Es un compromiso de usabilidad habitual. El login sí es genérico.                                                                              | Si se prioriza privacidad, responder siempre `201` y enviar email de “cuenta existente”.                                                           |
| 6   | **Sin verificación de email**: cualquiera puede registrarse con un correo ajeno.            | Media             | Aceptado para esta etapa; no hay acciones sensibles asociadas a la cuenta.                                                                     | Etapa 2: token de verificación con expiración y reenvío limitado.                                                                                  |
| 7   | **Sin recuperación de contraseña**.                                                         | Media             | Aceptado para esta etapa.                                                                                                                      | Etapa 2: token de un solo uso, expiración corta y mensaje genérico.                                                                                |
| 8   | **Sesiones de 7 días sin timeout por inactividad** ni rotación fuera del login.             | Baja              | TTL configurable; logout invalida en servidor.                                                                                                 | Evaluar TTL más corto y rotación periódica para cuentas admin.                                                                                     |
| 9   | **Sin registro de eventos de autenticación** (login fallido, bloqueo, logout).              | Baja              | Dificulta la detección de ataques.                                                                                                             | Agregar logging estructurado sin datos sensibles.                                                                                                  |
| 10  | **CSP permite `'unsafe-inline'` en estilos**.                                               | Baja              | Necesario por estilos inline de Angular/PrimeNG. `script-src` sí está restringido a `'self'`.                                                  | Migrar a nonces/hashes si se endurece la política.                                                                                                 |
| 11  | **TLS no lo termina la app**: depende del proxy inverso.                                    | Media (operativa) | `secure` + `__Host-` + HSTS reducen el riesgo de downgrade, pero la app no fuerza HTTPS por sí sola.                                           | Terminar TLS en el proxy y redirigir HTTP→HTTPS.                                                                                                   |
| 12  | **`ALLOWED_ORIGINS` mal configurado** en producción.                                        | Media (operativa) | Si falta el dominio real, login y registro fallan con `403` (falla cerrado, no abierto).                                                       | Configurar el dominio exacto (esquema + host + puerto) antes de desplegar.                                                                         |
| 13  | **Archivo SQLite y backups**: contiene hashes de contraseñas y de sesiones.                 | Media (operativa) | Está fuera de Git y en `data/`.                                                                                                                | Restringir permisos del archivo y cifrar backups.                                                                                                  |
| 14  | **Dependencias de desarrollo** con 16 vulnerabilidades moderadas.                           | Baja              | Solo afectan tooling de build; no se despliegan.                                                                                               | Reevaluar al migrar a Angular 22; no aplicar el downgrade sugerido.                                                                                |

## 6. Configuración recomendada para producción

```bash
NODE_ENV=production
PORT=4000
ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=<contraseña fuerte y única>
ALLOWED_ORIGINS=https://tudominio.com
DATABASE_PATH=/var/lib/novastore/novastore.db
SESSION_TTL_DAYS=7
TRUST_PROXY=true   # solo detrás de un proxy confiable
```

Checklist mínimo:

- [ ] TLS terminado en el proxy y redirección HTTP→HTTPS.
- [ ] `ADMIN_PASSWORD` definido **antes** del primer arranque.
- [ ] `ALLOWED_ORIGINS` con el dominio real.
- [ ] Permisos del archivo SQLite limitados al usuario del servicio.
- [ ] Backups cifrados y probados.
- [ ] Monitoreo de `429` y de errores `500`.
- [ ] Rotación de la contraseña del admin si la DB se creó con la clave por defecto.

## 7. Etapa 2 propuesta

1. Verificación de email con token de un solo uso y expiración.
2. Recuperación de contraseña con respuesta genérica y límites por cuenta/IP.
3. Cambio de contraseña autenticado que invalide las demás sesiones.
4. Migrar bcrypt a operaciones asíncronas o worker.
5. Rate limiting compartido y logging estructurado de eventos de autenticación.
6. Evaluar token CSRF explícito si cambia el modelo de cookies.
7. Revisar dependencias al migrar a Angular 22.
