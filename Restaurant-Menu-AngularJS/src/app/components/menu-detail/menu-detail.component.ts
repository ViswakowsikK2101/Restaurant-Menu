import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MenuService } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';
import { switchMap } from 'rxjs/operators';
import { MenuItem } from '../../models/menu-item.model';

@Component({
  selector: 'app-menu-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    @if (item$ | async; as item) {
      <div class="container mx-auto p-4 max-w-4xl">
        <button mat-button routerLink="/menu" class="mb-4">
          <mat-icon>arrow_back</mat-icon> Back to Menu
        </button>
        
        <div class="grid md:grid-cols-2 gap-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="h-64 md:h-auto relative">
            <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover absolute inset-0">
          </div>
          
          <div class="p-8 flex flex-col justify-center">
            <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{{ item.category }}</div>
            <h1 class="mt-2 text-3xl font-bold text-gray-900">{{ item.name }}</h1>
            <p class="mt-4 text-gray-600 text-lg leading-relaxed">{{ item.description }}</p>
            
            <div class="mt-8 flex items-center justify-between">
              <span class="text-3xl font-bold text-gray-900">{{ item.price | currency:'INR':'symbol':'1.0-0' }}</span>
              <button mat-raised-button color="primary" class="px-8 py-2" (click)="addToCart(item)">
                <mat-icon class="mr-2">add_shopping_cart</mat-icon> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class MenuDetailComponent {
  private route = inject(ActivatedRoute);
  private menuService = inject(MenuService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  item$ = this.route.paramMap.pipe(
    switchMap(params => {
      const id = Number(params.get('id'));
      return this.menuService.getMenuItem(id);
    })
  );

  addToCart(item: MenuItem) {
    this.cartService.addToCart(item);
    const snackRef = this.snackBar.open(`${item.name} added to cart`, 'View Cart', {
      duration: 2200,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['view-cart-snackbar'],
    });

    snackRef.onAction().subscribe(() => {
      this.router.navigate(['/cart']);
    });
  }
}
