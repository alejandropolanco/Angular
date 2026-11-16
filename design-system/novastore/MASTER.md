# NovaStore — Design System "Hardware Press" (v2)

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
| Que el producto se vea premium y deseable | Fotografía grande sobre blanco fijo, marco de 2px, tipografía precisa y cero decoración compitiendo. |
| Que el precio y la disponibilidad se entiendan en < 2 s | Precio en mono, stock como bloque sólido con texto, descuento como bloque rojo. |
| Reducir fricción de compra | CTA "Añadir" de ancho completo, carrito persistente y badge de cantidad en el header. |
| Generar confianza | Compra protegida, envío 24 h, valoraciones, estados vacíos claros y demo explícita. |
| Incentivar ticket promedio | Progreso de envío gratis (umbral $1,500) visible en el carrito. |
| Que se sienta profesional, no "plantilla Gen Z" | Grilla estricta, paleta limitada, un solo acento, radios 0 y tipografía editorial. |
| Rendimiento percibido | Skeleton loading con dimensiones idénticas al contenido final (cero CLS). |

### Principios

1. **La foto manda, la interfaz enmarca.** El producto es el protagonista; los bordes separan, no decoran.
2. **Un solo acento de acción.** El ácido `#DFE104` se reserva para CTA y highlights; el azul `#0047FF` solo para foco y enlaces.
3. **Forma dura, información blanda.** Bordes 2px, radios 0 y sombras offset; el contenido se ordena con jerarquía tipográfica, no con efectos.
4. **Ritmo seco.** Movimiento de 120–320 ms; sin rebotes ni parallax.
5. **Contraste primero.** Texto ≥ 4.5:1, foco siempre visible, movimiento reducido respetado.

### Anti-patrones (prohibido en este proyecto)

- Gradientes, glows, glassmorphism y blur decorativo.
- Radios distintos de 0 en superficies, botones o inputs.
- Sombras difusas con blur; solo offsets duros.
- Más de un color de acento compitiendo por atención.
- Rotaciones en tarjetas (solo se permite -2° en un sticker aislado).
- Skeletons que cambian el alto/ancho del layout final.
- Spinners en áreas de contenido (solo `[loading]` en botones de submit).

---

## 2. Dirección visual

**"Hardware Press"** es neo-brutalismo editorial: la energía visual del
neubrutalismo (bordes visibles, bloques sólidos, tipografía pesada) domesticada
con una grilla suiza, una paleta de papel y tinta y un único acento ácido. Se
lee como una ficha técnica impresa: precisa, directa, profesional.

- **Modo:** automático según `prefers-color-scheme`. El script externo
  `public/theme-init.js` aplica `.app-dark` en `<html>` antes del primer paint y
  escucha cambios en vivo. Es externo porque el CSP del servidor
  (`script-src 'self'`) bloquea scripts inline.
- **Densidad:** cómoda en marketing/catálogo; compacta en tablas y carrito.
- **Personalidad:** técnica, segura, editorial, sin adornos.

### Referencias de criterio (ui-ux-pro-max)

- Estilo base: **Neubrutalism** (conversión V High; mobile adaptable).
- Patrón de landing: **Feature-Rich Showcase** (e-commerce).
- Reglas UX aplicadas: skeleton/loading y content-jumping son severidad High.
- Stack: Angular standalone, signals, `@if/@for`, `input()/output()`, OnPush.

---

## 3. Tokens (3 capas)

Arquitectura: **Primitive → Semantic → Component**. En código viven en
`src/styles/_tokens.scss` como Custom Properties CSS con prefijo `--nv-`.

### 3.1 Color — primitivos

| Token | Valor | Uso |
| --- | --- | --- |
| `--nv-ink` | `#0B0B0C` | Tinta / texto / bordes |
| `--nv-paper` | `#F5F2E9` | Papel / fondo claro |
| `--nv-white` | `#FFFFFF` | Superficie de producto |
| `--nv-acid` | `#DFE104` | Acento único (CTA, highlight) |
| `--nv-acid-hover` | `#C9CB00` | Hover del acento |
| `--nv-blue` | `#0047FF` | Foco y enlaces |
| `--nv-green-600` | `#067A4C` | Disponible / éxito |
| `--nv-orange-600` | `#9A4B00` | Últimas unidades |
| `--nv-red-600` | `#C81E1E` | Agotado / destructivo |
| `--nv-yellow-500` | `#F0B400` | Estrellas de valoración |

