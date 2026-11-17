# NovaStore — Portada pública y sistema de animaciones

> Home editorial pública, animaciones por scroll y cuatro correcciones de experiencia.
> Stack: Angular 21 · PrimeNG 21 · SCSS · SSR.
> Última actualización: 2026-11-17.

Este documento describe el bloque de trabajo que convierte la portada en una
**landing editorial pública**, introduce un **sistema de animaciones por scroll**
reutilizable en toda la app y cierra **cuatro correcciones** de experiencia
detectadas en el catálogo y la navegación. Continúa la dirección visual definida
en [`design-system/novastore/MASTER.md`](../design-system/novastore/MASTER.md):
**Clean Tech Monocromo**, papel cálido y tinta.

---

## 1. Resumen

| Área | Antes | Ahora |
| --- | --- | --- |
| Portada `/` | Redirección según estado de autenticación (`rootRedirectGuard`) | Landing editorial pública, sin guard |
| Movimiento | Micro-interacciones sueltas | Directiva `[appReveal]` + sistema `_animations.scss` |
| Header | Estático | Auth-aware y con estado `is-scrolled` |
| Detalle de producto | Sin detalle | Diálogo ampliado con entrada animada |
| Drawer móvil | Oscurecía la pantalla | Montado en `<body>`, scrim correcto |
| Botón "Descubrir la colección" | Reiniciaba la navegación | Desplazamiento suave a `#coleccion` |
| Filtro "Ordenar por" | Texto recortado; panel tras las tarjetas en móvil | Label completo; panel por encima y clicable |

**Sin dependencias nuevas.** Todo se apoya en tokens `--nv-*` ya existentes y en
`IntersectionObserver` nativo.

---

## 2. Portada pública (`/`)

La raíz dejó de ser una redirección para convertirse en la **carta de
presentación** de la tienda: una página editorial tipo revista que cualquier
visitante —autenticado o no— puede ver.

### Secciones

| Sección | Contenido | Comportamiento |
| --- | --- | --- |
| **Hero** | Titular display (Bodoni Moda), imagen full-bleed en blanco y negro con overlay de tinta | Full-bleed, sin superposición con el header |
| **Manifiesto** | Tres valores de marca | Entra escalonado con `[appReveal]` |
| **Colección** (`#coleccion`) | Vista previa de hasta 6 productos destacados | Tarjetas reales; los invitados ven **"Inicia sesión"** |
| **Bloque editorial** | *Pull quote* con imagen secundaria | Aparición lateral |
| **Banda CTA** | Llamada a la acción en tinta plena | Enlaces a tienda / registro |

### Header auth-aware

El header se adapta al estado de sesión y se "eleva" al hacer scroll:

- **Invitado:** `Iniciar sesión` + `Crear cuenta`.
- **Autenticado:** chip con inicial y nombre del usuario + botón de cerrar sesión.
- **`is-scrolled`:** a partir de `scrollY > 8` añade `site-header--scrolled`
  (borde y sombra), calculado una sola vez en `afterNextRender` con un listener
  `passive` que se limpia en `DestroyRef`.

### Archivos

```text
src/app/features/home/
├── home.routes.ts                        # ruta '' → HomePage (título de portada)
└── pages/home-page/
    ├── home-page.ts                      # carga de productos + acciones
    ├── home-page.html                    # estructura editorial
    └── home-page.scss                    # estilos de portada
```

---

## 3. Rutas y renderizado

`src/app/app.routes.ts` quedó reestructurado: el auth vive **a nivel raíz** (a
pantalla completa, sin layout de tienda) y la portada, la tienda y el carrito
cuelgan de un `MainLayout` común.

```text
/                 → MainLayout → HomePage         (pública)
/login            → LoginPage                     (solo invitados)
/register         → RegisterPage                  (solo invitados)
/store            → MainLayout → PagesStore       (authGuard)
/cart             → MainLayout → CartPage         (authGuard)
/**               → NotFoundPage                  (pública)
```

| Ruta | Modo SSR (`app.routes.server.ts`) | Motivo |
| --- | --- | --- |
| `/` | `Prerender` | Portada estable y cacheable, ideal para SEO |
| `/login`, `/register` | `Prerender` | Formularios sin datos de sesión |
| `/store`, `/cart` | `Client` | Dependen de la sesión; se evitan redirecciones en el prerender |
| `/**` | `Server` | Página 404 con fallback dinámico |

> **Nota de refactor:** se eliminó `core/guards/root-redirect-guard.ts` (y su
> spec). Con la portada pública ya no hay nada que redirigir en `/`. El
> `authGuard` sigue protegiendo `/store` y `/cart`.

---

## 4. Sistema de animaciones

El movimiento es **progresivo y con propósito**: nada se oculta en el servidor,
nada se anima si el usuario pidió reducir movimiento y solo se animan `opacity`
y `transform` (compositor-friendly).

### 4.1 Directiva `[appReveal]`

