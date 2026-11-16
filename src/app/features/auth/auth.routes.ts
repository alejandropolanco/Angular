import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest-guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Iniciar sesión | NovaStore',
    loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    title: 'Crear cuenta | NovaStore',
    loadComponent: () => import('./pages/register-page/register-page').then((m) => m.RegisterPage),
  },
];
