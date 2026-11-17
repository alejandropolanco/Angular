import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly mobileOpen = signal(false);
  /** El header se "eleva" al salir de la portada. */
  readonly isScrolled = signal(false);

  readonly isAuthenticated = this.authService.isAuthenticated;

  readonly userInitial = computed(() => {
    const name = this.authService.user()?.name ?? 'N';
    return name.charAt(0).toUpperCase();
  });

  constructor() {
    afterNextRender(() => this.bindScrollState());
  }

  logout(): void {
    this.authService.logout();
    this.mobileOpen.set(false);
    this.router.navigateByUrl('/');
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  private bindScrollState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const onScroll = () => this.isScrolled.set(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
  }
}
