import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

const user = {
  id: '1',
  name: 'Administrador',
  email: 'admin@gmail.com',
  role: 'admin' as const,
  createdAt: new Date().toISOString(),
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts in an unknown, unauthenticated state', () => {
    expect(service.status()).toBe('unknown');
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('restores the session from the server on initialize', async () => {
    const initialized = service.initialize();

    httpMock.expectOne('/api/auth/me').flush({ user });
    await initialized;

    expect(service.status()).toBe('authenticated');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()).toEqual(user);
  });

  it('falls back to guest when there is no active session', async () => {
    const initialized = service.initialize();

    httpMock
      .expectOne('/api/auth/me')
      .flush(
        { error: { code: 'UNAUTHENTICATED', message: 'Sin sesión.' } },
        { status: 401, statusText: 'Unauthorized' },
      );
    await initialized;

    expect(service.status()).toBe('guest');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('does not call the API twice while initializing', async () => {
    const first = service.initialize();
    const second = service.initialize();

    expect(first).toBe(second);
    httpMock.expectOne('/api/auth/me').flush({ user });

    await first;
  });

  it('logs in and stores the user', () => {
    let result: unknown;

    service.login({ email: 'admin@gmail.com', password: '1234' }).subscribe((value) => {
      result = value;
    });

    const request = httpMock.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'admin@gmail.com', password: '1234' });
    request.flush({ user });

    expect(result).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()).toEqual(user);
  });

  it('registers a user without starting a session', () => {
    let result: unknown;

    service
      .register({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'Password1',
        acceptTerms: true,
      })
      .subscribe((value) => {
        result = value;
      });

    const request = httpMock.expectOne('/api/auth/register');
    expect(request.request.method).toBe('POST');
    request.flush({ user: { ...user, id: '2', name: 'Ada Lovelace', email: 'ada@example.com' } });

    expect(result).toBeTruthy();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('clears the session on logout', () => {
    service.login({ email: 'admin@gmail.com', password: '1234' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush({ user });

    service.logout();
    httpMock.expectOne('/api/auth/logout').flush(null, { status: 204, statusText: 'No Content' });

    expect(service.status()).toBe('guest');
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
  });
});
