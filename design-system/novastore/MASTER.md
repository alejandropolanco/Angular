# NovaStore — Design System "Quiet Tech"

> Fuente de verdad visual para la tienda online de periféricos NovaStore.
> Stack: Angular 21 · PrimeNG 21 · SCSS · SSR.
> Última actualización: 2026-11-14.

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
| Que el precio y la disponibilidad se entiendan en < 2 s | Precio jerárquico, descuento como pill, stock como tag semántico. |
| Reducir fricción de compra | CTA "Añadir" siempre visible, carrito persistente, badge de cantidad en el header. |
| Generar confianza | Compra protegida, envío express, valoraciones, estados vacíos claros, checkout demo explícito. |
| Incentivar ticket promedio | Progreso de envío gratis (umbral $1,500) visible en el carrito. |
| Que se sienta moderna y "Apple-like" | Estilo iOS: superficies blancas, glass solo en navegación, esquinas continuas, azul de acción, movimiento con spring. |
| Rendimiento percibido | Skeleton loading con dimensiones estables (cero layout shift) y feedback inmediato. |

### Principios

1. **Claridad antes que decoración.** El producto es el protagonista; la UI desaparece.
2. **Un solo acento de acción.** Azul iOS para lo accionable; el resto es neutro.
3. **Profundidad suave.** Sombras cortas y difusas, nunca glow neón.
4. **Continuidad.** Radios generosos, superficies translúcidas solo donde hay scroll detrás.
5. **Movimiento con propósito.** Micro-interacciones < 300 ms; respeta `prefers-reduced-motion`.

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

**"Quiet Tech"**: la limpieza de la Apple Store con la precisión de un producto
de hardware. Fondo gris sistema iOS (`#F2F2F7`), superficies blancas, tipografía
Inter, azul de acción `#0A84FF`, y un índigo secundario reservado para detalles
de marca. Sin ruido.

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

| Token | Valor | Uso |
| --- | --- | --- |
| `--nv-blue-500` | `#0A84FF` | Acción primaria (iOS blue) |
| `--nv-blue-600` | `#0066CC` | Hover / pressed |
| `--nv-blue-50` | `#EAF4FF` | Tinte de selección |
| `--nv-indigo-500` | `#5E5CE6` | Acento de marca secundario |
| `--nv-green-600` | `#248A3D` | Disponible / éxito |
| `--nv-orange-600` | `#B25000` | Últimas unidades |
| `--nv-red-600` | `#D70015` | Agotado / destructivo |
| `--nv-yellow-500` | `#FFB800` | Estrellas de valoración |
| `--nv-gray-0` | `#FFFFFF` | Superficie |
| `--nv-gray-50` | `#F9F9FB` | Superficie suave |
| `--nv-gray-100` | `#F2F2F7` | Fondo de app (iOS system background) |
| `--nv-gray-200` | `#E5E5EA` | Separadores sólidos |
| `--nv-gray-400` | `#C7C7CC` | Placeholder / deshabilitado |
| `--nv-gray-600` | `#8E8E93` | Texto terciario |
| `--nv-gray-700` | `#6E6E73` | Texto secundario |
| `--nv-gray-900` | `#1D1D1F` | Texto primario |
| `--nv-black` | `#000000` | Fondo dark |

### 3.2 Color — semánticos

