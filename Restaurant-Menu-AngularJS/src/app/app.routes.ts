import {Routes} from '@angular/router';
import { cartGuard } from './guards/cart.guard';
import { profileGuard } from './guards/profile.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'menu', pathMatch: 'full' },
  { path: 'menu', loadComponent: () => import('./components/menu-list/menu-list.component').then((m) => m.MenuListComponent) },
  { path: 'menu/:id', loadComponent: () => import('./components/menu-detail/menu-detail.component').then((m) => m.MenuDetailComponent) },
  { path: 'cart', loadComponent: () => import('./components/cart/cart.component').then((m) => m.CartComponent) },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/registration/registration.component').then((m) => m.RegistrationComponent) },
  { path: 'checkout', loadComponent: () => import('./components/checkout/checkout.component').then((m) => m.CheckoutComponent), canActivate: [cartGuard] },
  { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent), canActivate: [profileGuard] },
  { path: 'order-confirmation', loadComponent: () => import('./components/order-confirmation/order-confirmation.component').then((m) => m.OrderConfirmationComponent) },
  { path: '**', redirectTo: 'menu' }
];
