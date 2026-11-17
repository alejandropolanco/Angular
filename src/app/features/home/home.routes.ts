import { Routes } from '@angular/router';

export const homeRoutes: Routes = [
  {
    path: '',
    title: 'NovaStore — Tecnología curada para tu setup',
    loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
  },
];