Escala `--nv-gray-*` cálida: `0 #FFFFFF` · `50 #FAF8F2` · `100 #F5F2E9` ·
`200 #EDE9DE` · `300 #DDD7C8` · `400 #C2BBAA` · `500 #8F887C` · `600 #6B655B` ·
`700 #57534E` · `800 #33322F` · `900 #0B0B0C`.

### 3.2 Color — semánticos

| Token | Claro | Dark (`.app-dark`) |
| --- | --- | --- |
| `--nv-bg` | `#F5F2E9` | `#0B0B0C` |
| `--nv-bg-soft` | `#EDE9DE` | `#111113` |
| `--nv-surface` | `#FFFFFF` | `#17171A` |
| `--nv-surface-2` | `#EDE9DE` | `#1F1F23` |
| `--nv-surface-3` | `#DDD7C8` | `#2B2B31` |
| `--nv-border` | `#0B0B0C` | `#F5F2E9` |
| `--nv-border-strong` | `#0047FF` | `#7AA2FF` |
| `--nv-text` | `#0B0B0C` | `#F5F2E9` |
| `--nv-text-muted` | `#57534E` | `#A8A29E` |
| `--nv-text-dim` | `#6B655B` | `#9A948D` |
| `--nv-primary` | `#0B0B0C` | `#F5F2E9` |
| `--nv-on-primary` | `#FFFFFF` | `#0B0B0C` |
| `--nv-accent` | `#DFE104` | `#DFE104` |
| `--nv-on-accent` | `#0B0B0C` | `#0B0B0C` |
| `--nv-success` | `#067A4C` | `#34D399` |
| `--nv-warning` | `#9A4B00` | `#FBBF24` |
| `--nv-danger` | `#C81E1E` | `#FF6B5E` |
| `--nv-star` | `#F0B400` | `#FACC15` |
| `--nv-shadow-color` | `#0B0B0C` | `#3F3F46` |

**Contraste:** tinta sobre papel ≈ 18:1; tinta sobre ácido ≈ 13:1; muted ≈ 7:1.
Cumple AA/AAA en texto normal en ambos modos.

### 3.3 Tipografía

| Rol | Familia | Token / uso |
| --- | --- | --- |
| Display | **Archivo Black** | Títulos H1/H2, wordmark, números grandes |
| UI / body | **Inter** 400–700 | Texto, labels, botones, párrafos |
| Datos | **JetBrains Mono** 500/700 | Precios, SKU, contadores, labels técnicos |

Carga única con `display=swap` desde Google Fonts (preconnect ya configurado).

| Rol | Token | Tamaño / línea | Tracking |
| --- | --- | --- | --- |
| Display | `--nv-text-display` | `clamp(3rem, 8vw, 6rem)` / 0.98 | -0.03em, uppercase |
| H1 | `--nv-text-h1` | `clamp(2.4rem, 5vw, 4rem)` / 0.98 | -0.03em, uppercase |
| H2 | `--nv-text-h2` | `clamp(1.8rem, 3vw, 2.6rem)` / 0.98 | -0.03em, uppercase |
| H3 | `--nv-text-h3` | `1.25rem` / 1.25 | -0.01em, Inter 700 |
| Body | `--nv-text-body` | `1rem` / 1.6 | 0, Inter 400 |
| Subhead | `--nv-text-subhead` | `0.875rem` / 1.4 | 0, Inter 500 |
| Caption | `--nv-text-caption` | `0.75rem` / 1.3 | Inter 500 |
| Overline | `--nv-text-overline` | `0.6875rem` / 1.2 | 0.14em, mono 700, uppercase |

### 3.4 Espaciado (base 4 pt, ritmo 8 pt)

`--nv-space-1: 4px` · `2: 8` · `3: 12` · `4: 16` · `5: 20` · `6: 24` · `7: 28`
· `8: 32` · `10: 40` · `12: 48` · `16: 64` · `20: 80` · `24: 96`.

Secciones: `--nv-section: clamp(3rem, 7vw, 6rem)`.
Gutter: `--nv-gutter: clamp(1rem, 4vw, 2rem)`.
Ancho máximo: `1240px`.

### 3.5 Forma — radios, bordes y sombras

- **Radios:** `0` en todo (`--nv-radius-*: 0`). Las únicas curvas permitidas son
  `border-radius: 50%` en avatares decorativos y spinners nativos.
- **Bordes:** `--nv-border-width: 2px` sólido con `--nv-border`; 3px en foco/active.
- **Sombras offset duras**, sin blur:

