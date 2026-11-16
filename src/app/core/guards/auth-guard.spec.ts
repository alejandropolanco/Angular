import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  let authenticated: boolean;
  let router: Router;

  beforeEach(() => {
    authenticated = false;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { isAuthenticated: () => authenticated },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('redirects unauthenticated users to login with a returnUrl', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/store' } as never),
    );

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fstore');
  });

  it('allows authenticated users through', () => {
    authenticated = true;

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/store' } as never),
    );

    expect(result).toBe(true);
  });
});
