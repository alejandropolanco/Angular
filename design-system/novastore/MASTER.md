# NovaStore — Design System "Clean Tech Monocromo"

> Fuente de verdad visual para la tienda online de periféricos NovaStore.
> Stack: Angular 21 · PrimeNG 21 · SCSS · SSR.
> Última actualización: 2026-11-15.

---

## 1. Contexto de negocio

NovaStore vende periféricos y tecnología premium (laptops, audio, mice, teclados,
monitores, sillas, wearables, streaming). El objetivo del sitio es **convertir
visitas en ventas** y transmitir confianza en una categoría donde el precio es
alto y la comparación es constante.

### Necesidades del negocio que el diseño debe resolver

| Necesidad | Decisión de diseño |
| --- | --- |
| Que el producto se vea premium y deseable | Fotografía grande sobre superficie neutra, tarjetas limpias, tipografía precisa, sombras suaves. |
| Que el precio y la disponibilidad se entiendan en < 2 s | Precio jerárquico en mono, descuento como pill, stock como tag semántico. |
| Reducir fricción de compra | CTA "Añadir" siempre visible, carrito persistente, badge de cantidad en el header. |
| Generar confianza | Compra protegida, envío express, valoraciones, estados vacíos claros, checkout demo explícito. |
| Incentivar ticket promedio | Progreso de envío gratis (umbral $1,500) visible en el carrito. |
| Que se sienta moderna y premium | Clean Tech monocromo: papel cálido, superficies blancas, borde hairline, tipografía editorial, un solo acento (la tinta). Home tipo revista. |
| Rendimiento percibido | Skeleton loading con dimensiones estables (cero layout shift) y feedback inmediato. |

### Principios

1. **Claridad antes que decoración.** El producto es el protagonista; la UI desaparece.
2. **Un solo acento: el contraste tinta/papel.** Sin color de marca compitiendo por atención; los estados semánticos (éxito/aviso/peligro) se conservan solo como señal.
3. **Profundidad suave.** Bordes hairline y sombras difusas; nunca glow neón.
4. **Continuidad.** Radios contenidos, superficies translúcidas solo donde hay scroll detrás.
5. **Editorial en la home.** Retícula de revista, display serif (Bodoni Moda), mucho aire; el catálogo, el carrito y el auth son utilitarios.
6. **Movimiento con propósito.** Micro-interacciones < 300 ms; respeta `prefers-reduced-motion`.

### Anti-patrones (prohibido en este proyecto)

- Gradientes neón cian/púrpura, glows, grids cyberpunk.
- Más de un color de acento compitiendo por atención.
- Glassmorphism en contenido denso o tarjetas de producto.
- Sombras negras duras o bordes de 1 px de color saturado.
- Emojis como iconos estructurales (usar PrimeIcons).
- Skeletons que cambian el alto/ancho del layout final.
- Spinners en áreas de contenido (solo en botones de submit).

---

## 2. Dirección visual

**"Clean Tech Monocromo"**: papel cálido y tinta. La base es una escala neutra
cálida (*stone*) sobre la que el único acento es el contraste tinta/papel — sin
color de marca. Dos registros conviven:

- **Utilitario** (catálogo, carrito, auth, 404): retícula limpia, bordes
  hairline, superficies blancas, densidad cómoda.
- **Editorial** (home): hero full-bleed en blanco y negro, manifiesto de
  valores, split con *pull quote* y banda CTA en tinta; se lee como una
  revista premium, no como una ficha de producto.

Tipografía: **Bodoni Moda** (display editorial, serif), **Inter** (UI/cuerpo),
**JetBrains Mono** (precios y datos).

- **Modo:** automático según `prefers-color-scheme` del sistema. El script externo
  `public/theme-init.js` aplica `.app-dark` en `<html>` antes del primer paint y escucha
  cambios en vivo; no hay flash de tema claro ni toggle manual. Es un archivo externo
  porque el CSP del servidor (`script-src 'self'`) bloquea scripts inline.
- **Densidad:** cómoda en marketing/catálogo; compacta en tablas y carrito.
- **Personalidad:** sereno, preciso, confiable, premium.

---

## 3. Tokens (3 capas)

Arquitectura: **Primitive → Semantic → Component**. En código viven en
`src/styles/_tokens.scss` como Custom Properties CSS.

### 3.1 Color — primitivos

Escala neutra cálida *stone* (Tailwind). Todo el sistema se construye sobre ella;
el "acento" es el extremo oscuro de la escala (la tinta).

