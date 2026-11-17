import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Product } from '../../../features/store/models/modelo';
import { ProductDetailDialog } from './product-detail-dialog';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    name: 'Laptop Gamer',
    category: 'Tecnología',
    image: 'laptop.jpg',
    price: 2500,
    oldPrice: 2899,
    description: 'RTX 4070, 32 GB de RAM y pantalla de 165 Hz.',
    details: 'Chasis de aluminio con refrigeración por vapor y perfil de 19 mm.',
    highlights: ['NVIDIA RTX 4070', 'Intel Core i7', 'SSD NVMe 1 TB'],
    inventoryStatus: 'INSTOCK',
    rating: 5,
    ...overrides,
  };
}

describe('ProductDetailDialog', () => {
  let component: ProductDetailDialog;
  let fixture: ComponentFixture<ProductDetailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailDialog],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.querySelectorAll('.p-dialog-mask, .product-detail-dialog').forEach((el) => el.remove());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('derives its computed state from the current product', () => {
    fixture.componentRef.setInput('product', makeProduct());
    fixture.detectChanges();

    expect(component.isOutOfStock()).toBe(false);
    expect(component.severity()).toBe('success');
    expect(component.stockLabel()).toBe('Disponible');
    expect(component.hasDiscount()).toBe(true);
    expect(component.discount()).toBe(14);
  });

  it('reports no state before a product is selected', () => {
    expect(component.isOutOfStock()).toBe(false);
    expect(component.stockLabel()).toBe('');
    expect(component.hasDiscount()).toBe(false);
    expect(component.discount()).toBeNull();
  });

  it('reflects out-of-stock products', () => {
    fixture.componentRef.setInput('product', makeProduct({ inventoryStatus: 'OUTOFSTOCK' }));
    fixture.detectChanges();

    expect(component.isOutOfStock()).toBe(true);
    expect(component.severity()).toBe('danger');
    expect(component.stockLabel()).toBe('Agotado');
  });

  it('renders the extended description and highlights when open', async () => {
    fixture.componentRef.setInput('product', makeProduct());
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const detail = document.body.querySelector('.product-detail');
    expect(detail).not.toBeNull();
    expect(detail?.textContent).toContain('RTX 4070');
    expect(detail?.textContent).toContain('Chasis de aluminio');
    expect(detail?.querySelectorAll('.product-detail__highlights li').length).toBe(3);
  });

  it('emits the product when the add button is pressed', async () => {
    const product = makeProduct();
    fixture.componentRef.setInput('product', product);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const emitted: Product[] = [];
    component.add.subscribe((value) => emitted.push(value));

    const button = document.body.querySelector<HTMLButtonElement>('.product-detail__add');
    expect(button).not.toBeNull();
    button?.click();

    expect(emitted).toEqual([product]);
  });

  it('invites guests to sign in instead of adding to the cart', async () => {
    fixture.componentRef.setInput('product', makeProduct());
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('purchasable', false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const cta = document.body.querySelector('.product-detail__add');
    expect(cta?.tagName).toBe('A');
    expect(cta?.textContent).toContain('Inicia sesión');
  });
});
