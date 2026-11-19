import type { Express, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { isProduction, serverConfig } from './config';

export function applySecurityHeaders(app: Express): void {
  app.disable('x-powered-by');
  app.set('trust proxy', serverConfig.trustProxy ? 1 : false);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
          formAction: ["'self'"],
          ...(isProduction ? { upgradeInsecureRequests: [] } : { upgradeInsecureRequests: null }),
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      hsts: isProduction ? { maxAge: 31_536_000, includeSubDomains: true, preload: false } : false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
}

export function originGuard(): RequestHandler {
  return (request, response, next) => {
    const origin = request.get('origin');

    if (origin && !serverConfig.allowedOrigins.has(origin)) {
      response.status(403).json({
        error: {
          code: 'ORIGIN_NOT_ALLOWED',
          message: 'El origen de la solicitud no está permitido.',
        },
      });
      return;
    }

    next();
  };
}

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 300 : 1000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Demasiadas solicitudes. Esperá unos minutos e intentá de nuevo.',
      },
    });
  },
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 10 : 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Demasiados intentos de inicio de sesión. Esperá unos minutos.',
      },
    });
  },
});

export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isProduction ? 5 : 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Se alcanzó el límite de registros. Intentá más tarde.',
      },
    });
  },
});

export const authenticationCookieName = serverConfig.sessionCookieName;