| Token | Valor |
| --- | --- |
| `--nv-shadow-xs` | `2px 2px 0 var(--nv-shadow-color)` |
| `--nv-shadow-sm` | `4px 4px 0 var(--nv-shadow-color)` |
| `--nv-shadow-md` | `6px 6px 0 var(--nv-shadow-color)` |
| `--nv-shadow-lg` | `8px 8px 0 var(--nv-shadow-color)` |
| `--nv-focus-ring` | `0 0 0 3px var(--nv-blue)` |

- **Foco global:** `outline: 3px solid var(--nv-blue); outline-offset: 3px`.
- **Hover de superficie:** `translate(-2px, -2px)` + una sombra mayor.
- **Press:** `translate(2px, 2px)` + sombra 0.

### 3.6 Movimiento

| Token | Valor |
| --- | --- |
| `--nv-duration-fast` | `120ms` |
| `--nv-duration-base` | `180ms` |
| `--nv-duration-slow` | `320ms` |
| `--nv-duration-reveal` | `380ms` (entrada de tarjetas) |
| `--nv-stagger` | `40ms` |
| `--nv-ease` | `cubic-bezier(.2,.8,.2,1)` |
| `--nv-transition` | `180ms cubic-bezier(.2,.8,.2,1)` |

- Entrada de tarjetas: `opacity 0→1` + `translateY(10px→0)`, 380 ms + 40 ms de stagger.
- Marquee del header: 28 s lineal; estático con `prefers-reduced-motion`.
- Todo movimiento se desactiva bajo `prefers-reduced-motion: reduce`.

### 3.7 Layout

- Header sticky total `96px` = marquee `32px` + barra `64px`.
- `scroll-padding-top`: header + 24 px.
- Breakpoints: `520`, `760`, `980`, `1100`, `1280`.
- Grid catálogo: `repeat(auto-fill, minmax(250px, 1fr))`, gap `24px`.
- Contenido de texto: máx. `68ch`.

---

## 4. Componentes

### Botones

| Variante | Fondo | Texto | Borde | Sombra |
| --- | --- | --- | --- | --- |
| Primary / CTA | `--nv-accent` | `--nv-on-accent` | 2px tinta | 2px offset |
| Outline | transparente | `--nv-text` | 2px tinta | 2px offset |
| Ink (acción neutra) | `--nv-primary` | `--nv-on-primary` | 2px tinta | 2px offset |
| Destructive | `--nv-danger` | `#FFFFFF` | 2px tinta | 2px offset |

Altura mínima 44 px (48 en móvil), radio 0, mono 12 px 700, tracking 0.1em,
uppercase. Hover `translate(-2px,-2px)` + sombra mayor. Press invierte el offset.
Disabled: opacidad 0.45 y sin desplazamiento.

### Inputs

Altura 44 px, borde 2px tinta, radio 0, fondo `--nv-surface`, texto `--nv-text`.
Placeholder `--nv-text-dim`. Focus: outline azul de 3px con offset 2px.
Error: borde `--nv-danger` + mensaje en `--nv-text-caption`.

### Header y navegación

- Marquee de 32 px en tinta con texto papel y mono 11 px: envío 24 h · compra
  protegida · 30 días de devolución. Se repite en loop; estático con reduced motion.
- Barra de 64 px con borde inferior 2px y fondo papel sólido (sin blur).
- Wordmark con marca en bloque ácido.
- Links en mono uppercase; activo con bloque ácido y borde 2px.
- Carrito cuadrado de 44 px con borde 2px, badge cuadrado ácido.
- Menú móvil en drawer de borde izquierdo 2px y sombra offset.

### Hero del catálogo

- Grilla 7/5: contenido a la izquierda, pieza visual a la derecha.
- Eyebrow mono `01 / CATÁLOGO`.
- H1 display con la última palabra resaltada en bloque ácido con borde.
- CTA ácido `VER CATÁLOGO` + CTA outline `ARMAR SETUP`.
- Pieza visual: marco 2px, fondo blanco fijo, sombra `8px 8px 0`, sticker
  "NUEVO DROP" rotado -2° y caption mono.
- Barra de stats: 4 bloques con separadores de 2px; uno en ácido.
- Banda de beneficios: 3 bloques con iconos outline y etiquetas mono.

### Toolbar del catálogo

Sticky bajo el header, borde 2px, fondo papel sólido y sombra `6px 6px 0`.
Buscador con borde 2px y botón de limpiar cuadrado. Chips de categoría
cuadrados; activo en tinta con texto papel. Select de orden con overlay
cuadrado de borde 2px y sombra dura (se monta en `<body>`).

### Tarjeta de producto

