import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { CartService } from '../../features/cart/services/cart-service';
import { AuthService } from '../../features/auth/services/auth.service';
import { BrandLogo } from '../../shared/components/brand-logo/brand-logo';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DrawerModule, BrandLogo],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly mobileOpen = signal(false);

  readonly userInitial = computed(() => {
    const name = this.authService.user()?.name ?? 'N';
    return name.charAt(0).toUpperCase();
  });

  logout(): void {
    this.authService.logout();
    this.mobileOpen.set(false);
    this.router.navigateByUrl('/login');
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
