export type InventoryStatus = 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK';

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  oldPrice?: number;
  description: string;
  inventoryStatus: InventoryStatus;
  rating: number;
  badge?: string;
}
