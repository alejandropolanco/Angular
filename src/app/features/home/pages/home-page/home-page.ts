import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProductService } from '../../../store/service/service';
import { Product } from '../../../store/models/modelo';
import { CartService } from '../../../cart/services/cart-service';
import { AuthService } from '../../../auth/services/auth.service';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { ProductCardSkeleton } from '../../../../shared/components/product-card-skeleton/product-card-skeleton';
import { ProductDetailDialog } from '../../../../shared/components/product-detail-dialog/product-detail-dialog';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal';

/** Cuántos productos se muestran en la vista previa pública. */
const PREVIEW_COUNT = 6;

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ProductCard, ProductCardSkeleton, ProductDetailDialog, ScrollReveal],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(true);

  readonly selectedProduct = signal<Product | null>(null);
  readonly detailVisible = signal(false);

  readonly purchasable = this.authService.isAuthenticated;

  /** Vista previa: unas pocas piezas destacadas para la portada. */
  readonly preview = computed(() => this.products().slice(0, PREVIEW_COUNT));

  readonly skeletonItems = [1, 2, 3, 4, 5, 6];

  ngOnInit(): void {
    this.productService
      .getProductsAsync()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => {
        this.products.set(products);
        this.isLoading.set(false);
      });
  }

  /** Bug 2: desplaza a la colección en lugar de resetear la navegación. */
  scrollToCollection(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.getElementById('coleccion')?.scrollIntoView({
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
  }

  addToCart(product: Product): void {
    const added = this.cartService.addToCart(product);

    if (!added) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Producto agotado',
        detail: `${product.name} no está disponible por el momento.`,
        life: 2800,
      });
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Añadido al carrito',
      detail: `${product.name} está en tu carrito.`,
      life: 2400,
    });
  }

  openDetail(product: Product): void {
    this.selectedProduct.set(product);
    this.detailVisible.set(true);
  }
}
