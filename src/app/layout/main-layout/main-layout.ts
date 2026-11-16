import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from '../header/header.component';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, HeaderComponent, Footer, ToastModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {}
