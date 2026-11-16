import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Primitiva de skeleton loading.
 * Mantiene dimensiones estables para evitar layout shift.
 */
@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skeleton {
  readonly width = input('100%');
  readonly height = input('1rem');
  readonly radius = input('var(--nv-skeleton-radius)');
  readonly circle = input(false);
  readonly text = input(false);
}