| Token | Valor | Uso |
| --- | --- | --- |
| `--nv-stone-50` | `#FAFAF9` | Papel (fondo de app) |
| `--nv-stone-100` | `#F5F5F4` | Superficie suave / superficie 2 |
| `--nv-stone-200` | `#E7E5E4` | Bordes hairline |
| `--nv-stone-300` | `#D6D3D1` | Bordes en hover |
| `--nv-stone-400` | `#A8A29E` | Texto atenuado en dark |
| `--nv-stone-500` | `#78716C` | Texto terciario |
| `--nv-stone-600` | `#57534E` | Texto secundario |
| `--nv-stone-700` | `#44403C` | Superficie 3 en dark |
| `--nv-stone-800` | `#292524` | Superficie 2 en dark / hover de tinta |
| `--nv-stone-900` | `#1C1917` | Superficie en dark |
| `--nv-stone-950` | `#0C0A09` | Tinta (texto y acción) |
| `--nv-gray-0` | `#FFFFFF` | Superficie (papel elevado) |

Los alias heredados `--nv-gray-*` apuntan a la escala `--nv-stone-*`.

Estados (se conservan como señal semántica, no como acento):

| Token | Valor | Uso |
| --- | --- | --- |
| `--nv-green-600` | `#15803D` | Disponible / éxito |
| `--nv-orange-600` | `#B45309` | Últimas unidades |
| `--nv-red-600` | `#B91C1C` | Agotado / destructivo |

### 3.2 Color — semánticos

| Token | Claro | Dark (`.app-dark`) |
| --- | --- | --- |
| `--nv-bg` | `#FAFAF9` | `#0C0A09` |
| `--nv-bg-soft` | `#F5F5F4` | `#141210` |
| `--nv-surface` | `#FFFFFF` | `#1C1917` |
| `--nv-surface-2` | `#F5F5F4` | `#292524` |
| `--nv-surface-3` | `#E7E5E4` | `#44403C` |
| `--nv-surface-glass` | `rgba(250,250,249,.82)` | `rgba(12,10,9,.78)` |
| `--nv-border` | `#E7E5E4` | `#292524` |
| `--nv-border-strong` | `#0C0A09` | `#FAFAF9` |
| `--nv-text` | `#0C0A09` | `#FAFAF9` |
| `--nv-text-muted` | `#57534E` | `#A8A29E` |
| `--nv-text-dim` | `#78716C` | `#78716C` |
| `--nv-primary` | `#0C0A09` (tinta) | `#FAFAF9` (papel) |
| `--nv-primary-strong` | `#292524` | `#E7E5E4` |
| `--nv-primary-soft` | `#F5F5F4` | `rgba(250,250,249,.08)` |
| `--nv-success` | `#15803D` | `#4ADE80` |
| `--nv-warning` | `#B45309` | `#FBBF24` |
| `--nv-danger` | `#B91C1C` | `#F87171` |
| `--nv-star` | `= --nv-text` (tinta) | `= --nv-text` |

**Contraste:** texto primario y secundario ≥ 4.5:1 sobre su superficie en ambos
modos. El acento nunca es el único indicador de estado (se acompaña de texto/icono).
Las estrellas de valoración usan la tinta, no un amarillo.

### 3.3 Tipografía

Tres familias, cada una con un rol claro:

- **Bodoni Moda** — display editorial (serif). Titulares de la home, precios
  destacados, código 404. `--nv-font-display`.