`src/app/shared/directives/scroll-reveal/scroll-reveal.ts`

```html
<section appReveal>…</section>
<section [appReveal]="'left'" [appRevealDelay]="120">…</section>
```

| Entrada | Valores | Por defecto |
| --- | --- | --- |
| `appReveal` | `'up' \| 'down' \| 'left' \| 'right' \| 'scale' \| 'fade' \| ''` | `'up'` |
| `appRevealDelay` | milisegundos | `0` |

**Garantías de implementación**

1. **SSR-safe.** El trabajo ocurre en `afterNextRender`; en el servidor el HTML
   sale visible. No hay *flash* ni *layout shift*.
2. **Sin parpadeo de hidratación.** Si el elemento ya está en el viewport
   (`rect.top < alto * 0.92`), se marca `nv-revealed` en el mismo frame: nunca
   llega a pintarse oculto.
3. **Movimiento reducido.** Con `prefers-reduced-motion: reduce` la directiva no
   hace nada y el CSS no oculta nada.
4. **Sin `IntersectionObserver`.** Si el navegador no lo soporta, todo queda
   visible (degradación elegante).
5. **Limpieza.** El observer se desconecta al revelar y en `DestroyRef.onDestroy`.

### 4.2 Hoja de estilos

`src/styles/_animations.scss` define las variantes y las *micro-interacciones*:

| Clase | Efecto |
| --- | --- |
| `.nv-reveal` | Estado oculto base (`opacity: 0`, transición `--nv-duration-reveal`) |
| `.nv-reveal--up` / `--down` | `translate3d` vertical (±30 px) |
| `.nv-reveal--left` / `--right` | `translate3d` horizontal (±38 px) |
| `.nv-reveal--scale` | `scale(0.94)` |
| `.nv-reveal--fade` | Solo opacidad |
| `.nv-reveal.nv-revealed` | Estado final (`opacity: 1`, `transform: none`) |

Todo el bloque vive bajo `@media (prefers-reduced-motion: no-preference)`, así
que en SSR y con movimiento reducido el contenido es visible por defecto.

### 4.3 Dónde se aplica

- **Portada:** hero, manifiesto, colección, bloque editorial y banda CTA.
- **Catálogo:** cabecera del catálogo y tarjetas de producto.
- **Detalle de producto:** entrada escalonada del contenido (ver §6.3).

---

## 5. Componentes auth-aware

Tres piezas comparten la misma idea: **el visitante ve una invitación a iniciar
sesión, no una acción que no puede completar**.

| Componente | Entrada | Comportamiento |
| --- | --- | --- |
| `app-product-card` | `purchasable` | `false` → el CTA muestra **"Inicia sesión"** (enlace a `/login`) en lugar de "Añadir" |
| `app-product-card` | salida `open` | Emite el producto al pedir su detalle ampliado |
| `app-product-detail-dialog` | `purchasable` | `false` → ofrece iniciar sesión en el pie del diálogo |

Las etiquetas y severidades de stock se centralizan en
`src/app/shared/utils/product-status.ts` (`getStockSeverity`, `getStockLabel`,
`hasDiscount`, `getDiscountPercent`, `isOutOfStock`) para que tarjeta y diálogo
compartan exactamente la misma lógica.

---

## 6. Correcciones

### 6.1 Drawer móvil oscurecía la pantalla

**Síntoma.** Al abrir el menú móvil, la pantalla quedaba oscurecida y el panel se
encogía al alto del header.

**Causa.** El panel del `p-drawer` usa `position: fixed`, pero el
`backdrop-filter` del header crea un *containing block*: el `fixed` se resolvía
respecto del header (no del viewport) y quedaba por debajo del scrim.

**Solución.** `appendTo="body"` en el `<p-drawer>`, de modo que el panel escape
del contexto de apilamiento del header. Mismo patrón aplicado al diálogo de
detalle y al `p-select` del catálogo.

### 6.2 "Descubrir la colección" solo reseteaba

**Síntoma.** El botón del hero reiniciaba la navegación en lugar de llevar a la
colección.

**Solución.** `scrollToCollection()` en `HomePage` desplaza con
`scrollIntoView({ block: 'start' })` hacia `#coleccion`. Respeta movimiento
reducido (`behavior: 'auto'` en ese caso) y solo corre en el navegador
(`isPlatformBrowser`). La URL no cambia.

### 6.3 Clic en producto → detalle animado

**Síntoma.** No había forma de leer la descripción detallada desde la tarjeta.

**Solución.** Nuevo `ProductDetailDialog` (`p-dialog` montado en `<body>`) con:

- Imagen, nombre, descripción, *highlights*, precio, descuento, rating y stock.
- CTA "Añadir al carrito" (o "Inicia sesión" para invitados).
- **Entrada animada:** la media hace `scale(1.05) → 1` y el cuerpo entra con
  *stagger* de 50 ms por hijo (`nv-detail-media`, `nv-detail-item` en
  `_animations.scss`). Desactivado con `prefers-reduced-motion`.

