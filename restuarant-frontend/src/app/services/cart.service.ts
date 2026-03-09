import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem } from '../models/menu-item.model';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  addToCart(item: MenuItem) {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(i => i.id === item.id);

    if (existingItem) {
      existingItem.quantity += 1;
      this.cartItems.next([...currentItems]);
    } else {
      this.cartItems.next([...currentItems, { ...item, quantity: 1 }]);
    }
  }

  removeFromCart(itemId: number) {
    const currentItems = this.cartItems.value;
    this.cartItems.next(currentItems.filter(i => i.id !== itemId));
  }

  updateQuantity(itemId: number, quantity: number) {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(i => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        this.cartItems.next([...currentItems]);
      }
    }
  }

  clearCart() {
    this.cartItems.next([]);
  }

  getTotal(): number {
    return this.cartItems.value.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  getSnapshot(): CartItem[] {
    return this.cartItems.value;
  }
}