- **Inter** — UI y cuerpo. `--nv-font-body`, fallback
  `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.
- **JetBrains Mono** — datos y precios. `--nv-font-mono`, fallback
  `ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace`.

`font-display: swap` (Google Fonts ya lo incluye).

| Rol | Token | Tamaño / línea | Peso | Tracking |
| --- | --- | --- | --- | --- |
| Display | `--nv-text-display` | `clamp(2.75rem, 7.5vw, 5.75rem)` / 0.95 | 400 (serif) | -0.03em |
| H1 | `--nv-text-h1` | `clamp(2.25rem, 5vw, 3.75rem)` / 1.05 | 400 (serif) | -0.025em |
| H2 | `--nv-text-h2` | `clamp(1.75rem, 3.4vw, 2.75rem)` / 1.1 | 400 (serif) | -0.02em |
| H3 | `--nv-text-h3` | `1.25rem` / 1.3 | 600 | -0.015em |
| Headline | `--nv-text-headline` | `1.0625rem` / 1.3 | 600 | -0.01em |
| Body | `--nv-text-body` | `1rem` / 1.6 | 400 | 0 |
| Callout | `--nv-text-callout` | `0.9375rem` / 1.4 | 400 | 0 |
| Subhead | `--nv-text-subhead` | `0.875rem` / 1.35 | 500 | 0 |
| Footnote | `--nv-text-footnote` | `0.8125rem` / 1.35 | 400 | 0 |
| Caption | `--nv-text-caption` | `0.75rem` / 1.3 | 500 | 0 |
| Overline | `--nv-text-overline` | `0.6875rem` / 1.2 | 600 | 0.16em, uppercase |

### 3.4 Espaciado (base 4 pt, ritmo 8 pt)

`--nv-space-1: 4px` · `2: 8` · `3: 12` · `4: 16` · `5: 20` · `6: 24` · `7: 28`
· `8: 32` · `10: 40` · `12: 48` · `16: 64` · `20: 80` · `24: 96`.

Secciones: `--nv-section: clamp(4rem, 9vw, 8rem)`.
Gutter: `--nv-gutter: clamp(1.25rem, 5vw, 3rem)`.

### 3.5 Radios y sombras

| Token | Valor | Uso |
| --- | --- | --- |
| `--nv-radius-xs` | `4px` | Chips pequeños, badges |
| `--nv-radius-sm` | `8px` | Inputs, botones |
| `--nv-radius-md` | `12px` | Botones grandes, overlays |
| `--nv-radius-lg` | `16px` | Tarjetas compactas |
| `--nv-radius-xl` | `20px` | Tarjetas de producto, paneles |
| `--nv-radius-2xl` | `28px` | Hero, sheets |
| `--nv-radius-pill` | `999px` | Tags, chips, avatares |

| Sombra | Valor |
| --- | --- |
| `--nv-shadow-xs` | `0 1px 2px rgba(12,10,9,.04)` |
| `--nv-shadow-sm` | `0 1px 3px rgba(12,10,9,.05), 0 8px 24px -14px rgba(12,10,9,.10)` |
| `--nv-shadow-md` | `0 2px 6px rgba(12,10,9,.05), 0 20px 44px -22px rgba(12,10,9,.16)` |
| `--nv-shadow-lg` | `0 4px 12px rgba(12,10,9,.06), 0 40px 80px -34px rgba(12,10,9,.24)` |
| `--nv-focus-ring` | `0 0 0 3px rgba(12,10,9,.14)` |

### 3.6 Movimiento

| Token | Valor |
| --- | --- |
| `--nv-duration-fast` | `120ms` |
| `--nv-duration-base` | `200ms` |
| `--nv-duration-slow` | `320ms` |
| `--nv-duration-reveal` | `620ms` (entrada de tarjetas, stagger 75ms) |
| `--nv-ease` | `cubic-bezier(.25,.1,.25,1)` |
| `--nv-ease-spring` | `cubic-bezier(.22,1,.36,1)` |
| `--nv-transition` | `200ms cubic-bezier(.25,.1,.25,1)` |

Press en botones: `transform: scale(.98)` sin cambiar bounds.
Entrada de tarjetas: `opacity 0→1` + `translateY(8px→0)` con spring.
Todo desactivado bajo `prefers-reduced-motion: reduce`.

### 3.7 Layout

- Ancho máximo: `1280px`.
- Header sticky: `72px` (`--nv-header-height`), glass (`blur(20px) saturate(180%)`) con borde hairline. El contenido arranca a ras del header (el hero de la home no se superpone).
- Breakpoints: `480`, `768`, `1024`, `1280`.
- Grid catálogo: `repeat(auto-fill, minmax(240px, 1fr))`, gap `20px`.
- Contenido de texto: máx. `68ch`.

---

## 4. Componentes

### Botones (`p-button` + `.btn`)

| Variante | Fondo | Texto | Borde |
| --- | --- | --- | --- |
| Primary | `--nv-text` (tinta) | `--nv-bg` (papel) | ninguno |
| Tinted | `--nv-primary-soft` | `--nv-text` | ninguno |
| Ghost | transparente | `--nv-text-muted` | ninguno |
| Destructive | `--nv-danger-soft` | `--nv-danger` | ninguno |

Altura 44 px (46 en carrito), radio `--nv-radius-sm`/`--nv-radius-md`, peso 600,
icono 16 px. Hover: `--nv-primary-strong`. Press: `scale(.98)`. Disabled: opacidad `.4`.

### Inputs

Altura 44 px, radio `--nv-radius-sm` (8px), fondo `--nv-surface`, borde `--nv-border`.
Focus: borde `--nv-text` + `--nv-focus-ring`. Label 13 px / 600.
Error: borde `--nv-danger` + mensaje `--nv-text-footnote`.

### Tarjeta de producto (`app-product-card`)

- Media 4:3 sobre `--nv-surface-2`, imagen `object-fit: contain`.
- Radio `--nv-radius-xl`, superficie blanca, borde hairline, `--nv-shadow-sm`.
- Hover: `translateY(-4px)` + `--nv-shadow-md` (sin glow).
- Badge (Top ventas/Nuevo) pill en tinta; descuento pill en tinta con texto papel.
- Stock tag semántico (verde/naranja/rojo) con texto.
- Rating con estrellas en tinta (`--nv-star`) + valor numérico.
- Precio en `--nv-font-mono`; precio anterior tachado en terciario.
- CTA "Añadir" 95×38, radio 8px, en tinta; deshabilitado si agotado.

### Navegación

Header glass sticky (72 px) con borde hairline. Links con regla/subrayado al activo.
Carrito circular con badge contador en tinta. Drawer móvil tipo sheet
(radio superior, scrim `rgba(12,10,9,.4)`).

### Chips de categoría

Pill, fondo `--nv-surface-2`, texto secundario. Activo: fondo tinta,
texto papel. Scroll horizontal en móvil, sin scrollbar visible.

### Tags de stock

Pill tintado, texto ≥ 12 px, peso 600. Colores semánticos suaves.

### Toast / Dialog / Confirm

Superficie glass, radio `--nv-radius-lg`/`--nv-radius-xl`, `--nv-shadow-lg`,
texto primario. El overlay del `p-select` (radio `--nv-radius-md`,
`--nv-shadow-lg`) se monta en `<body>`, por eso sus overrides viven en
`_prime-overrides.scss` con especificidad doble.

### Empty state

Icono en círculo neutro, título H3, mensaje ≤ 400 px, CTA en tinta.
Altura mínima 320 px para evitar saltos.

### Home (editorial)

Hero full-bleed (`images/fondo.jpg` en escala de grises + overlay tinta),
manifiesto de valores, catálogo destacado, split editorial con *pull quote*
(`images/fondo.1.jpg`) y banda CTA en tinta.

---

## 5. Skeleton loading (especificación profesional)

El skeleton debe **parecer el contenido final**, no una caja genérica.

### Reglas

1. **Cero layout shift:** el skeleton ocupa exactamente el mismo alto/ancho,
   padding, aspect-ratio y cantidad de líneas que el contenido real.
2. **Solo para esperas perceptibles:** mostrar si la carga supera ~200 ms.
   Para operaciones casi instantáneas no parpadear.
3. **Shimmer sutil:** gradiente neutro `--nv-skeleton-base → --nv-skeleton-shine`
   con `background-size: 200% 100%` y animación de 1.4 s.
4. **Accesibilidad:** contenedor con `aria-busy="true"`; skeleton `aria-hidden="true"`.
   Anunciar el resultado con `aria-live="polite"` cuando llegue.
5. **Reduced motion:** shimmer estático (sin animación).
6. **Imágenes:** placeholder shimmer detrás de la imagen hasta el evento `load`;
   fade-in de 200 ms. Si falla, se mantiene un placeholder neutro.
7. **Botones:** nunca skeleton; usan `[loading]` de PrimeNG.

### Piezas

- `app-skeleton`: primitiva (`width`, `height`, `radius`, `circle`, `text`).
- `app-product-card-skeleton`: réplica geométrica exacta de la tarjeta
  (borde hairline, media 4:3, 2 líneas de descripción, footer con borde superior,
  precio 66/44 px y CTA 95×38 px) para que el paso a contenido no mueva el layout.
- Catálogo: grid de 6 skeletons mientras `isLoading()`.
- Carrito: filas skeleton si la hidratación del carrito lo requiere.

### Tokens de skeleton

```scss
--nv-skeleton-base: #edecea;
--nv-skeleton-shine: #f7f6f5;
--nv-skeleton-radius: var(--nv-radius-sm);
```

---

## 6. Mapa de implementación

| Token / regla | Archivo |
| --- | --- |
| Tokens | `src/styles/_tokens.scss` |
| Base y utilidades | `src/styles/_base.scss` |
| Overrides PrimeNG | `src/styles/_prime-overrides.scss` |
| Tema PrimeNG | `src/app/core/theme/app-preset.ts` |
| Fuentes / meta | `src/index.html` |
| Skeleton primitiva | `src/app/shared/components/skeleton/` |
| Skeleton de tarjeta | `src/app/shared/components/product-card-skeleton/` |
| Catálogo y home editorial | `src/app/features/store/pages/` |
| Tarjeta real | `src/app/shared/components/product-card/` |
| Header / Footer / Layout | `src/app/layout/` |
| Carrito | `src/app/features/cart/pages/cart-page/` |
| Auth | `src/app/features/auth/` |

---

## 7. Checklist de entrega

- [ ] Contraste ≥ 4.5:1 en texto normal (claro y oscuro).
- [ ] Foco visible en todos los interactivos (≥ 3:1).
- [ ] Touch targets ≥ 44×44 px.
- [ ] Sin layout shift al pasar de skeleton a contenido.
- [ ] `prefers-reduced-motion` respetado.
- [ ] Iconos solo de PrimeIcons, con `aria-hidden` cuando son decorativos.
- [ ] Estados vacíos, loading y error definidos para cada vista.
- [ ] Un solo acento de acción por vista (la tinta).
