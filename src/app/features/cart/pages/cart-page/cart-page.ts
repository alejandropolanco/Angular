import { Component } from '@angular/core';
import { CartService } from '../../services/cart-service';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-page',
  imports: [TableModule,ButtonModule,CommonModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {


  constructor(public cartService: CartService) {}

}

