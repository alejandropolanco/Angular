import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { authRoutes } from './features/auth/auth.routes';

export const routes: Routes = [
  // Auth a nivel raíz (login/register a pantalla completa, sin layout de tienda).
  ...authRoutes,
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./features/home/home.routes').then((m) => m.homeRoutes),
      },
      {
        path: 'store',
        canActivate: [authGuard],
        loadChildren: () => import('./features/store/store.routes').then((m) => m.storeRoutes),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
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
