import { Product } from '../../features/store/models/modelo';
import {
  getDiscountPercent,
  getStockLabel,
  getStockSeverity,
  hasDiscount,
  isOutOfStock,
} from './product-status';

/** Producto base al que cada test ajusta solo lo que necesita. */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    name: 'Producto',
    category: 'Tecnología',
    image: 'producto.jpg',
    price: 100,
    description: 'Descripción',
    inventoryStatus: 'INSTOCK',
    rating: 4,
    ...overrides,
  };
}

describe('product-status', () => {
  describe('getStockSeverity', () => {
    it('maps each inventory status to a tag severity', () => {
      expect(getStockSeverity('INSTOCK')).toBe('success');
      expect(getStockSeverity('LOWSTOCK')).toBe('warn');
      expect(getStockSeverity('OUTOFSTOCK')).toBe('danger');
    });
  });

  describe('getStockLabel', () => {
    it('maps each inventory status to a readable label', () => {
      expect(getStockLabel('INSTOCK')).toBe('Disponible');
      expect(getStockLabel('LOWSTOCK')).toBe('Últimas unidades');
      expect(getStockLabel('OUTOFSTOCK')).toBe('Agotado');
    });
  });

  describe('isOutOfStock', () => {
    it('is true only for OUTOFSTOCK', () => {
      expect(isOutOfStock(makeProduct({ inventoryStatus: 'OUTOFSTOCK' }))).toBe(true);
      expect(isOutOfStock(makeProduct({ inventoryStatus: 'LOWSTOCK' }))).toBe(false);
      expect(isOutOfStock(makeProduct({ inventoryStatus: 'INSTOCK' }))).toBe(false);
    });
  });

  describe('hasDiscount', () => {
    it('is false when there is no old price', () => {
      expect(hasDiscount(makeProduct())).toBe(false);
    });

    it('is false when the old price is not greater than the price', () => {
      expect(hasDiscount(makeProduct({ oldPrice: 100 }))).toBe(false);
      expect(hasDiscount(makeProduct({ oldPrice: 80 }))).toBe(false);
    });

    it('is true when the old price is greater than the price', () => {
      expect(hasDiscount(makeProduct({ price: 80, oldPrice: 100 }))).toBe(true);
    });
  });

  describe('getDiscountPercent', () => {
    it('returns null when there is no discount', () => {
      expect(getDiscountPercent(makeProduct())).toBeNull();
      expect(getDiscountPercent(makeProduct({ oldPrice: 80 }))).toBeNull();
    });

    it('returns the rounded discount percentage', () => {
      expect(getDiscountPercent(makeProduct({ price: 75, oldPrice: 100 }))).toBe(25);
      expect(getDiscountPercent(makeProduct({ price: 70, oldPrice: 100 }))).toBe(30);
    });

    it('rounds to the nearest integer', () => {
      expect(getDiscountPercent(makeProduct({ price: 2, oldPrice: 3 }))).toBe(33);
    });
  });
});
