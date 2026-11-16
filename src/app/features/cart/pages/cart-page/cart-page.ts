import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CartService } from '../../services/cart-service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-cart-page',
  imports: [CurrencyPipe, ConfirmDialogModule, EmptyState],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly cartService = inject(CartService);

  remove(id: string): void {
    const item = this.cartService.cartItems().find((cartItem) => cartItem.id === id);
    this.cartService.removeFromCart(id);

    if (item) {
      this.messageService.add({
        severity: 'info',
        summary: 'Producto eliminado',
        detail: `${item.name} salió del carrito.`,
        life: 2200,
      });
    }
  }

  confirmClear(): void {
    this.confirmationService.confirm({
      header: 'Vaciar carrito',
      message: '¿Seguro que quieres eliminar todos los productos de tu carrito?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, vaciar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.cartService.clearCart();
        this.messageService.add({
          severity: 'info',
          summary: 'Carrito vacío',
          detail: 'Puedes seguir explorando el catálogo.',
          life: 2200,
        });
      },
    });
  }

  checkout(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Checkout de demostración',
      detail: 'Esta tienda es una demo: no se procesarán pagos reales.',
      life: 3200,
    });
  }

  goToStore(): void {
    this.router.navigateByUrl('/store');
  }
}
