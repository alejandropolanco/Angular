import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { Skeleton } from '../skeleton/skeleton';
import { Product } from '../../../features/store/models/modelo';
import {
  getDiscountPercent,
  getStockLabel,
  getStockSeverity,
  hasDiscount,
  isOutOfStock,
} from '../../utils/product-status';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, RouterLink, TagModule, Skeleton],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<Product>();
  /** Si es `false`, el CTA invita a iniciar sesión en lugar de añadir. */
  readonly purchasable = input(true);
  readonly add = output<Product>();
  /** Emite al pedir el detalle ampliado del producto. */
  readonly open = output<Product>();

  readonly stars = [1, 2, 3, 4, 5] as const;

  /** La imagen arranca con shimmer hasta que el navegador la decodifica. */
  readonly imageLoaded = signal(false);
  readonly imageFailed = signal(false);

  readonly isOutOfStock = computed(() => isOutOfStock(this.product()));

  readonly severity = computed(() => getStockSeverity(this.product().inventoryStatus));

  readonly stockLabel = computed(() => getStockLabel(this.product().inventoryStatus));

  readonly hasDiscount = computed(() => hasDiscount(this.product()));

  readonly discount = computed(() => getDiscountPercent(this.product()));

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }

  onImageError(): void {
    this.imageFailed.set(true);
    this.imageLoaded.set(true);
  }
}
