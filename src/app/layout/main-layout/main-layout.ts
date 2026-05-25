import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import {HeaderComponent } from '../header/header.component';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet,HeaderComponent,Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  standalone:true,
})
export class MainLayout {}
