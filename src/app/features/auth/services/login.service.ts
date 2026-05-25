import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  isAuthenticated = signal(false);


  login(email: string, password: string): boolean {
    const success: boolean = (
      email === 'admin@gmail.com'
      &&
      password === '1234'
    );
    if (success) {
      this.isAuthenticated.set(true);
    }

    return success;

  }






}

