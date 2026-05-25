import { Injectable } from '@angular/core';
import { Product } from '../models/modelo';

@Injectable({
  providedIn: 'root'
})

export class ProductService {

  getProducts(): Product[] {

    return [

      {
        id: '1',
        name: 'Laptop Gamer',
        category: 'Tecnología',
        image: 'laptop.jpg',
        price: 2500,
        inventoryStatus: 'INSTOCK',
        rating: 5
      },

      {
        id: '2',
        name: 'Audifonos',
        category: 'Audio',
        image: 'audifonos.jpg',
        price: 300,
        inventoryStatus: 'LOWSTOCK',
        rating: 4
      },
      {
  id: '3',
  name: 'Mouse Gamer',
  category: 'Accesorios',
  image: 'mouse.jpg',
  price: 120,
  inventoryStatus: 'INSTOCK',
  rating: 4
},

{
  id: '4',
  name: 'Teclado Mecánico',
  category: 'Accesorios',
  image: 'teclado.png',
  price: 280,
  inventoryStatus: 'LOWSTOCK',
  rating: 5
},

{
  id: '5',
  name: 'Monitor 27 Pulgadas',
  category: 'Tecnología',
  image: 'monitor.jpg',
  price: 1500,
  inventoryStatus: 'INSTOCK',
  rating: 5
},

{
  id: '6',
  name: 'Silla Gamer',
  category: 'Muebles',
  image: 'silla.png',
  price: 980,
  inventoryStatus: 'OUTOFSTOCK',
  rating: 4
},

{
  id: '7',
  name: 'Smartwatch Pro',
  category: 'Wearables',
  image: 'reloj.jpg',
  price: 650,
  inventoryStatus: 'LOWSTOCK',
  rating: 4
},

{
  id: '8',
  name: 'Tablet Android',
  category: 'Tecnología',
  image: 'tablet.jpg',
  price: 1300,
  inventoryStatus: 'INSTOCK',
  rating: 5
},

{
  id: '9',
  name: 'Cámara Web HD',
  category: 'Streaming',
  image: 'camara.jpg',
  price: 220,
  inventoryStatus: 'INSTOCK',
  rating: 4
}

    ];

  }

}