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
