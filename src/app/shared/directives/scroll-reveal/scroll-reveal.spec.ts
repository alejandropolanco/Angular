import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevealVariant, ScrollReveal } from './scroll-reveal';

/** Doble de `IntersectionObserver` que permite disparar intersecciones a mano. */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly observed = new Set<Element>();
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds: readonly number[] = [];

  constructor(private readonly callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observed.add(element);
  }

  unobserve(element: Element): void {
    this.observed.delete(element);
  }

  disconnect(): void {
    this.observed.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(element: Element, isIntersecting: boolean): void {
    this.callback(
      [{ target: element, isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

@Component({
  standalone: true,
  imports: [ScrollReveal],
  template: `<div class="reveal" [appReveal]="variant()" [appRevealDelay]="delay()">Contenido</div>`,
})
class HostComponent {
  readonly variant = signal<RevealVariant | ''>('');
  readonly delay = signal(0);
}

describe('ScrollReveal', () => {
  let fixture: ComponentFixture<HostComponent>;
  let reducedMotion = false;

  /** Rect visible dentro del viewport para simular un elemento ya en pantalla. */
  const visibleRect = {
    top: 100,
    bottom: 200,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: 100,
    toJSON: () => ({}),
  } as DOMRect;

  beforeEach(async () => {
    reducedMotion = false;
    MockIntersectionObserver.instances = [];

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: reducedMotion && query.includes('reduce'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }));

    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function hostElement(): HTMLElement {
    return fixture.nativeElement.querySelector('.reveal') as HTMLElement;
  }

  async function render(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('adds the default reveal classes and observes off-screen elements', async () => {
    await render();

    const el = hostElement();
    expect(el.classList.contains('nv-reveal')).toBe(true);
    expect(el.classList.contains('nv-reveal--up')).toBe(true);
    expect(el.classList.contains('nv-revealed')).toBe(false);
    expect(MockIntersectionObserver.instances.length).toBe(1);
    expect(MockIntersectionObserver.instances[0].observed.has(el)).toBe(true);
  });

  it('applies the requested variant and delay', async () => {
    fixture.componentInstance.variant.set('left');
    fixture.componentInstance.delay.set(150);

    await render();

    const el = hostElement();
    expect(el.classList.contains('nv-reveal--left')).toBe(true);
    expect(el.style.getPropertyValue('--nv-reveal-delay')).toBe('150ms');
  });

  it('reveals immediately when the element is already in view', async () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(visibleRect);

    await render();

    const el = hostElement();
    expect(el.classList.contains('nv-revealed')).toBe(true);
    expect(MockIntersectionObserver.instances.length).toBe(0);
  });

  it('reveals the element when the observer reports an intersection', async () => {
    await render();

    const el = hostElement();
    const observer = MockIntersectionObserver.instances[0];

    observer.trigger(el, false);
    expect(el.classList.contains('nv-revealed')).toBe(false);

    observer.trigger(el, true);
    expect(el.classList.contains('nv-revealed')).toBe(true);
    expect(observer.observed.size).toBe(0);
  });

  it('does nothing when the user prefers reduced motion', async () => {
    reducedMotion = true;

    await render();

    const el = hostElement();
    expect(el.classList.contains('nv-reveal')).toBe(false);
    expect(MockIntersectionObserver.instances.length).toBe(0);
  });

  it('does nothing when IntersectionObserver is unavailable', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    await render();

    expect(hostElement().classList.contains('nv-reveal')).toBe(false);
  });
});
