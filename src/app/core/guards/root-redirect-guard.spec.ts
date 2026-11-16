import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { rootRedirectGuard } from './root-redirect-guard';

describe('rootRedirectGuard', () => {
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

  it('sends guests to the login page', () => {
    const result = TestBed.runInInjectionContext(() => rootRedirectGuard({} as never, {} as never));

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('sends authenticated users to the store', () => {
    authenticated = true;

    const result = TestBed.runInInjectionContext(() => rootRedirectGuard({} as never, {} as never));

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/store');
  });
});
