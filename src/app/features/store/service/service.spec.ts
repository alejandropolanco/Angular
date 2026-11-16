import { TestBed } from '@angular/core/testing';
import { ProductService } from './service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });

  it('returns a non-empty catalog', () => {
    const products = service.getProducts();

    expect(products.length).toBeGreaterThan(0);
  });

  it('returns products with unique ids and required fields', () => {
    const products = service.getProducts();
    const ids = new Set(products.map((product) => product.id));

    expect(ids.size).toBe(products.length);

    for (const product of products) {
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.category.length).toBeGreaterThan(0);
      expect(product.image.length).toBeGreaterThan(0);
      expect(product.description.length).toBeGreaterThan(0);
      expect(product.price).toBeGreaterThan(0);
      expect(product.rating).toBeGreaterThanOrEqual(1);
      expect(product.rating).toBeLessThanOrEqual(5);
      expect(['INSTOCK', 'LOWSTOCK', 'OUTOFSTOCK']).toContain(product.inventoryStatus);
    }
  });
});
