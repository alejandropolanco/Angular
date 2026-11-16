import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RegisterPage } from './register-page';

const user = {
  id: '2',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'customer' as const,
  createdAt: new Date().toISOString(),
};

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideRouter([
          { path: 'login', children: [] },
          { path: 'store', children: [] },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function fillValidForm(): void {
    component.registerForm.setValue({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      acceptTerms: true,
    });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not submit an invalid form', () => {
    component.register();

    expect(component.submitted()).toBe(true);
    httpMock.expectNone('/api/auth/register');
  });

  it('rejects mismatched passwords', () => {
    fillValidForm();
    component.registerForm.patchValue({ confirmPassword: 'Password2' });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);

    component.register();
    httpMock.expectNone('/api/auth/register');
  });

  it('rejects passwords without a number', () => {
    component.registerForm.patchValue({ password: 'onlyletters' });

    expect(component.registerForm.controls.password.hasError('missingNumber')).toBe(true);
  });

  it('rejects names with numbers or unsupported symbols', () => {
    fillValidForm();
    component.registerForm.patchValue({ name: 'Ada 123' });

    expect(component.registerForm.controls.name.hasError('invalidName')).toBe(true);

    component.register();
    httpMock.expectNone('/api/auth/register');
  });

  it('shows server field errors next to the affected control', () => {
    fillValidForm();

    component.register();
    httpMock.expectOne('/api/auth/register').flush(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Revisá los datos ingresados.',
          fields: { name: ['El nombre contiene caracteres no permitidos.'] },
        },
      },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    fixture.detectChanges();

    expect(component.name.hasError('server')).toBe(true);
    expect(component.errorMessage()).toBe('Revisá los campos marcados en el formulario.');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'El nombre contiene caracteres no permitidos.',
    );
  });

  it('registers the user and redirects to login', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fillValidForm();

    component.register();

    const request = httpMock.expectOne('/api/auth/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'Password1',
      acceptTerms: true,
    });

    request.flush({ user });

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe('');
    expect(navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { registered: '1' },
    });
  });

  it('shows a friendly error when the email is already registered', () => {
    fillValidForm();

    component.register();

    httpMock
      .expectOne('/api/auth/register')
      .flush(
        { error: { code: 'EMAIL_TAKEN', message: 'Correo ya registrado.' } },
        { status: 409, statusText: 'Conflict' },
      );

    expect(component.errorMessage()).toContain('Ya existe una cuenta');
    expect(component.loading()).toBe(false);
  });

  it('toggles password and confirmation visibility', () => {
    component.togglePassword();
    component.toggleConfirmation();

    expect(component.showPassword()).toBe(true);
    expect(component.showConfirmation()).toBe(true);
  });
});
