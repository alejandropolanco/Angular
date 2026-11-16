import cookieParser from 'cookie-parser';
import express, { type ErrorRequestHandler, type Express } from 'express';
import { createAuthRouter } from './auth';
import { isProduction } from './config';
import { apiRateLimiter, applySecurityHeaders, originGuard } from './security';

export function registerApi(app: Express): void {
  applySecurityHeaders(app);

  app.set('json escape', true);

  app.use('/api', cookieParser(), originGuard(), apiRateLimiter, express.json({ limit: '10kb' }));

  app.use('/api/auth', createAuthRouter());

  app.use('/api', (_request, response) => {
    response.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'El recurso solicitado no existe.',
      },
    });
  });

  const apiErrorHandler: ErrorRequestHandler = (error, _request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status: unknown }).status)
        : 500;

    if (status === 413) {
      response.status(413).json({
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'El cuerpo de la solicitud es demasiado grande.',
        },
      });
      return;
    }

    if (status === 400) {
      response.status(400).json({
        error: {
          code: 'INVALID_JSON',
          message: 'El cuerpo de la solicitud no es válido.',
        },
      });
      return;
    }

    console.error('[api]', isProduction ? (error as Error).message : error);
    response.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ocurrió un error inesperado. Intentá de nuevo.',
      },
    });
  };

  app.use(apiErrorHandler);
}
