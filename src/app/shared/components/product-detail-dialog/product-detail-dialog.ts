import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { Product } from '../../../features/store/models/modelo';
import {
  getDiscountPercent,
  getStockLabel,
  getStockSeverity,
  hasDiscount,
  isOutOfStock,
} from '../../utils/product-status';

/**
 * Detalle ampliado de un producto, presentado como diálogo con entrada animada.
 * Se monta en `<body>` para escapar de cualquier contexto de apilamiento.
 */
@Component({
  selector: 'app-product-detail-dialog',
  imports: [CurrencyPipe, RouterLink, DialogModule, TagModule],
  templateUrl: './product-detail-dialog.html',
  styleUrl: './product-detail-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailDialog {
  readonly visible = model.required<boolean>();
  readonly product = input<Product | null>(null);

  /** Si es `false`, se ofrece iniciar sesión en lugar de añadir al carrito. */
  readonly purchasable = input(true);

  readonly add = output<Product>();

  readonly stars = [1, 2, 3, 4, 5] as const;

  readonly isOutOfStock = computed(() => {
    const product = this.product();
    return product ? isOutOfStock(product) : false;
  });

  readonly severity = computed(() => {
    const product = this.product();
    return product ? getStockSeverity(product.inventoryStatus) : 'success';
  });

  readonly stockLabel = computed(() => {
    const product = this.product();
    return product ? getStockLabel(product.inventoryStatus) : '';
  });

  readonly hasDiscount = computed(() => {
    const product = this.product();
    return product ? hasDiscount(product) : false;
  });

  readonly discount = computed(() => {
    const product = this.product();
    return product ? getDiscountPercent(product) : null;
  });
}
