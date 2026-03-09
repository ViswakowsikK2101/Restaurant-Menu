import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MenuService } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';
import { CategoryFilterPipe } from '../../pipes/category-filter.pipe';
import { PriceRangePipe } from '../../pipes/price-range.pipe';
import { HighlightDirective } from '../../directives/highlight.directive';
import { MenuItem } from '../../models/menu-item.model';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    CategoryFilterPipe,
    PriceRangePipe,
    HighlightDirective
  ],
  template: `
    <section class="menu-hero px-4 py-10 md:py-14">
      <div class="max-w-6xl mx-auto">
        <p class="text-sm uppercase tracking-[0.2em] text-slate-500 mb-2">Fresh Picks</p>
        <h1 class="text-4xl md:text-5xl font-black text-slate-900 mb-3">Discover your next favorite dish</h1>
        <p class="text-slate-600 max-w-2xl">Browse handcrafted items, filter by category and price, and add to cart in a click.</p>
        @if (profile$ | async; as profile) {
          <div class="mt-4 inline-flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-700">
            <span>Logged in as <strong>{{ profile.name }}</strong></span>
            <button mat-stroked-button color="warn" type="button" (click)="confirmLogout()">Logout</button>
          </div>
        }
      </div>
    </section>

    <div class="container mx-auto p-4 pb-12">
      <div class="glass-card mb-6 p-4 md:p-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <p class="text-sm font-semibold text-slate-700 mb-2">Search</p>
            <input
              [(ngModel)]="searchText"
              type="text"
              placeholder="Search by dish name"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-700 mb-2">Sort By</p>
            <select
              [(ngModel)]="sortOption"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200">
              <option value="popular">Popular</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="new">Newest</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>

        <p class="text-sm font-semibold text-slate-700 mb-2">Category</p>
        <div class="overflow-x-auto whitespace-nowrap py-2 mb-4">
          <mat-chip-listbox aria-label="Category selection" [value]="selectedCategory" (change)="selectedCategory = $event.value">
            @for (cat of categories; track cat) {
              <mat-chip-option [value]="cat" [selected]="cat === selectedCategory">
                {{ cat }}
              </mat-chip-option>
            }
          </mat-chip-listbox>
        </div>

        <p class="text-sm font-semibold text-slate-700 mb-2">Price</p>
        <div class="overflow-x-auto whitespace-nowrap py-1">
          <mat-chip-listbox aria-label="Price range selection" [value]="selectedPriceRange" (change)="selectedPriceRange = $event.value">
            @for (range of priceRanges; track range) {
              <mat-chip-option [value]="range" [selected]="range === selectedPriceRange">
                {{ range }}
              </mat-chip-option>
            }
          </mat-chip-listbox>
        </div>
      </div>

      @if (menuItems$ | async; as items) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (item of getVisibleItems(items | categoryFilter:selectedCategory | priceRange:selectedPriceRange); track item.id) {
            <mat-card class="h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100"
                      [appHighlight]="item.category === 'Specials'">
              <div class="relative h-48 overflow-hidden" [routerLink]="['/menu', item.id]">
                <img mat-card-image [src]="item.image" [alt]="item.name" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
                <div class="absolute top-2 left-2 flex flex-wrap gap-2 z-10">
                  @if (item.isNew) {
                    <span class="text-xs font-bold bg-emerald-500 text-white px-2 py-1 rounded">NEW</span>
                  }
                  @if (item.isPopular) {
                    <span class="text-xs font-bold bg-orange-500 text-white px-2 py-1 rounded">POPULAR</span>
                  }
                  @if (item.isChefPick) {
                    <span class="text-xs font-bold bg-sky-600 text-white px-2 py-1 rounded">CHEF PICK</span>
                  }
                  @if (item.isSpicy) {
                    <span class="text-xs font-bold bg-rose-600 text-white px-2 py-1 rounded">SPICY</span>
                  }
                </div>
              </div>
              <mat-card-header class="mt-2">
                <mat-card-title>{{ item.name }}</mat-card-title>
                <mat-card-subtitle>{{ item.category }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content class="flex-grow mt-2">
                <p class="text-gray-600 line-clamp-3">{{ item.description }}</p>
                <div class="mt-4 flex items-center justify-between">
                  <p class="text-xl font-bold text-primary">{{ item.price | currency:'INR':'symbol':'1.0-0' }}</p>
                  <p class="text-sm font-semibold text-slate-600">⭐ {{ item.rating || 4.2 }}</p>
                </div>
              </mat-card-content>
              <mat-card-actions class="flex justify-between p-4">
                <button mat-button color="primary" [routerLink]="['/menu', item.id]">DETAILS</button>
                <button mat-raised-button color="accent" (click)="addToCart(item, $event)">
                  <mat-icon>add_shopping_cart</mat-icon> ADD
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      } @else {
        <div class="glass-card p-6 text-center text-slate-600">Loading menu...</div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MenuListComponent {
  private menuService = inject(MenuService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private userProfileService = inject(UserProfileService);

  menuItems$ = this.menuService.getMenuItems();
  profile$ = this.userProfileService.profile$;
  categories = ['All', 'Starters', 'Main Course', 'Desserts', 'Drinks', 'Pizza', 'Burger', 'Pasta', 'Salad', 'Wraps', 'Specials'];
  selectedCategory = 'All';
  priceRanges = ['All', 'Under 150', '150-250', 'Above 250'];
  selectedPriceRange = 'All';
  searchText = '';
  sortOption: 'popular' | 'priceLow' | 'priceHigh' | 'rating' | 'new' | 'name' = 'popular';

  getVisibleItems(items: MenuItem[]): MenuItem[] {
    const search = this.searchText.trim().toLowerCase();
    let filtered = items;

    if (search) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(search));
    }

    const sorted = [...filtered];
    switch (this.sortOption) {
      case 'priceLow':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'new':
        sorted.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
      default:
        sorted.sort((a, b) => Number(Boolean(b.isPopular)) - Number(Boolean(a.isPopular)));
        break;
    }

    return sorted;
  }

  addToCart(item: MenuItem, event: Event) {
    event.stopPropagation();
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

  confirmLogout(): void {
    const shouldLogout = typeof window !== 'undefined'
      ? window.confirm('Are you sure you want to logout?')
      : false;

    if (!shouldLogout) {
      return;
    }

    this.userProfileService.clearProfile();
    this.snackBar.open('You have been logged out.', 'Close', { duration: 2000 });
    this.router.navigate(['/register']);
  }
}
