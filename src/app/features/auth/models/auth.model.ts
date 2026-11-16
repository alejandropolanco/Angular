export type UserRole = 'admin' | 'customer';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: SessionUser;
}

export type AuthStatus = 'unknown' | 'authenticated' | 'guest';

export interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string[]>;
  };
}
