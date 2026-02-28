import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface CartItem {
  id: number;
  image: string;
  name: string;
  price: number;
  oldPrice?: number;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class Cart {
  cartItems: CartItem[] = [
    {
      id: 1,
      image: 'assets/img/product-3.png',
      name: 'Apple iPad Mini G2356',
      price: 1050.0,
      oldPrice: 1250.0,
      quantity: 1,
    },
    {
      id: 2,
      image: 'assets/img/product-4.png',
      name: 'Samsung Galaxy S24 Ultra',
      price: 1299.99,
      quantity: 2,
    },
    {
      id: 3,
      image: 'assets/img/product-5.png',
      name: 'Sony WH-1000XM5 Headphones',
      price: 399.99,
      oldPrice: 499.99,
      quantity: 1,
    },
  ];

  increaseQuantity(item: CartItem): void {
    item.quantity++;
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    }
  }

  removeItem(item: CartItem): void {
    const index = this.cartItems.indexOf(item);
    if (index > -1) {
      this.cartItems.splice(index, 1);
    }
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get shipping(): number {
    return this.subtotal > 50 ? 0 : 10;
  }

  get total(): number {
    return this.subtotal + this.shipping;
  }
}
