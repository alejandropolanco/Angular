import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../features/auth/services/auth.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const user = {
    id: '1',
    name: 'Administrador',
    email: 'admin@gmail.com',
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        MessageService,
        {
          provide: AuthService,
          useValue: {
            user: () => user,
            isAuthenticated: () => true,
            logout: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens and closes the mobile drawer', () => {
    expect(component.mobileOpen()).toBe(false);
    component.mobileOpen.set(true);
    expect(component.mobileOpen()).toBe(true);
    component.closeMobile();
    expect(component.mobileOpen()).toBe(false);
  });

  it('shows the cart badge only when there are items', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.cart-button__badge')).toBeNull();

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
    fixture.detectChanges();

    expect(compiled.querySelector('.cart-button__badge')?.textContent?.trim()).toBe('1');
    component.cartService.clearCart();
  });

  it('shows the authenticated user initial', () => {
    expect(component.userInitial()).toBe('A');
  });
});
