import { Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { LoginService } from './../../services/login.service'

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',

  standalone: true,

  imports: [ButtonModule, DividerModule, InputTextModule, ReactiveFormsModule],

  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})

export class LoginPage {

  loginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loginService: LoginService
  ) {

    this.loginForm = this.formBuilder.group({

      email: [
        '',
        [Validators.required, Validators.email]
      ],

      password: [
        '',
        [Validators.required]
      ]

    });

  }

  login() {

    const success = this.loginService.login(
      this.loginForm.value.email,
      this.loginForm.value.password
    );

    if (success) {

      this.router.navigateByUrl('/store');

    }

  }

}