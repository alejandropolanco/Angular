import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../features/auth/services/auth.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let logout: ReturnType<typeof vi.fn>;

  const user = {
    id: '1',
    name: 'Administrador',
    email: 'admin@gmail.com',
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
  };

  const isAuthenticated = signal(true);
  const currentUser = signal<typeof user | null>(user);

  function setScrollY(value: number): void {
    Object.defineProperty(window, 'scrollY', { value, configurable: true });
  }

  beforeEach(async () => {
    isAuthenticated.set(true);
    currentUser.set(user);
    logout = vi.fn();
    setScrollY(0);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        MessageService,
        {
          provide: AuthService,
          useValue: { user: currentUser, isAuthenticated, logout },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    document.querySelectorAll('.p-drawer-mask, .mobile-drawer').forEach((el) => el.remove());
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

  it('appends the mobile drawer to the body', async () => {
    component.mobileOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(document.body.querySelector('.mobile-drawer')).not.toBeNull();
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

  it('shows the authenticated user initial and account controls', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(component.userInitial()).toBe('A');
    expect(compiled.querySelector('.user-chip__name')?.textContent).toContain('Administrador');
    expect(compiled.querySelector('.logout-button')).not.toBeNull();
    expect(compiled.querySelector('.header-auth')).toBeNull();
  });

  it('shows sign-in actions for guests', () => {
    isAuthenticated.set(false);
    currentUser.set(null);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const actions = Array.from(compiled.querySelectorAll('.header-auth')).map((el) =>
      el.textContent?.trim(),
    );

    expect(actions).toContain('Iniciar sesión');
    expect(actions).toContain('Crear cuenta');
    expect(compiled.querySelector('.logout-button')).toBeNull();
  });

  it('logs out and returns to the landing page', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    component.mobileOpen.set(true);

    component.logout();

    expect(logout).toHaveBeenCalled();
    expect(component.mobileOpen()).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('raises the scrolled state only after scrolling', () => {
    expect(component.isScrolled()).toBe(false);

    setScrollY(48);
    window.dispatchEvent(new Event('scroll'));
    expect(component.isScrolled()).toBe(true);

    setScrollY(0);
    window.dispatchEvent(new Event('scroll'));
    expect(component.isScrolled()).toBe(false);
  });
});
