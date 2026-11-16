import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BrandLogo } from '../../../../shared/components/brand-logo/brand-logo';
import { AuthService } from '../../services/auth.service';
import { getAuthErrorMessage } from '../../utils/auth-error';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, BrandLogo],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly authService = inject(AuthService);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly submitted = signal(false);
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly registered = signal(this.route.snapshot.queryParamMap.get('registered') === '1');

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  login(): void {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl(this.getReturnUrl());
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(getAuthErrorMessage(error, 'login'));
      },
    });
  }

  togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  private getReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl && returnUrl.startsWith('/') ? returnUrl : '/store';
  }
}
