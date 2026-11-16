import { compareSync } from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { serverConfig } from './config';
import { createUser, DUMMY_PASSWORD_HASH, findUserByEmail, toPublicUser } from './db';
import { createSession, deleteSession, getSessionUser, sessionCookieOptions } from './sessions';
import { loginRateLimiter, registerRateLimiter } from './security';

const nameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres.')
  .max(80, 'El nombre no puede superar los 80 caracteres.')
  .regex(/^[\p{L}\p{M}\s'.-]+$/u, 'El nombre contiene caracteres no permitidos.');

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'El correo es demasiado largo.')
  .email('Escribí un correo válido.');

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(72, 'La contraseña no puede superar los 72 caracteres.')
  .regex(/[A-Za-z]/, 'La contraseña debe incluir al menos una letra.')
  .regex(/[0-9]/, 'La contraseña debe incluir al menos un número.');

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z
    .boolean()
    .refine((value) => value, 'Tenés que aceptar los términos para crear una cuenta.'),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria.').max(72),
});

function readSessionToken(cookies: unknown): string | undefined {
  if (typeof cookies !== 'object' || cookies === null) {
    return undefined;
  }

  const token = (cookies as Record<string, unknown>)[serverConfig.sessionCookieName];
  return typeof token === 'string' ? token : undefined;
}

function validationError(response: import('express').Response, error: z.ZodError): void {
  response.status(422).json({
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Revisá los datos ingresados.',
      fields: z.flattenError(error).fieldErrors,
    },
  });
}

export function createAuthRouter(): Router {
  const router = Router();

  router.use((_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });

  router.post('/register', registerRateLimiter, (request, response) => {
    const parsed = registerSchema.safeParse(request.body);

    if (!parsed.success) {
      validationError(response, parsed.error);
      return;
    }

    const { name, email, password } = parsed.data;

    if (findUserByEmail(email)) {
      response.status(409).json({
        error: {
          code: 'EMAIL_TAKEN',
          message: 'Ya existe una cuenta con ese correo electrónico.',
        },
      });
      return;
    }

    try {
      const user = createUser({ name, email, password });
      response.status(201).json({ user });
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code: unknown }).code)
          : '';

      if (code.startsWith('SQLITE_CONSTRAINT')) {
        response.status(409).json({
          error: {
            code: 'EMAIL_TAKEN',
            message: 'Ya existe una cuenta con ese correo electrónico.',
          },
        });
        return;
      }

      throw error;
    }
  });

  router.post('/login', loginRateLimiter, (request, response) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      validationError(response, parsed.error);
      return;
    }

    const { email, password } = parsed.data;
    const user = findUserByEmail(email);
    const passwordHash = user?.password_hash ?? DUMMY_PASSWORD_HASH;
    const passwordMatches = compareSync(password, passwordHash);

    if (!user || !passwordMatches) {
      response.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'El correo o la contraseña no son correctos.',
        },
      });
      return;
    }

    deleteSession(readSessionToken(request.cookies));
    const token = createSession(user.id);
    response.cookie(serverConfig.sessionCookieName, token, sessionCookieOptions());
    response.json({ user: toPublicUser(user) });
  });

  router.get('/me', (request, response) => {
    const user = getSessionUser(readSessionToken(request.cookies));

    if (!user) {
      response.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'No hay una sesión activa.',
        },
      });
      return;
    }

    response.json({ user });
  });

  router.post('/logout', (request, response) => {
    deleteSession(readSessionToken(request.cookies));
    response.clearCookie(serverConfig.sessionCookieName, {
      httpOnly: true,
      secure: serverConfig.isProduction,
      sameSite: 'lax',
      path: '/',
    });
    response.status(204).end();
  });

  return router;
}