La tarjeta dispara la salida `open`; la página guarda `selectedProduct` y abre el
diálogo. Funciona igual en la portada y en el catálogo.

### 6.4 Filtro "Ordenar por": letras recortadas y panel tras las tarjetas

Este fix resolvió **tres defectos reales**, todos **preexistentes** (ya estaban
en `HEAD`; el rediseño los hizo visibles).

| # | Defecto | Causa raíz | Solución |
| --- | --- | --- | --- |
| 1 | El texto del select se veía como "…" | `p-select.sort-select { display: block }` pisaba el `display: inline-flex` que PrimeNG necesita; el `.p-select-label` (`flex: 1 1 auto`) se colapsaba | `display: inline-flex` en el host |
| 2 | En móvil el panel se abría **por detrás** de las tarjetas y no se podía pulsar | La toolbar pierde `z-index: 20` en móvil (`position: static`) pero conserva `backdrop-filter`, que crea un contexto de apilamiento por debajo de las tarjetas | `appendTo="body"` en el `<p-select>` |
| 3 | La última opción quedaba cortada | La lista medía 212 px dentro de un contenedor de 200 px | `scrollHeight="280px"` |

**Medido en el navegador (antes → después)**

| Métrica | Antes | Después |
| --- | --- | --- |
| Ancho del label (escritorio 1280) | `24 px` (texto: 114 px) | `198 px`, texto completo |
| Ancho del label (móvil 375) | `24 px` | `267 px`, texto completo |
| Alto del select | `54 px` (layout roto) | `38 px` |
| Contenedor de la lista | `200 px` (recortaba) | `280 px`, sin recorte |
| Elemento bajo el clic (móvil) | `.product-card__open` (tarjeta) | `.p-select-option` (opción) |

**Archivos tocados**

- `src/app/features/store/pages/pages-store.scss` — `display: inline-flex`.
- `src/app/features/store/pages/pages-store.html` — `appendTo="body"` +
  `scrollHeight="280px"`.

> El color del label (`stone-700`) se mantuvo a propósito: es legible y
> consistente con el texto del buscador. El problema era el **recorte**, no el
> contraste.

---

## 7. Verificación

| Comprobación | Herramienta | Resultado |
| --- | --- | --- |
| Portada pública, animaciones y los 3 fixes | auditoría CDP `audit3.mjs` | **43/43 OK** |
| Label del select sin recorte (escritorio/móvil, claro/oscuro) | CDP (estilos computados + geometría) | OK |
| Panel del select por encima y clicable (móvil) | `elementsFromPoint` | OK |
| Seleccionar cada opción actualiza el texto | CDP | OK |
| Pruebas unitarias | `npx ng test --watch=false` | **105/105** (21 archivos) |
| Build de producción con SSR | `npm run build` | OK, 3 rutas prerenderizadas |

> El modelo no "ve" imágenes: la verificación visual se hizo con estilos
> computados, geometría y *hit-testing* vía CDP sobre Edge headless, no a ojo.

---

## 8. Mapa de archivos

| Pieza | Archivo |
| --- | --- |
| Portada | `src/app/features/home/pages/home-page/` |
| Ruta de portada | `src/app/features/home/home.routes.ts` |
| Rutas raíz | `src/app/app.routes.ts` |
| Modos SSR | `src/app/app.routes.server.ts` |
| Directiva de scroll | `src/app/shared/directives/scroll-reveal/scroll-reveal.ts` |
| Sistema de animaciones | `src/styles/_animations.scss` |
| Detalle de producto | `src/app/shared/components/product-detail-dialog/` |
| Estado de producto | `src/app/shared/utils/product-status.ts` |
| Tarjeta de producto | `src/app/shared/components/product-card/` |
| Header auth-aware | `src/app/layout/header/` |
| Catálogo y filtros | `src/app/features/store/pages/` |
| Overrides PrimeNG | `src/styles/_prime-overrides.scss` |

---

## 9. Notas de mantenimiento

- **Overlays bajo `backdrop-filter`.** Cualquier overlay de PrimeNG que deba
  flotar por encima de un contenedor con `backdrop-filter` (header, toolbar) debe
  montarse con `appendTo="body"`. Ya se aplica al drawer, al diálogo de detalle y
  al select de ordenamiento.
- **`p-select` en el catálogo.** No cambiar `display: inline-flex` del host: el
  label depende de `flex: 1 1 auto`. Si se toca, verificar el ancho del
  `.p-select-label` contra su `scrollWidth`.
- **Movimiento.** Toda animación nueva va dentro de
  `@media (prefers-reduced-motion: no-preference)` y anima solo `opacity` /
  `transform`.
- **Reveals.** Usar `[appReveal]` en lugar de observers ad hoc; la directiva ya
  resuelve SSR, hidratación y accesibilidad.
