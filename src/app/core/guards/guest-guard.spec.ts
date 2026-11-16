import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { guestGuard } from './guest-guard';

describe('guestGuard', () => {
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

  it('allows guests to see the login page', () => {
    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('redirects authenticated users to the store', () => {
    authenticated = true;

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/store');
  });
});
