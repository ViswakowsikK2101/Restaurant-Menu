import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-4 max-w-4xl">
      <h1 class="text-3xl font-bold mb-6">Your Cart</h1>
      
      @if ((cartItems$ | async)?.length === 0) {
        <div class="text-center py-12 bg-gray-50 rounded-lg">
          <mat-icon class="text-6xl text-gray-400 mb-4">shopping_cart_off</mat-icon>
          <p class="text-xl text-gray-500">Your cart is empty.</p>
          <button mat-raised-button color="primary" routerLink="/menu" class="mt-6">Browse Menu</button>
        </div>
      }

      @if ((cartItems$ | async)?.length; as count) {
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <table mat-table [dataSource]="cartItems$" class="w-full">
          
          <!-- Item Column -->
          <ng-container matColumnDef="item">
            <th mat-header-cell *matHeaderCellDef> Item </th>
            <td mat-cell *matCellDef="let element" class="flex items-center gap-4 py-4">
              <img [src]="element.image" [alt]="element.name" class="w-16 h-16 object-cover rounded">
              <div>
                <div class="font-bold">{{element.name}}</div>
                <div class="text-sm text-gray-500">{{element.category}}</div>
              </div>
            </td>
          </ng-container>

          <!-- Price Column -->
          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef> Price </th>
            <td mat-cell *matCellDef="let element"> {{element.price | currency:'INR':'symbol':'1.0-0'}} </td>
          </ng-container>

          <!-- Quantity Column -->
          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef> Quantity </th>
            <td mat-cell *matCellDef="let element">
              <div class="flex items-center gap-2">
                <button mat-icon-button color="warn" (click)="updateQuantity(element, element.quantity - 1)">
                  <mat-icon>remove</mat-icon>
                </button>
                <span class="font-bold w-8 text-center">{{element.quantity}}</span>
                <button mat-icon-button color="primary" (click)="updateQuantity(element, element.quantity + 1)">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <!-- Total Column -->
          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef> Total </th>
            <td mat-cell *matCellDef="let element" class="font-bold"> 
              {{element.price * element.quantity | currency:'INR':'symbol':'1.0-0'}} 
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> </th>
            <td mat-cell *matCellDef="let element" class="text-right">
              <button mat-icon-button color="warn" (click)="removeItem(element)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class="p-6 bg-gray-50 flex justify-between items-center border-t border-gray-200">
          <div class="text-2xl font-bold">
            Total: {{ total$ | async | currency:'INR':'symbol':'1.0-0' }}
          </div>
          <div class="flex gap-4">
            <button mat-stroked-button color="warn" (click)="clearCart()">Clear Cart</button>
            <button mat-raised-button color="primary" routerLink="/checkout" [disabled]="count === 0">
              Proceed to Checkout
            </button>
          </div>
        </div>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  private cartService = inject(CartService);

  cartItems$ = this.cartService.cartItems$;
  displayedColumns: string[] = ['item', 'price', 'quantity', 'total', 'actions'];

  total$ = this.cartItems$.pipe(
    map(items => items.reduce((acc, item) => acc + (item.price * item.quantity), 0))
  );

  updateQuantity(item: CartItem, quantity: number) {
    this.cartService.updateQuantity(item.id, quantity);
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.id);
  }

  clearCart() {
    this.cartService.clearCart();
  }
}
