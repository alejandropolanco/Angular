import { Routes } from '@angular/router';

export const storeRoutes: Routes = [
  {
    path: '',
    title: 'Tienda | NovaStore',
    loadComponent: () => import('./pages/pages-store').then((m) => m.PagesStore),
  },
];
