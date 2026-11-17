import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
} from '@angular/core';

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';

/**
 * Revela el elemento cuando entra en el viewport.
 *
 * - En el servidor (SSR/prerender) el HTML sale visible: no hay CLS ni parpadeo.
 * - Con `prefers-reduced-motion: reduce` no se oculta nada.
 * - Los elementos ya visibles en el primer render no se ocultan (evita el flash
 *   de hidratación); el resto se oculta y aparece al hacer scroll.
 *
 * Uso: `<section appReveal>` o `<section [appReveal]="'left'" [appRevealDelay]="120">`.
 */
@Directive({
  selector: '[appReveal]',
})
export class ScrollReveal {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  /** Variante de entrada. Por defecto `'up'`. */
  readonly appReveal = input<RevealVariant | ''>('');

  /** Retardo en ms antes de revelar (para escalonar grupos). */
  readonly appRevealDelay = input<number>(0);

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const el = this.host.nativeElement;
    const variant = this.appReveal() || 'up';
    const delay = this.appRevealDelay();

    const rect = el.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const alreadyVisible = rect.top < viewport * 0.92 && rect.bottom > 0;

    el.classList.add('nv-reveal', `nv-reveal--${variant}`);

    if (delay > 0) {
      el.style.setProperty('--nv-reveal-delay', `${delay}ms`);
    }

    if (alreadyVisible) {
      // Mismo frame: nunca llega a pintarse oculto.
      el.classList.add('nv-revealed');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('nv-revealed');
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    observer.observe(el);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
