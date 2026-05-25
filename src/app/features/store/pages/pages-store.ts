import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';

import { ProductService } from '../service/service';
import { Product } from '../models/modelo';
import{CartService} from'../../cart/services/cart-service'



@Component({

  selector: 'app-store-page',

  standalone: true,

  imports: [
    CommonModule,
    ButtonModule,
    DataViewModule,
    TagModule
  ],

  templateUrl:'./pages-store.html',
  styleUrl:'./pages-store.scss'

})

export class PagesStore implements OnInit {

  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private cartService:CartService,
  
  ) {}

  ngOnInit(): void {

    this.products = this.productService.getProducts();

  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
  }




  getSeverity(product: Product) {

    switch (product.inventoryStatus) {

      case 'INSTOCK':
        return 'success';

      case 'LOWSTOCK':
        return 'warn';

      case 'OUTOFSTOCK':
        return 'danger';

      default:
        return null;

    }

  }

}