import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { rootRedirectGuard } from './core/guards/root-redirect-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootRedirectGuard],
    children: [],
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'store',
        loadChildren: () => import('./features/store/store.routes').then((m) => m.storeRoutes),
      },
      {
        path: 'cart',
        loadChildren: () => import('./features/cart/cart.routes').then((m) => m.cartRoutes),
      },
    ],
  },
  {
    path: '**',
    title: 'Página no encontrada | NovaStore',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
