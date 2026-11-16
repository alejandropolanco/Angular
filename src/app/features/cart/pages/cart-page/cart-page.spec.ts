import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CartPage } from './cart-page';

describe('CartPage', () => {
  let component: CartPage;
  let fixture: ComponentFixture<CartPage>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [provideRouter([]), MessageService, ConfirmationService],
    }).compileComponents();

    fixture = TestBed.createComponent(CartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    component.cartService.clearCart();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the empty state when there are no items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-empty-state')).toBeTruthy();
  });

  it('removes an item from the cart', () => {
    component.cartService.addToCart({
      id: '1',
      name: 'Laptop Gamer',
      category: 'Tecnología',
      image: 'laptop.jpg',
      price: 2500,
      description: 'Laptop de alto rendimiento.',
      inventoryStatus: 'INSTOCK',
      rating: 5,
    });

    component.remove('1');

    expect(component.cartService.isEmpty()).toBe(true);
  });
});