| Token | Claro | Dark (`.app-dark`) |
| --- | --- | --- |
| `--nv-bg` | `#F2F2F7` | `#000000` |
| `--nv-bg-soft` | `#F9F9FB` | `#0A0A0C` |
| `--nv-surface` | `#FFFFFF` | `#1C1C1E` |
| `--nv-surface-2` | `#F9F9FB` | `#2C2C2E` |
| `--nv-surface-3` | `#E5E5EA` | `#3A3A3C` |
| `--nv-surface-glass` | `rgba(255,255,255,.78)` | `rgba(28,28,30,.72)` |
| `--nv-border` | `rgba(60,60,67,.12)` | `rgba(84,84,88,.60)` |
| `--nv-border-strong` | `rgba(10,132,255,.32)` | `rgba(10,132,255,.42)` |
| `--nv-text` | `#1D1D1F` | `#F5F5F7` |
| `--nv-text-muted` | `#6E6E73` | `#A1A1A6` |
| `--nv-text-dim` | `#8E8E93` | `#8E8E93` |
| `--nv-primary` | `#0A84FF` | `#0A84FF` |
| `--nv-primary-strong` | `#0066CC` | `#409CFF` |
| `--nv-primary-soft` | `#EAF4FF` | `rgba(10,132,255,.16)` |
| `--nv-success` | `#248A3D` | `#30D158` |
| `--nv-warning` | `#B25000` | `#FF9F0A` |
| `--nv-danger` | `#D70015` | `#FF453A` |
| `--nv-star` | `#FFB800` | `#FFD60A` |

**Contraste:** texto primario y secundario ≥ 4.5:1 sobre su superficie en ambos
modos. El acento nunca es el único indicador de estado (se acompaña de texto/icono).

### 3.3 Tipografía

- Familia única: **Inter**, fallback `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif`.
- Display y body comparten familia; el display se diferencia por peso y tracking.
- `font-display: swap` (Google Fonts ya lo incluye).

| Rol | Token | Tamaño / línea | Peso | Tracking |
| --- | --- | --- | --- | --- |
| Display | `--nv-text-display` | `clamp(2.5rem, 6vw, 4rem)` / 1.05 | 700 | -0.03em |
| H1 | `--nv-text-h1` | `clamp(2rem, 4vw, 3rem)` / 1.1 | 700 | -0.025em |
| H2 | `--nv-text-h2` | `clamp(1.5rem, 3vw, 2rem)` / 1.15 | 700 | -0.02em |
| H3 | `--nv-text-h3` | `1.25rem` / 1.3 | 600 | -0.015em |
| Headline | `--nv-text-headline` | `1.0625rem` / 1.3 | 600 | -0.01em |
| Body | `--nv-text-body` | `1rem` / 1.5 | 400 | 0 |
| Callout | `--nv-text-callout` | `0.9375rem` / 1.4 | 400 | 0 |
| Subhead | `--nv-text-subhead` | `0.875rem` / 1.35 | 500 | 0 |
| Footnote | `--nv-text-footnote` | `0.8125rem` / 1.35 | 400 | 0 |
| Caption | `--nv-text-caption` | `0.75rem` / 1.3 | 500 | 0 |
| Overline | `--nv-text-overline` | `0.6875rem` / 1.2 | 700 | 0.12em, uppercase |

### 3.4 Espaciado (base 4 pt, ritmo 8 pt)

`--nv-space-1: 4px` · `2: 8` · `3: 12` · `4: 16` · `5: 20` · `6: 24` · `7: 28`
· `8: 32` · `10: 40` · `12: 48` · `16: 64` · `20: 80` · `24: 96`.

Secciones: `--nv-section: clamp(3rem, 7vw, 6rem)`.
Gutter: `--nv-gutter: clamp(1rem, 4vw, 2rem)`.

### 3.5 Radios y sombras

| Token | Valor | Uso |
| --- | --- | --- |
| `--nv-radius-xs` | `6px` | Chips pequeños, badges |
| `--nv-radius-sm` | `10px` | Inputs internos, botones pequeños |
| `--nv-radius-md` | `14px` | Botones, steppers |
| `--nv-radius-lg` | `18px` | Tarjetas compactas |
| `--nv-radius-xl` | `24px` | Tarjetas de producto, paneles |
| `--nv-radius-2xl` | `28px` | Hero, sheets |
| `--nv-radius-pill` | `999px` | Tags, chips, avatares |

