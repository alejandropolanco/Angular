import { InventoryStatus, Product } from '../../features/store/models/modelo';

export type TagSeverity = 'success' | 'warn' | 'danger';

/** Severidad del tag de stock según el inventario. */
export function getStockSeverity(status: InventoryStatus): TagSeverity {
  switch (status) {
    case 'INSTOCK':
      return 'success';
    case 'LOWSTOCK':
      return 'warn';
    case 'OUTOFSTOCK':
      return 'danger';
  }
}

/** Etiqueta legible del stock. */
export function getStockLabel(status: InventoryStatus): string {
  switch (status) {
    case 'INSTOCK':
      return 'Disponible';
    case 'LOWSTOCK':
      return 'Últimas unidades';
    case 'OUTOFSTOCK':
      return 'Agotado';
  }
}

/** ¿El producto tiene un precio anterior mayor que el actual? */
export function hasDiscount(product: Product): boolean {
  const oldPrice = product.oldPrice;
  return oldPrice !== undefined && oldPrice > product.price;
}

/** Porcentaje de descuento redondeado, o `null` si no hay oferta. */
export function getDiscountPercent(product: Product): number | null {
  const oldPrice = product.oldPrice;
  if (oldPrice === undefined || oldPrice <= product.price) {
    return null;
  }

  return Math.round(((oldPrice - product.price) / oldPrice) * 100);
}

/** ¿El producto está agotado? */
export function isOutOfStock(product: Product): boolean {
  return product.inventoryStatus === 'OUTOFSTOCK';
}
