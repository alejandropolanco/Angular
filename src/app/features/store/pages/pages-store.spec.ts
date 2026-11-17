import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PagesStore } from './pages-store';

describe('PagesStore', () => {
  let component: PagesStore;
  let fixture: ComponentFixture<PagesStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagesStore],
      providers: [provideRouter([]), MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(PagesStore);
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

  it('loads the product catalog', () => {
    expect(component.products().length).toBeGreaterThan(0);
    expect(component.filteredProducts().length).toBe(component.products().length);
  });

  it('filters by search term', () => {
    component.search.set('laptop');
    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].name).toContain('Laptop');
  });

  it('filters by category', () => {
    component.selectCategory('Audio');
    expect(component.filteredProducts().every((product) => product.category === 'Audio')).toBe(
      true,
    );
  });

  it('sorts by ascending price', () => {
    component.onSortChange('price-asc');
    const prices = component.filteredProducts().map((product) => product.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('clears all filters', () => {
    component.search.set('zzz');
    component.selectCategory('Audio');
    component.clearFilters();

    expect(component.search()).toBe('');
    expect(component.category()).toBe('Todas');
    expect(component.sort()).toBe('featured');
  });

  it('adds products to the cart', () => {
    const product = component.products()[0];
    component.addToCart(product);
    expect(component['cartService'].cartItems().length).toBe(1);
  });

  it('opens the detail dialog for a product', () => {
    const product = component.products()[0];

    expect(component.detailVisible()).toBe(false);

    component.openDetail(product);

    expect(component.selectedProduct()).toBe(product);
    expect(component.detailVisible()).toBe(true);
  });

  it('keeps the scroll position when syncing filters to the URL', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.selectCategory('Audio');

    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ replaceUrl: true, scroll: 'manual' }),
    );
  });
});
