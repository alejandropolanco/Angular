import { Routes } from '@angular/router';

export const cartRoutes: Routes = [
  {
    path: '',
    title: 'Carrito | NovaStore',
    loadComponent: () => import('./pages/cart-page/cart-page').then((m) => m.CartPage),
  },
];
