import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-brand-logo',
  templateUrl: './brand-logo.html',
  styleUrl: './brand-logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandLogo {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
