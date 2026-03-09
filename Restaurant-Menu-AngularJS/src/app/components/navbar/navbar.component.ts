import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { CartService } from '../../services/cart.service';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs/operators';
import { UserProfileService } from '../../services/user-profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    AsyncPipe
  ],
  template: `
    <mat-toolbar color="primary" class="sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 shadow-sm backdrop-blur-sm">
      <a routerLink="/" class="text-white no-underline flex items-center gap-2">
        <mat-icon>restaurant_menu</mat-icon>
        <span class="font-bold text-lg tracking-wide">Urban Plate</span>
      </a>
      
      <div class="flex gap-2 md:gap-4 items-center">
        <a routerLink="/menu" mat-button class="font-semibold rounded-full bg-white/85 border border-slate-200/70 px-4 text-slate-800 hover:bg-white">
          Menu
        </a>
        @if (profile$ | async; as profile) {
          <span class="hidden md:inline text-white text-sm">Hi, {{ profile.name }}</span>
          <button mat-button class="font-semibold rounded-full bg-white/85 border border-slate-200/70 px-4 text-slate-800 hover:bg-white" (click)="confirmLogout()">
            Logout
          </button>
        } @else {
          <a routerLink="/login" mat-button class="font-semibold rounded-full bg-white/85 border border-slate-200/70 px-4 text-slate-800 hover:bg-white">
            Login
          </a>
          <a routerLink="/register" mat-button class="font-semibold rounded-full bg-white/85 border border-slate-200/70 px-4 text-slate-800 hover:bg-white">
            Register
          </a>
        }
        <a routerLink="/dashboard" mat-button class="font-semibold rounded-full bg-white/85 border border-slate-200/70 px-4 text-slate-800 hover:bg-white">
          Dashboard
        </a>
        <a routerLink="/cart" mat-icon-button class="rounded-full bg-white/85 border border-slate-200/70 text-slate-800 hover:bg-white" aria-label="Open cart">
          <mat-icon [matBadge]="cartCount$ | async" matBadgeColor="warn">shopping_cart</mat-icon>
        </a>
      </div>
    </mat-toolbar>
  `,
  styles: []
})
export class NavbarComponent {
  private cartService = inject(CartService);
  private userProfileService = inject(UserProfileService);
  private router = inject(Router);
  
  cartCount$ = this.cartService.cartItems$.pipe(
    map(items => items.reduce((acc, item) => acc + item.quantity, 0))
  );

  profile$ = this.userProfileService.profile$;

  confirmLogout(): void {
    const shouldLogout = typeof window !== 'undefined'
      ? window.confirm('Are you sure you want to logout?')
      : false;

    if (!shouldLogout) {
      return;
    }

    this.userProfileService.clearProfile();
    this.router.navigate(['/login']);
  }
}
