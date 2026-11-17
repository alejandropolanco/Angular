import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Product } from '../models/modelo';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly products: Product[] = [
    {
      id: '1',
      name: 'Laptop Gamer',
      category: 'Tecnología',
      image: 'laptop.jpg',
      price: 2500,
      oldPrice: 2899,
      description: 'RTX 4070, 32 GB de RAM y pantalla de 165 Hz para jugar sin límites.',
      details:
        'Chasis de aluminio con refrigeración por vapor y perfil de 19 mm. Pensada para sesiones largas: el sistema de doble ventilador mantiene los relojes altos sin convertirse en un avión. Incluye Windows 11 Pro y 1 TB NVMe Gen4 ampliable.',
      highlights: [
        'NVIDIA RTX 4070 · 8 GB GDDR6',
        'Intel Core i7 · 32 GB DDR5',
        'SSD NVMe 1 TB Gen4 ampliable',
        'Pantalla 16" QHD+ 165 Hz · 100% sRGB',
      ],
      inventoryStatus: 'INSTOCK',
      rating: 5,
      badge: 'Top ventas',
    },
    {
      id: '2',
      name: 'Audífonos',
      category: 'Audio',
      image: 'audifonos.jpg',
      price: 300,
      oldPrice: 349,
      description: 'Sonido envolvente, cancelación activa y hasta 40 horas de batería.',
      details:
        'Drivers de 40 mm con diafragma de titanio y cancelación activa adaptativa de tres micrófonos. El modo transparencia deja pasar la conversación con un toque. Almohadillas de espuma viscoelástica para sesiones maratónicas.',
      highlights: [
        'Cancelación activa adaptativa',
        '40 h de autonomía · 10 min = 5 h',
        'Bluetooth 5.3 multipunto',
        'Modo transparencia y audio espacial',
      ],
      inventoryStatus: 'LOWSTOCK',
      rating: 4,
      badge: 'Oferta',
    },
    {
      id: '3',
      name: 'Mouse Gamer',
      category: 'Accesorios',
      image: 'mouse.jpg',
      price: 120,
      description: 'Sensor de 26K DPI, 8 botones programables y RGB personalizable.',
      details:
        'Forma simétrica pensada para agarre de garra y palma. Switches ópticos de 100 millones de clics, patines de PTFE virgen y cable paracord de 1.8 m. Configura macros y perfiles directamente en memoria interna.',
      highlights: [
        'Sensor óptico 26.000 DPI',
        'Switches ópticos · 100M clics',
        '8 botones programables + memoria',
        'Cable paracord 1.8 m · 63 g',
      ],
      inventoryStatus: 'INSTOCK',
      rating: 4,
    },
    {
      id: '4',
      name: 'Teclado Mecánico',
      category: 'Accesorios',
      image: 'teclado.png',
      price: 280,
      description: 'Switches hot-swap, chasis de aluminio y retroiluminación por tecla.',
      details:
        'Estructura de aluminio con montaje en placa y espuma amortiguadora para un sonido limpio y sin reverberancia. Hot-swap 5 pines para cambiar switches sin soldar. Triple conexión: USB-C, Bluetooth y 2.4 GHz.',
      highlights: [
        'Switches hot-swap 5 pines',
        'Chasis de aluminio · espuma amortiguadora',
        'RGB por tecla · 16.8 M colores',
        'Triple modo: USB-C / BT / 2.4 GHz',
      ],
      inventoryStatus: 'LOWSTOCK',
      rating: 5,
    },
    {
      id: '5',
      name: 'Monitor 27"',
      category: 'Tecnología',
      image: 'monitor.jpg',
      price: 1500,
      oldPrice: 1699,
      description: 'QHD a 165 Hz, 1 ms de respuesta y HDR400 para trabajo y gaming.',
      details:
        'Panel IPS de 27" con 1440p, 165 Hz y sincronización adaptativa FreeSync Premium. Base con ajuste de altura, pivote e inclinación, más montaje VESA. Ideal para un setup mixto de trabajo y juego.',
      highlights: [
        '27" QHD (2560×1440) · 165 Hz',
        'IPS 1 ms GtG · HDR400',
        'FreeSync Premium',
        'Base ergonómica + VESA 100×100',
      ],
      inventoryStatus: 'INSTOCK',
      rating: 5,
      badge: 'Nuevo',
    },
    {
      id: '6',
      name: 'Silla Gamer',
      category: 'Muebles',
      image: 'silla.png',
      price: 980,
      description: 'Ergonomía premium, reclinable 160° y soporte lumbar ajustable.',
      details:
        'Espuma de alta densidad que no se deforma con el uso y tapizado transpirable. Reposabrazos 4D, soporte lumbar y de cuello regulables, y base de aluminio con ruedas silenciosas. Soporta hasta 150 kg.',
      highlights: [
        'Reclinable hasta 160°',
        'Soporte lumbar y cervical ajustables',
        'Reposabrazos 4D',
        'Base de aluminio · hasta 150 kg',
      ],
      inventoryStatus: 'OUTOFSTOCK',
      rating: 4,
    },
    {
      id: '7',
      name: 'Smartwatch Pro',
      category: 'Wearables',
      image: 'reloj.jpg',
      price: 650,
      description: 'GPS, ECG, pantalla AMOLED y hasta 14 días de autonomía.',
      details:
        'Caja de titanio de 46 mm con cristal de zafiro y pantalla AMOLED always-on. Mide ECG, oxígeno en sangre, sueño y más de 100 deportes con GPS de doble banda. Sumergible 10 ATM.',
      highlights: [
        'Pantalla AMOLED 1.43" always-on',
        'GPS doble banda · 100+ deportes',
        'ECG, SpO₂ y monitor de sueño',
        'Hasta 14 días de autonomía · 10 ATM',
      ],
      inventoryStatus: 'LOWSTOCK',
      rating: 4,
    },
    {
      id: '8',
      name: 'Tablet Android',
      category: 'Tecnología',
      image: 'tablet.jpg',
      price: 1300,
      description: 'Pantalla 2.8K, 256 GB de almacenamiento y lápiz incluido.',
      details:
        'Pantalla de 11" a 2.8K con 144 Hz y altavoces cuádruples. Incluye lápiz con 4096 niveles de presión y batería de 10.000 mAh con carga rápida de 67 W. Perfecta para crear, ver y jugar.',
      highlights: [
        'Pantalla 11" 2.8K · 144 Hz',
        '256 GB ampliables por microSD',
        'Lápiz con 4096 niveles de presión',
        'Batería 10.000 mAh · carga 67 W',
      ],
      inventoryStatus: 'INSTOCK',
      rating: 5,
    },
    {
      id: '9',
      name: 'Cámara Web HD',
      category: 'Streaming',
      image: 'camara.jpg',
      price: 220,
      oldPrice: 249,
      description: '1080p a 60 fps, enfoque automático y micrófonos duales.',
      details:
        'Sensor de 1/2.9" que rinde bien incluso con poca luz. Enfoque automático rápido, corrección de luz de fondo y tapa de privacidad integrada. Micrófonos duales con reducción de ruido para llamadas nítidas.',
      highlights: [
        '1080p a 60 fps',
        'Enfoque automático + HDR',
        'Micrófonos duales con reducción de ruido',
        'Tapa de privacidad integrada',
      ],
      inventoryStatus: 'INSTOCK',
      rating: 4,
    },
  ];

  getProducts(): Product[] {
    return this.products;
  }

  /**
   * Simula la latencia del catálogo remoto para que el skeleton loading
   * tenga un ciclo real de carga. Al conectar la API se reemplaza `of(...)`
   * por `http.get('/api/products')` sin tocar la página.
   */
  getProductsAsync(): Observable<Product[]> {
    const latency = isPlatformBrowser(this.platformId) ? 450 : 0;
    return of(this.products).pipe(delay(latency));
  }
}
