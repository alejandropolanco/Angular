import { InventoryStatus } from '../../store/models/modelo';

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
  inventoryStatus: InventoryStatus;
}
