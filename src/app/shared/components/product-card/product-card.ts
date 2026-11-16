import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { TagModule } from 'primeng/tag';
import { Skeleton } from '../skeleton/skeleton';
import { InventoryStatus, Product } from '../../../features/store/models/modelo';

type TagSeverity = 'success' | 'warn' | 'danger';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, TagModule, Skeleton],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly add = output<Product>();

  readonly stars = [1, 2, 3, 4, 5] as const;

  /** La imagen arranca con shimmer hasta que el navegador la decodifica. */
  readonly imageLoaded = signal(false);
  readonly imageFailed = signal(false);

  readonly isOutOfStock = computed(() => this.product().inventoryStatus === 'OUTOFSTOCK');

  readonly severity = computed<TagSeverity>(() => this.getSeverity(this.product().inventoryStatus));

  readonly stockLabel = computed(() => this.getStockLabel(this.product().inventoryStatus));

  readonly hasDiscount = computed(() => {
    const oldPrice = this.product().oldPrice;
    return oldPrice !== undefined && oldPrice > this.product().price;
  });

  readonly discount = computed(() => {
    const oldPrice = this.product().oldPrice;
    if (oldPrice === undefined || oldPrice <= this.product().price) {
      return null;
    }

    return Math.round(((oldPrice - this.product().price) / oldPrice) * 100);
  });

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }

  onImageError(): void {
    this.imageFailed.set(true);
    this.imageLoaded.set(true);
  }

  private getSeverity(status: InventoryStatus): TagSeverity {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
    }
  }

  private getStockLabel(status: InventoryStatus): string {
    switch (status) {
      case 'INSTOCK':
        return 'Disponible';
      case 'LOWSTOCK':
        return 'Últimas unidades';
      case 'OUTOFSTOCK':
        return 'Agotado';
    }
  }
}
