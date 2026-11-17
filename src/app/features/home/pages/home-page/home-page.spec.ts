import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../auth/services/auth.service';
import { Product } from '../../../store/models/modelo';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  const isAuthenticated = signal(false);

  beforeEach(async () => {
    isAuthenticated.set(false);

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        MessageService,
        {
          provide: AuthService,
          useValue: { isAuthenticated, user: signal(null) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await waitForCatalog();
  });

  /** El catálogo se resuelve con latencia simulada; esperamos a que termine. */
  async function waitForCatalog(): Promise<void> {
    const deadline = Date.now() + 2000;

    while (component.isLoading() && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads a preview capped at six products', () => {
    expect(component.products().length).toBeGreaterThan(0);
    expect(component.preview().length).toBeLessThanOrEqual(6);
  });

  it('opens the detail dialog for a product', () => {
    const product = component.products()[0];
    component.openDetail(product);

    expect(component.selectedProduct()).toBe(product);
    expect(component.detailVisible()).toBe(true);
  });

  it('adds a product to the cart', () => {
    const product = component.products().find((item) => item.inventoryStatus !== 'OUTOFSTOCK');
    expect(product).toBeDefined();

    component.addToCart(product as Product);

    expect(component['cartService'].cartItems().length).toBe(1);
  });

  it('scrolls to the collection section', () => {
    const section = fixture.nativeElement.querySelector('#coleccion') as HTMLElement;
    expect(section).not.toBeNull();

    const scrollIntoView = vi.fn();
    section.scrollIntoView = scrollIntoView;

    component.scrollToCollection();

    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'start' }));
  });

  it('exposes whether products can be purchased based on auth', () => {
    expect(component.purchasable()).toBe(false);

    isAuthenticated.set(true);
    expect(component.purchasable()).toBe(true);
  });
});
