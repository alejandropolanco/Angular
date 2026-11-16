import { TestBed } from '@angular/core/testing';
import { Product } from '../../store/models/modelo';
import { CartService } from './cart-service';

const product: Product = {
  id: '1',
  name: 'Laptop Gamer',
  category: 'Tecnología',
  image: 'laptop.jpg',
  price: 2500,
  description: 'Laptop de alto rendimiento.',
  inventoryStatus: 'INSTOCK',
  rating: 5,
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts empty', () => {
    expect(service.isEmpty()).toBe(true);
    expect(service.totalItems()).toBe(0);
    expect(service.subtotal()).toBe(0);
    expect(service.shipping()).toBe(0);
    expect(service.totalPrice()).toBe(0);
  });

  it('adds a product and groups duplicates by id', () => {
    expect(service.addToCart(product)).toBe(true);
    expect(service.addToCart(product)).toBe(true);

    expect(service.cartItems().length).toBe(1);
    expect(service.cartItems()[0].quantity).toBe(2);
    expect(service.totalItems()).toBe(2);
    expect(service.subtotal()).toBe(5000);
  });

  it('rejects out-of-stock products', () => {
    const soldOut: Product = { ...product, id: '9', inventoryStatus: 'OUTOFSTOCK' };

    expect(service.addToCart(soldOut)).toBe(false);
    expect(service.isEmpty()).toBe(true);
  });

  it('increments and decrements quantity within bounds', () => {
    service.addToCart(product);

    service.increment(product.id);
    expect(service.cartItems()[0].quantity).toBe(2);

    service.decrement(product.id);
    expect(service.cartItems()[0].quantity).toBe(1);

    service.decrement(product.id);
    expect(service.cartItems()[0].quantity).toBe(1);
  });

  it('removes a single item', () => {
    service.addToCart(product);
    service.removeFromCart(product.id);

    expect(service.isEmpty()).toBe(true);
  });

  it('clears the whole cart', () => {
    service.addToCart(product);
    service.addToCart({ ...product, id: '2', name: 'Audífonos', price: 300 });

    service.clearCart();

    expect(service.isEmpty()).toBe(true);
    expect(service.totalItems()).toBe(0);
  });

  it('calculates shipping and free-shipping progress', () => {
    service.addToCart({ ...product, id: '2', price: 300 });

    expect(service.shipping()).toBe(service.SHIPPING_COST);
    expect(service.totalPrice()).toBe(315);
    expect(service.remainingForFreeShipping()).toBe(1200);
    expect(service.freeShippingProgress()).toBeCloseTo(20, 5);

    service.addToCart({ ...product, id: '3', price: 1500 });

    expect(service.shipping()).toBe(0);
    expect(service.totalPrice()).toBe(1800);
    expect(service.remainingForFreeShipping()).toBe(0);
    expect(service.freeShippingProgress()).toBe(100);
  });

  it('persists the cart to localStorage', () => {
    service.addToCart(product);
    TestBed.tick();

    const stored = JSON.parse(localStorage.getItem('novastore.cart.v1') ?? '[]') as unknown[];

    expect(stored.length).toBe(1);
  });

  it('restores a persisted cart on a new instance', () => {
    service.addToCart(product);
    TestBed.tick();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(CartService);

    expect(restored.cartItems().length).toBe(1);
    expect(restored.cartItems()[0].id).toBe(product.id);
  });

  it('ignores corrupted storage data', () => {
    localStorage.setItem('novastore.cart.v1', '{not valid json');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(CartService);

    expect(restored.isEmpty()).toBe(true);
  });
});
