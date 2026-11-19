export const isProduction = process.env['NODE_ENV'] === 'production';

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const serverConfig = {
  isProduction,
  port: readNumber(process.env['PORT'], 4000),
  databasePath: process.env['DATABASE_PATH'] ?? 'data/novastore.db',
  sessionCookieName: isProduction ? '__Host-novastore_session' : 'novastore_session',
  sessionTtlMs: readNumber(process.env['SESSION_TTL_DAYS'], 7) * 24 * 60 * 60 * 1000,
  adminEmail: (process.env['ADMIN_EMAIL'] ?? 'admin@gmail.com').trim().toLowerCase(),
  adminPassword: process.env['ADMIN_PASSWORD'] ?? '1234',
  // Detrás de un proxy inverso (Render, nginx), los datos reales de la petición
  // llegan en los encabezados `x-forwarded-*`.
  trustProxy: process.env['TRUST_PROXY'] === 'true',
  allowedOrigins: new Set(
    [
      ...(process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:4200,http://localhost:4000').split(
        ',',
      ),
      // Render expone la URL pública del servicio; la agregamos sola para no
      // tener que hardcodear el dominio en ALLOWED_ORIGINS.
      process.env['RENDER_EXTERNAL_URL'],
    ]
      .map((origin) => origin?.trim())
      .filter((origin): origin is string => Boolean(origin)),
  ),
} as const;
