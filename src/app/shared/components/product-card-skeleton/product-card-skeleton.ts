import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Skeleton } from '../skeleton/skeleton';

/**
 * Réplica de app-product-card con la misma geometría (media 4:3, 2 líneas
 * de descripción y footer). Evita layout shift al cargar el catálogo.
 */
@Component({
  selector: 'app-product-card-skeleton',
  imports: [Skeleton],
  templateUrl: './product-card-skeleton.html',
  styleUrl: './product-card-skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardSkeleton {}
