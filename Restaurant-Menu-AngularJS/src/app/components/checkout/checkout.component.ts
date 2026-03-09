import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { UserProfileService } from '../../services/user-profile.service';

import { OrderResponse } from '../../models/order-response.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule,
    MatCardModule
  ],
  template: `
    <div class="container mx-auto p-4 pb-28 max-w-3xl">
      <h1 class="text-3xl font-bold mb-6">Checkout</h1>
      <div class="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        Want faster repeat checkout? <a routerLink="/register" class="font-semibold text-blue-700">Save your profile details</a>.
      </div>
      
      <mat-card>
        <mat-card-content>
          <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="name" placeholder="John Doe">
                @if (checkoutForm.get('name')?.hasError('required')) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Email Address</mat-label>
                <input matInput formControlName="email" placeholder="john@example.com">
                @if (checkoutForm.get('email')?.hasError('required')) {
                  <mat-error>Email is required</mat-error>
                }
                @if (checkoutForm.get('email')?.hasError('email')) {
                  <mat-error>Please enter a valid email address</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Delivery Address</mat-label>
                <textarea matInput formControlName="address" rows="3" placeholder="123 Main St, City, Country"></textarea>
                @if (checkoutForm.get('address')?.hasError('required')) {
                  <mat-error>Address is required</mat-error>
                }
              </mat-form-field>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Card Number</mat-label>
                  <input matInput formControlName="cardNumber" placeholder="1234 5678 9012 3456">
                  @if (checkoutForm.get('cardNumber')?.hasError('required')) {
                    <mat-error>Card number is required</mat-error>
                  }
                  @if (checkoutForm.get('cardNumber')?.hasError('pattern')) {
                    <mat-error>Enter a valid 16-digit card number</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Card Holder Name</mat-label>
                  <input matInput formControlName="cardHolder" placeholder="John Doe">
                  @if (checkoutForm.get('cardHolder')?.hasError('required')) {
                    <mat-error>Card holder name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Expiry (MM/YY)</mat-label>
                  <input matInput formControlName="expiry" placeholder="08/28">
                  @if (checkoutForm.get('expiry')?.hasError('required')) {
                    <mat-error>Expiry date is required</mat-error>
                  }
                  @if (checkoutForm.get('expiry')?.hasError('pattern')) {
                    <mat-error>Use MM/YY format</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>CVV</mat-label>
                  <input matInput type="password" formControlName="cvv" placeholder="123">
                  @if (checkoutForm.get('cvv')?.hasError('required')) {
                    <mat-error>CVV is required</mat-error>
                  }
                  @if (checkoutForm.get('cvv')?.hasError('pattern')) {
                    <mat-error>CVV must be 3 digits</mat-error>
                  }
                </mat-form-field>
              </div>
            </div>

            <div class="mt-8 border-t pt-6">
              <h2 class="text-xl font-bold mb-4">Order Summary</h2>
              <div class="flex justify-between items-center mb-2">
                <span>Items Total:</span>
                <span class="font-bold">{{ cartTotal | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
              <div class="flex justify-between items-center mb-6">
                <span>Delivery Fee:</span>
                <span class="font-bold">{{ 5.00 | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>
              <div class="flex justify-between items-center text-xl font-bold border-t pt-4 mb-8">
                <span>Grand Total:</span>
                <span class="text-primary">{{ cartTotal + 5 | currency:'INR':'symbol':'1.0-0' }}</span>
              </div>

              <div class="checkout-actions">
                <button mat-stroked-button color="primary" type="button" (click)="goToCart()">
                  Back to Cart
                </button>
                <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting">
                  {{ isSubmitting ? 'Placing Order...' : 'Place Order' }}
                </button>
              </div>
              @if (checkoutForm.invalid) {
                <p class="mt-2 text-sm text-slate-600 text-right">Fill required fields before placing your order.</p>
              }
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .checkout-actions {
      position: sticky;
      bottom: 0;
      z-index: 20;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 0.75rem 0 0.25rem;
      background: linear-gradient(180deg, rgba(255, 250, 244, 0.65), rgba(255, 250, 244, 0.95));
      backdrop-filter: blur(2px);
    }

    .checkout-actions .mat-mdc-button-base {
      min-width: 150px;
    }
  `]
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private userProfileService = inject(UserProfileService);
  private router = inject(Router);

  checkoutForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}([ -]?\d{4}){3}$/)]],
    cardHolder: ['', Validators.required],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/(\d{2})$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  cartTotal = this.cartService.getTotal();
  isSubmitting = false;

  constructor() {
    const profile = this.userProfileService.getProfile();
    if (profile) {
      this.checkoutForm.patchValue(profile);
    }
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  onSubmit() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const items = this.cartService.getSnapshot();
    const hasInvalidQuantity = items.some((item) => item.quantity < 1);
    if (items.length === 0 || hasInvalidQuantity) {
      this.goToCart();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.checkoutForm.value;

    this.userProfileService.saveProfile({
      name: formValue.name!,
      email: formValue.email!,
      address: formValue.address!,
      cardNumber: formValue.cardNumber!,
      cardHolder: formValue.cardHolder!,
      expiry: formValue.expiry!,
      cvv: formValue.cvv!,
    });

    const order: Order = {
      customer: {
        name: formValue.name!,
        email: formValue.email!,
        address: formValue.address!
      },
      items,
      total: this.cartService.getTotal() + 5,
      date: new Date()
    };

    this.orderService.placeOrder(order).subscribe({
      next: (res: OrderResponse) => {
        this.cartService.clearCart();
        this.router.navigate(['/order-confirmation'], {
          state: {
            orderId: res.orderId,
            orderDate: order.date,
            customerName: order.customer.name,
          },
        });
      },
      error: (err: unknown) => {
        this.isSubmitting = false;
        console.error(err);
      }
    });
  }
}
