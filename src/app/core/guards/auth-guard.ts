import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../features/auth/services/login.service';

export const authGuard: CanActivateFn = () => {

  const loginService = inject(LoginService);
  const router = inject(Router);

  if(loginService.isAuthenticated()){

    return true;

  }

  router.navigateByUrl('/login');

  return false;

};