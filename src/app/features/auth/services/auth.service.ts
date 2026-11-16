import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, map, Observable, of, tap, timeout } from 'rxjs';
import {
  AuthResponse,
  AuthStatus,
  LoginCredentials,
  RegisterRequest,
  SessionUser,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _user = signal<SessionUser | null>(null);
  private readonly _status = signal<AuthStatus>('unknown');
  private initPromise: Promise<void> | null = null;

  readonly user = this._user.asReadonly();
  readonly status = this._status.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this._status.set('guest');
      return Promise.resolve();
    }

    if (this._status() !== 'unknown') {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = firstValueFrom(
      this.http.get<AuthResponse>('/api/auth/me').pipe(
        timeout(4000),
        tap(({ user }) => this.setUser(user)),
        catchError(() => {
          this.clearUser();
          return of(null);
        }),
      ),
    )
      .then(() => undefined)
      .finally(() => {
        this.initPromise = null;
      });

    return this.initPromise;
  }

  login(credentials: LoginCredentials): Observable<SessionUser> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap(({ user }) => this.setUser(user)),
      map(({ user }) => user),
    );
  }

  register(payload: RegisterRequest): Observable<SessionUser> {
    return this.http
      .post<AuthResponse>('/api/auth/register', payload)
      .pipe(map(({ user }) => user));
  }

  logout(): void {
    this.clearUser();

    if (isPlatformBrowser(this.platformId)) {
      this.http
        .post<void>('/api/auth/logout', {})
        .pipe(catchError(() => of(void 0)))
        .subscribe();
    }
  }

  private setUser(user: SessionUser): void {
    this._user.set(user);
    this._status.set('authenticated');
  }

  private clearUser(): void {
    this._user.set(null);
    this._status.set('guest');
  }
}
