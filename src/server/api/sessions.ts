import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { isProduction, serverConfig } from './config';
import { db, PublicUser, toPublicUser, UserRow } from './db';

export interface SessionCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function sessionCookieOptions(): SessionCookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: serverConfig.sessionTtlMs,
  };
}

export function createSession(userId: string): string {
  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + serverConfig.sessionTtlMs).toISOString();

  db.prepare(
    `INSERT INTO sessions (id, token_hash, user_id, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(randomUUID(), hashToken(token), userId, now.toISOString(), expiresAt);

  return token;
}

export function getSessionUser(token: string | undefined): PublicUser | null {
  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);
  const now = new Date().toISOString();
  const row = db
    .prepare(
      `SELECT u.*, s.expires_at AS session_expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?`,
    )
    .get(tokenHash) as (UserRow & { session_expires_at: string }) | undefined;

  if (!row) {
    return null;
  }

  if (row.session_expires_at <= now) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    return null;
  }

  return toPublicUser(row);
}

export function deleteSession(token: string | undefined): void {
  if (!token) {
    return;
  }

  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
}

export function cleanupExpiredSessions(): void {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString());
}
