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
  allowedOrigins: new Set(
    (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:4200,http://localhost:4000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
} as const;
