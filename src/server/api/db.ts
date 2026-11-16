import Database from 'better-sqlite3';
import { hashSync } from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { isProduction, serverConfig } from './config';

export type UserRole = 'admin' | 'customer';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface NewUser {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

const databaseFile =
  serverConfig.databasePath === ':memory:'
    ? ':memory:'
    : resolve(process.cwd(), serverConfig.databasePath);

if (databaseFile !== ':memory:') {
  mkdirSync(dirname(databaseFile), { recursive: true });
}

export const db = new Database(databaseFile);

db.pragma('busy_timeout = 5000');
db.pragma('foreign_keys = ON');

if (databaseFile !== ':memory:') {
  db.pragma('journal_mode = WAL');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
`);

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function findUserByEmail(email: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
}

export function findUserById(id: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
}

export function createUser({ name, email, password, role = 'customer' }: NewUser): PublicUser {
  const user: UserRow = {
    id: randomUUID(),
    name,
    email,
    password_hash: hashSync(password, 12),
    role,
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, role, created_at)
     VALUES (@id, @name, @email, @password_hash, @role, @created_at)`,
  ).run(user);

  return toPublicUser(user);
}

export const DUMMY_PASSWORD_HASH = hashSync('novastore-dummy-password', 12);

function seedAdmin(): void {
  if (findUserByEmail(serverConfig.adminEmail)) {
    return;
  }

  createUser({
    name: 'Administrador',
    email: serverConfig.adminEmail,
    password: serverConfig.adminPassword,
    role: 'admin',
  });

  if (isProduction && !process.env['ADMIN_PASSWORD']) {
    console.warn(
      '[security] Se creó el administrador con la contraseña por defecto. Definí ADMIN_PASSWORD en producción.',
    );
  }
}

seedAdmin();
