import 'dotenv/config';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

/**
 * La API y la base de datos solo se montan cuando este módulo es el proceso
 * servidor (producción o PM2). El build de Angular carga este módulo para
 * extraer rutas y prerenderizar, y en ese momento el disco de datos todavía no
 * está montado: si se abriera SQLite acá, el build fallaría con ENOENT.
 */
const isServerProcess = isMainModule(import.meta.url) || Boolean(process.env['pm_id']);

if (isServerProcess) {
  const { registerApi } = await import('./server/api/app');
  registerApi(app);
}

const angularApp = new AngularNodeAppEngine();

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isServerProcess) {
  const { cleanupExpiredSessions } = await import('./server/api/sessions');

  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });

  cleanupExpiredSessions();

  const cleanupTimer = setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
  cleanupTimer.unref();
}
