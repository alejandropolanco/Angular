import { HttpErrorResponse } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { ApiErrorBody } from '../models/auth.model';

type AuthErrorContext = 'login' | 'register';

export function getAuthErrorMessage(error: unknown, context: AuthErrorContext): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado. Intentá de nuevo.';
  }

  const body = error.error as ApiErrorBody | null;
  const code = body?.error?.code;
  const serverMessage = body?.error?.message;

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Verificá tu conexión e intentá de nuevo.';
  }

  if (error.status === 429) {
    return serverMessage ?? 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.';
  }

  if (context === 'login') {
    if (error.status === 401 || code === 'INVALID_CREDENTIALS') {
      return 'El correo o la contraseña no son correctos. Inténtalo de nuevo.';
    }
  }

  if (context === 'register') {
    if (error.status === 409 || code === 'EMAIL_TAKEN') {
      return 'Ya existe una cuenta con ese correo electrónico.';
    }

    if (error.status === 422) {
      return serverMessage ?? 'Revisá los datos ingresados e intentá de nuevo.';
    }
  }

  if (error.status >= 500) {
    const devHint = isDevMode()
      ? ' Si estás en desarrollo, verificá que la API esté corriendo en el puerto 4000 con "npm start".'
      : '';

    return `El servidor no pudo completar la operación. Intentá de nuevo en unos minutos.${devHint}`;
  }

  return serverMessage ?? 'No se pudo completar la operación. Intentá de nuevo.';
}
