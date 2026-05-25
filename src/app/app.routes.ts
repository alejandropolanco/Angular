import { Routes } from '@angular/router';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { PagesStore } from './features/store/pages/pages-store';
import { storeRoutes } from './features/store/store.routes';
import { MainLayout } from './layout/main-layout/main-layout';
import { PublicLayout } from './layout/public-layout/public-layout'
import { CartPage } from './features/cart/pages/cart-page/cart-page';
import {authGuard} from  './core/guards/auth-guard'

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,

    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },

      {
        path: 'login',
        component: LoginPage
      }

    ]
  },

{
  path: '',
  component: MainLayout,

  canActivate:[authGuard],

  children: [

    {
      path:'store',
      component: PagesStore
    },

    {
      path:'cart',
      component: CartPage
    }

  ]
}

  


];
