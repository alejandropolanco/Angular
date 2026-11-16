import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BrandLogo } from '../../../../shared/components/brand-logo/brand-logo';
import { ApiErrorBody } from '../../models/auth.model';
import { AuthService } from '../../services/auth.service';
import { getAuthErrorMessage } from '../../utils/auth-error';
import { nameValidator } from '../../validators/name.validator';
import {
  evaluatePasswordStrength,
  passwordMatchValidator,
  passwordStrengthValidator,
} from '../../validators/password.validator';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, BrandLogo],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly registerForm = this.formBuilder.nonNullable.group(
    {
      name: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(80), nameValidator],
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(72),
          passwordStrengthValidator,
        ],
      ],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    { validators: [passwordMatchValidator] },
  );

  readonly passwordValue = toSignal(this.registerForm.controls.password.valueChanges, {
    initialValue: '',
  });

  readonly passwordStrength = computed(() => evaluatePasswordStrength(this.passwordValue()));
  readonly strengthSteps = [1, 2, 3, 4, 5];

  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);
  readonly showConfirmation = signal(false);

  get name() {
    return this.registerForm.controls.name;
  }

  get email() {
    return this.registerForm.controls.email;
  }

  get password() {
    return this.registerForm.controls.password;
  }

  get confirmPassword() {
    return this.registerForm.controls.confirmPassword;
  }

  get acceptTerms() {
    return this.registerForm.controls.acceptTerms;
  }

  register(): void {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.clearServerErrors();

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { name, email, password, acceptTerms } = this.registerForm.getRawValue();

    this.authService.register({ name, email, password, acceptTerms }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login'], { queryParams: { registered: '1' } });
      },
      error: (error: unknown) => {
        this.loading.set(false);
        const hasFieldErrors = this.applyServerFieldErrors(error);
        this.errorMessage.set(
          hasFieldErrors
            ? 'Revisá los campos marcados en el formulario.'
            : getAuthErrorMessage(error, 'register'),
        );
      },
    });
  }

  private fieldControls(): Record<string, AbstractControl> {
    return {
      name: this.name,
      email: this.email,
      password: this.password,
      acceptTerms: this.acceptTerms,
    };
  }

  private clearServerErrors(): void {
    for (const control of Object.values(this.fieldControls())) {
      if (!control.hasError('server')) {
        continue;
      }

      const errors = { ...(control.errors ?? {}) };
      delete errors['server'];
      control.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
  }

  private applyServerFieldErrors(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    const fields = (error.error as ApiErrorBody | null)?.error?.fields;

    if (!fields) {
      return false;
    }

    const controls = this.fieldControls();
    let applied = false;

    for (const [field, messages] of Object.entries(fields)) {
      const control = controls[field];
      const message = messages?.[0];

      if (!control || !message) {
        continue;
      }

      control.setErrors({ ...(control.errors ?? {}), server: message });
      control.markAsTouched();
      applied = true;
    }

    return applied;
  }

  togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  toggleConfirmation(): void {
    this.showConfirmation.update((visible) => !visible);
  }
}
