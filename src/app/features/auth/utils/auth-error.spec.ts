import { HttpErrorResponse } from '@angular/common/http';
import { getAuthErrorMessage } from './auth-error';

function httpError(status: number, body: unknown = null): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

describe('getAuthErrorMessage', () => {
  it('explains a connection failure', () => {
    expect(getAuthErrorMessage(httpError(0), 'login')).toContain('No se pudo conectar');
  });

  it('hints how to start the API in development for server errors', () => {
    const message = getAuthErrorMessage(httpError(500), 'register');

    expect(message).toContain('El servidor no pudo completar');
    expect(message).toContain('puerto 4000');
  });

  it('returns the server message for rate limiting', () => {
    const message = getAuthErrorMessage(
      httpError(429, { error: { code: 'RATE_LIMITED', message: 'Esperá un momento.' } }),
      'login',
    );

    expect(message).toBe('Esperá un momento.');
  });

  it('keeps login errors generic', () => {
    const message = getAuthErrorMessage(
      httpError(401, { error: { code: 'INVALID_CREDENTIALS', message: 'Interno.' } }),
      'login',
    );

    expect(message).toContain('correo o la contraseña');
    expect(message).not.toContain('Interno');
  });

  it('explains a duplicate email on register', () => {
    const message = getAuthErrorMessage(
      httpError(409, { error: { code: 'EMAIL_TAKEN', message: 'Interno.' } }),
      'register',
    );

    expect(message).toContain('Ya existe una cuenta');
  });

  it('uses the server validation message on register', () => {
    const message = getAuthErrorMessage(
      httpError(422, { error: { code: 'VALIDATION_ERROR', message: 'Revisá los datos.' } }),
      'register',
    );

    expect(message).toBe('Revisá los datos.');
  });

  it('falls back for unknown errors', () => {
    expect(getAuthErrorMessage(new Error('boom'), 'login')).toContain('error inesperado');
  });
});