- Borde 2px, radio 0, sombra `4px 4px 0`; hover `translate(-2,-2)` + `6px 6px 0`.
- Media 4:3 sobre **blanco fijo en ambos temas**, con borde inferior 2px.
- Badge (Top ventas/Nuevo) en bloque ácido con borde; descuento en bloque rojo.
- Categoría en mono uppercase; nombre en Inter 700 a 2 líneas.
- Rating con estrellas + valor en mono.
- Precio en JetBrains Mono 700; precio anterior tachado.
- CTA "Añadir" de ancho completo, ácido, con borde 2px y sombra offset.
- Agotado: imagen al 50 % y grayscale; CTA deshabilitado.

### Carrito

Filas tipo tabla con borde 2px y sombra `2px`. Media cuadrada con borde.
Stepper cuadrado de 3 celdas con bordes internos. Total en mono.
Resumen sticky con borde 2px, sombra `8px 8px 0`, total display y CTA ácido.
Barra de envío gratis de 8 px con relleno ácido y borde 2px.

### Auth

- Panel izquierdo en tinta con grilla técnica tenue y texto papel.
- Wordmark grande + titular display; highlights en bloque ácido.
- Features con iconos en bloques ácido cuadrados.
- Panel derecho en papel; card con borde 2px y sombra `8px 8px 0`.
- Inputs cuadrados; labels mono uppercase; errores en bloque rojo con borde.

### Empty state y 404

- Empty state: contenedor 2px con sombra `6px 6px 0`, icono en bloque ácido
  cuadrado, título display uppercase, mensaje ≤ 400 px y CTA ácido.
- 404: "404" display gigante con sombra ácida offset, fondo con grilla técnica
  y CTA ácido.

### Toast / Dialog / Drawer

Superficie sólida (sin glass), borde 2px, radio 0, sombra `8px 8px 0`.
El drawer móvil usa borde izquierdo 2px y máscara `rgba(11,11,12,.55)` sin blur.

---

## 5. Skeleton loading

El skeleton debe **parecer el contenido final**, no una caja genérica.

### Reglas

1. **Cero layout shift:** mismo alto/ancho, padding, aspect-ratio y líneas que
   el contenido real.
2. **Solo para esperas perceptibles:** mostrar si la carga supera ~200 ms.
3. **Shimmer sutil:** `--nv-skeleton-base → --nv-skeleton-shine`, 1.4 s; bloques
   con radio 0.
4. **Accesibilidad:** contenedor `aria-busy="true"`; skeleton `aria-hidden="true"`;
   resultado anunciado con `aria-live="polite"`.
5. **Reduced motion:** shimmer estático.
6. **Imágenes:** placeholder detrás de la imagen hasta `load`; fade de 180 ms.
7. **Botones:** nunca skeleton; usan `[loading]` de PrimeNG.

### Piezas

- `app-skeleton`: primitiva (`width`, `height`, `radius`, `circle`, `text`).
- `app-product-card-skeleton`: réplica exacta de la tarjeta (media 4:3, categoría,
  título, 2 líneas, rating, footer con precio y CTA full width).
- Catálogo: grid de 6 skeletons mientras `isLoading()`.

### Tokens de skeleton

```scss
--nv-skeleton-base: #e4dfd3;
--nv-skeleton-shine: #f2eee3;
--nv-skeleton-radius: 0;
```

Dark: `#232327` / `#303036`.

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
| Tarjeta real | `src/app/shared/components/product-card/` |
| Vacío / logo | `src/app/shared/components/empty-state/`, `brand-logo/` |
| Catálogo | `src/app/features/store/pages/` |
| Header / Footer | `src/app/layout/` |
| Carrito | `src/app/features/cart/pages/cart-page/` |
| Auth | `src/app/features/auth/` |
| 404 | `src/app/features/not-found/` |

---

## 7. Checklist de entrega

- [ ] Contraste ≥ 4.5:1 en texto normal (claro y oscuro).
- [ ] Foco visible azul de 3px en todos los interactivos.
- [ ] Touch targets ≥ 44×44 px.
- [ ] Sin layout shift al pasar de skeleton a contenido.
- [ ] `prefers-reduced-motion` respetado (marquee, stagger, hover).
- [ ] Radios 0 y bordes 2px consistentes.
- [ ] Un solo acento de acción por vista (ácido).
- [ ] Iconos solo de PrimeIcons, con `aria-hidden` cuando son decorativos.
- [ ] Estados vacíos, loading y error definidos para cada vista.
- [ ] Modo oscuro automático sin flash y sin violaciones de CSP.