| Sombra | Valor |
| --- | --- |
| `--nv-shadow-xs` | `0 1px 2px rgba(0,0,0,.04)` |
| `--nv-shadow-sm` | `0 2px 8px rgba(0,0,0,.05)` |
| `--nv-shadow-md` | `0 8px 24px rgba(0,0,0,.07)` |
| `--nv-shadow-lg` | `0 20px 48px rgba(0,0,0,.10)` |
| `--nv-focus-ring` | `0 0 0 4px rgba(10,132,255,.18)` |

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

- Ancho máximo: `1200px`.
- Header sticky: `64px`, glass (`blur(20px) saturate(180%)`).
- Breakpoints: `480`, `768`, `1024`, `1280`.
- Grid catálogo: `repeat(auto-fill, minmax(240px, 1fr))`, gap `20px`.
- Contenido de texto: máx. `68ch`.

---

## 4. Componentes

### Botones (`p-button` + `.btn`)

| Variante | Fondo | Texto | Borde |
| --- | --- | --- | --- |
| Primary | `--nv-primary` | `#FFFFFF` | ninguno |
| Tinted | `--nv-primary-soft` | `--nv-primary` | ninguno |
| Ghost | transparente | `--nv-text-muted` | ninguno |
| Destructive | `--nv-danger-soft` | `--nv-danger` | ninguno |

Altura 44 px (48 en móvil), radio `14px`, peso 600, icono 16 px.
Hover: `--nv-primary-strong`. Press: `scale(.98)`. Disabled: opacidad `.4`.

### Inputs

Altura 44 px, radio `12px`, fondo `--nv-surface`, borde `--nv-border`.
Focus: borde `--nv-primary` + `--nv-focus-ring`. Label 13 px / 600.
Error: borde `--nv-danger` + mensaje `--nv-text-footnote`.

### Tarjeta de producto (`app-product-card`)

- Media 4:3 sobre `--nv-gray-50`, imagen `object-fit: contain`.
- Radio `--nv-radius-xl`, superficie blanca, borde hairline, `--nv-shadow-sm`.
- Hover: `translateY(-4px)` + `--nv-shadow-md` (sin glow).
- Badge (Top ventas/Nuevo) pill azul; descuento pill rojo.
- Stock tag semántico (verde/naranja/rojo) con texto.
- Rating con estrellas `--nv-star` + valor numérico.
- Precio `1.35rem` 700; precio anterior tachado en terciario.
- CTA "Añadir" tinted azul; deshabilitado si agotado.

### Navegación

Header glass sticky con borde hairline. Links pill; activo con tinte azul.
Carrito circular 44 px con badge contador. Drawer móvil tipo sheet iOS
(radio superior 24 px, scrim `.32`).

### Chips de categoría

Pill 34 px, fondo `--nv-surface-2`, texto secundario. Activo: fondo azul,
texto blanco. Scroll horizontal en móvil, sin scrollbar visible.

### Tags de stock

Pill tintado, texto ≥ 12 px, peso 600. Colores semánticos suaves.

### Toast / Dialog / Confirm

Superficie glass, radio 18 px, `--nv-shadow-lg`, texto primario.

### Empty state

Icono en círculo tintado azul, título H3, mensaje ≤ 400 px, CTA tinted.
Altura mínima 320 px para evitar saltos.

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
- `app-product-card-skeleton`: réplica de la tarjeta (media 4:3, 2 líneas de
  descripción, footer de precio + CTA).
- Catálogo: grid de 6 skeletons mientras `isLoading()`.
- Carrito: filas skeleton si la hidratación del carrito lo requiere.

### Tokens de skeleton

```scss
--nv-skeleton-base: #e9e9ee;
--nv-skeleton-shine: #f5f5f7;
--nv-skeleton-radius: 10px;
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
| Catálogo | `src/app/features/store/pages/` |
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
- [ ] Un solo acento de acción por vista.
