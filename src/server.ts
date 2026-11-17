import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import {
  getAllowedHosts,
  getContext,
  getTrustProxyHeaders,
} from '@netlify/angular-runtime/app-engine.js';

const angularAppEngine = new AngularAppEngine({
  allowedHosts: getAllowedHosts(),
  trustProxyHeaders: getTrustProxyHeaders(),
});

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;

  // The standalone Express API requires its own deployment and persistent storage.
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    return Response.json(
      { error: { code: 'SERVICE_UNAVAILABLE', message: 'API deployment is not configured.' } },
      { status: 503 },
    );
  }

  const result = await angularAppEngine.handle(request, getContext());
  return result || new Response('Not found', { status: 404 });
}

/** Request handler used by the Angular CLI during development and prerendering. */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
