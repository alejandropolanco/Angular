import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem } from '../models/cart-model';
import { Product } from '../../store/models/modelo';

const CART_STORAGE_KEY = 'novastore.cart.v1';
const MAX_QUANTITY = 99;

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly FREE_SHIPPING_THRESHOLD = 1500;
  readonly SHIPPING_COST = 15;

  readonly cartItems = signal<CartItem[]>([]);

  readonly totalItems = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0),
  );

  readonly subtotal = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.price * item.quantity, 0),
  );

  readonly shipping = computed(() =>
    this.subtotal() === 0 || this.subtotal() >= this.FREE_SHIPPING_THRESHOLD
      ? 0
      : this.SHIPPING_COST,
  );

  readonly totalPrice = computed(() => this.subtotal() + this.shipping());

  readonly remainingForFreeShipping = computed(() =>
    Math.max(0, this.FREE_SHIPPING_THRESHOLD - this.subtotal()),
  );

  readonly freeShippingProgress = computed(() =>
    Math.min(100, (this.subtotal() / this.FREE_SHIPPING_THRESHOLD) * 100),
  );

  readonly isEmpty = computed(() => this.cartItems().length === 0);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.cartItems.set(this.readCart());

      effect(() => {
        this.persistCart(this.cartItems());
      });
    }
  }

  addToCart(product: Product): boolean {
    if (product.inventoryStatus === 'OUTOFSTOCK') {
      return false;
    }

    this.cartItems.update((items) => {
      const existing = items.find((item) => item.id === product.id);

      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) }
            : item,
        );
      }

      return [
        ...items,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image,
          quantity: 1,
          inventoryStatus: product.inventoryStatus,
        },
      ];
    });

    return true;
  }

  increment(id: string): void {
    this.cartItems.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) } : item,
      ),
    );
  }

  decrement(id: string): void {
    this.cartItems.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item,
      ),
    );
  }

  removeFromCart(id: string): void {
    this.cartItems.update((items) => items.filter((item) => item.id !== id));
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  private readCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((item): item is CartItem => this.isValidCartItem(item));
    } catch {
      return [];
    }
  }

  private isValidCartItem(value: unknown): value is CartItem {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const item = value as Partial<CartItem>;
    return (
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.category === 'string' &&
      typeof item.price === 'number' &&
      typeof item.image === 'string' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0 &&
      item.inventoryStatus !== undefined
    );
  }

  private persistCart(items: CartItem[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota or privacy-mode failures.
    }
  }
}
