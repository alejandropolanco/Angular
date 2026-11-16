import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly icon = input('pi pi-box');
  readonly title = input('Nada por aquí');
  readonly message = input('');
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
