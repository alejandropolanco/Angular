import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { LoginPage } from './login-page';

const user = {
  id: '1',
  name: 'Administrador',
  email: 'admin@gmail.com',
  role: 'admin' as const,
  createdAt: new Date().toISOString(),
};

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let httpMock: HttpTestingController;

  async function setup(queryParams: Record<string, string> = {}): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([{ path: 'store', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    httpMock = TestBed.inject(HttpTestingController);
  }

  beforeEach(async () => {
    await setup();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not log in with an invalid form', () => {
    component.login();

    expect(component.submitted()).toBe(true);
    expect(component.authService.isAuthenticated()).toBe(false);
    httpMock.expectNone('/api/auth/login');
  });

  it('shows an error with wrong credentials', () => {
    component.loginForm.setValue({ email: 'admin@gmail.com', password: '0000' });
    component.login();

    const request = httpMock.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');

    request.flush(
      { error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.' } },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(component.errorMessage()).toContain('correo o la contraseña');
    expect(component.authService.isAuthenticated()).toBe(false);
    expect(component.loading()).toBe(false);
  });

  it('logs in with valid credentials', () => {
    component.loginForm.setValue({ email: 'admin@gmail.com', password: '1234' });
    component.login();

    httpMock.expectOne('/api/auth/login').flush({ user });

    expect(component.authService.isAuthenticated()).toBe(true);
    expect(component.authService.user()).toEqual(user);
    expect(component.errorMessage()).toBe('');
    expect(component.loading()).toBe(false);
  });

  it('toggles password visibility', () => {
    expect(component.showPassword()).toBe(false);
    component.togglePassword();
    expect(component.showPassword()).toBe(true);
  });

  it('shows the registration success banner when redirected from register', async () => {
    TestBed.resetTestingModule();
    await setup({ registered: '1' });

    expect(component.registered()).toBe(true);
  });
});
