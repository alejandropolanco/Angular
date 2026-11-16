import { HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  it('enables credentials for API requests', () => {
    const request = new HttpRequest('GET', '/api/auth/me');

    TestBed.runInInjectionContext(() => {
      let forwarded: HttpRequest<unknown> | null = null;

      authInterceptor(request, (req) => {
        forwarded = req;
        return of(new HttpResponse({ status: 200 }));
      }).subscribe((event) => {
        expect(event).toBeInstanceOf(HttpResponse);
      });

      expect(forwarded).not.toBeNull();
      expect(forwarded).not.toBe(request);
      expect((forwarded as unknown as HttpRequest<unknown>).withCredentials).toBe(true);
    });
  });

  it('forwards non-API requests untouched', () => {
    const request = new HttpRequest('GET', '/assets/data.json');

    TestBed.runInInjectionContext(() => {
      let forwarded: HttpRequest<unknown> | null = null;

      authInterceptor(request, (req) => {
        forwarded = req;
        return of(new HttpResponse({ status: 200 }));
      }).subscribe((event) => {
        expect(event).toBeInstanceOf(HttpResponse);
      });

      expect(forwarded).toBe(request);
    });
  });
});
