import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../features/cart/services/cart-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, MenubarModule, ButtonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit {

  items: MenuItem[] = [];

  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {

    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        routerLink: '/'
      },
      {
        label: 'Productos',
        icon: 'pi pi-shopping-bag',
        routerLink: '/store'
      }
    ];
  }

  goToCart() {
    this.router.navigateByUrl('/cart');
  }
}