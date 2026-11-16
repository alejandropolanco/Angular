import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandLogo } from '../../shared/components/brand-logo/brand-logo';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, BrandLogo],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  readonly authService = inject(AuthService);
}
