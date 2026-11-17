export type InventoryStatus = 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK';

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  oldPrice?: number;
  description: string;
  /** Descripción extendida que se muestra en el detalle del producto. */
  details?: string;
  /** Características destacadas (viñetas) del detalle. */
  highlights?: string[];
  inventoryStatus: InventoryStatus;
  rating: number;
  badge?: string;
}
