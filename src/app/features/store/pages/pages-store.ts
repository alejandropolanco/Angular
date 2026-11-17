import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ProductService } from '../service/service';
import { Product } from '../models/modelo';
import { CartService } from '../../cart/services/cart-service';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { ProductCardSkeleton } from '../../../shared/components/product-card-skeleton/product-card-skeleton';
import { ProductDetailDialog } from '../../../shared/components/product-detail-dialog/product-detail-dialog';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ScrollReveal } from '../../../shared/directives/scroll-reveal/scroll-reveal';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';

interface SortSelectOption {
  label: string;
  value: SortOption;
}

@Component({
  selector: 'app-store-page',
  imports: [
    FormsModule,
    InputTextModule,
    SelectModule,
    ProductCard,
    ProductCardSkeleton,
    ProductDetailDialog,
    EmptyState,
    ScrollReveal,
  ],
  templateUrl: './pages-store.html',
  styleUrl: './pages-store.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagesStore implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(true);
  readonly search = signal('');
  readonly category = signal('Todas');
  readonly sort = signal<SortOption>('featured');

  readonly selectedProduct = signal<Product | null>(null);
  readonly detailVisible = signal(false);

  private catalogLoaded = false;

  readonly sortOptions: SortSelectOption[] = [
    { label: 'Destacados', value: 'featured' },
    { label: 'Precio: menor a mayor', value: 'price-asc' },
    { label: 'Precio: mayor a menor', value: 'price-desc' },
    { label: 'Mejor valorados', value: 'rating' },
    { label: 'Nombre A-Z', value: 'name' },
  ];

  readonly skeletonItems = [1, 2, 3, 4, 5, 6];

  readonly categories = computed(() => [
    'Todas',
    ...Array.from(new Set(this.products().map((product) => product.category))).sort(),
  ]);

  readonly filteredProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.category();
    const sort = this.sort();

    const filtered = this.products().filter((product) => {
      const matchesCategory = category === 'Todas' || product.category === category;
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });

    const sorted = [...filtered];

    switch (sort) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating || a.price - b.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      default:
        return sorted;
    }
  });

  readonly resultLabel = computed(() => {
    const count = this.filteredProducts().length;
    return `${count} ${count === 1 ? 'producto' : 'productos'}`;
  });

  readonly hasActiveFilters = computed(
    () =>
      this.search().trim().length > 0 || this.category() !== 'Todas' || this.sort() !== 'featured',
  );

  ngOnInit(): void {
    this.productService
      .getProductsAsync()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products) => {
        this.products.set(products);
        this.catalogLoaded = true;
        this.applyQueryParams(this.route.snapshot.queryParamMap);
        this.isLoading.set(false);
      });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (this.catalogLoaded) {
        this.applyQueryParams(params);
      }
    });
  }

  private applyQueryParams(params: ParamMap): void {
    const query = params.get('q') ?? '';
    const category = params.get('cat') ?? 'Todas';
    const sort = params.get('sort') as SortOption | null;

    this.search.set(query);
    this.category.set(this.categories().includes(category) ? category : 'Todas');
    this.sort.set(
      sort && this.sortOptions.some((option) => option.value === sort) ? sort : 'featured',
    );
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    this.syncQueryParams();
  }

  clearSearch(): void {
    this.search.set('');
    this.syncQueryParams();
  }

  selectCategory(category: string): void {
    this.category.set(category);
    this.syncQueryParams();
  }

  onSortChange(sort: SortOption): void {
    this.sort.set(sort);
    this.syncQueryParams();
  }

  clearFilters(): void {
    this.search.set('');
    this.category.set('Todas');
    this.sort.set('featured');
    this.syncQueryParams(true);
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

  private syncQueryParams(clear = false): void {
    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      scroll: 'manual',
      queryParams: {
        q: clear ? null : this.search().trim() || null,
        cat: clear || this.category() === 'Todas' ? null : this.category(),
        sort: clear || this.sort() === 'featured' ? null : this.sort(),
      },
    });
  }
}
