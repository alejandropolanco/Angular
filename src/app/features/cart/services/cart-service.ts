import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem } from '../models/cart-model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems = signal<CartItem[]>([]);

  totalItems = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
  );

  totalPrice = computed(() =>
    this.cartItems().reduce(
      (acc, item) => acc + (item.price * item.quantity),
      0
    )
  );

  constructor() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('cart');

    if (saved) {
      this.cartItems.set(JSON.parse(saved));
    }

    effect(() => {
      localStorage.setItem(
        'cart',
        JSON.stringify(this.cartItems())
      );
    });

  }
}

  addToCart(product: any) {
   
    const normalized = {
    id: product.id,
    name: product.name,
    price: Number(product.price ?? product.precio ?? 0),
    image: product.image ?? product.img ?? '',
    quantity: 1
    
  };

    this.cartItems.update(items => {

      const exists = items.find(i => i.id === normalized.id);

      if (exists) {

        return items.map(i =>
          i.id === normalized.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );

      }

      return [
        ...items,normalized,
      ];

    });

  }

  removeFromCart(id: number) {
    this.cartItems.update(items =>
      items.filter(i => i.id !== id)
    );
  }

  clearCart() {
    this.cartItems.set([]);
  }
}