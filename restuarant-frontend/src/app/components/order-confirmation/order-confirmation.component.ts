import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrderHistoryEntry, OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-4 py-20">
      <div class="max-w-2xl mx-auto text-center">
      <div class="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <mat-icon class="text-5xl text-green-600 w-12 h-12">check_circle</mat-icon>
      </div>
      
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
      <p class="text-xl text-gray-600 mb-8">Thank you for your order. Your delicious food is on the way.</p>

      @if (customerName) {
        <p class="text-gray-600 mb-4">Hi <span class="font-semibold">{{ customerName }}</span>, we have started preparing your order.</p>
      }
      
      @if (orderId) {
        <div class="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mb-8">
          <p class="text-gray-500 uppercase tracking-wide text-sm font-semibold">Order ID</p>
          <p class="text-3xl font-mono font-bold text-primary">#{{ orderId }}</p>
          @if (orderDate) {
            <p class="text-sm text-gray-500 mt-2">Placed on {{ orderDate | date:'medium' }}</p>
          }
        </div>
      }

      <div class="flex flex-wrap items-center justify-center gap-3">
        <button mat-raised-button color="primary" routerLink="/menu" class="px-8 py-3 text-lg">
          Order More
        </button>
        <button mat-stroked-button color="primary" routerLink="/dashboard" class="px-8 py-3 text-lg">
          View Dashboard
        </button>
      </div>

      <div class="bg-white mt-10 p-6 rounded-lg shadow-md text-left">
        <h2 class="text-xl font-bold mb-3">Order History</h2>
        <p class="text-sm text-gray-600 mb-4">Your latest confirmed orders are listed below.</p>
        @if (orderHistory.length === 0) {
          <p class="text-sm text-gray-500">No orders yet. Place your first order from the menu.</p>
        } @else {
          <div class="space-y-3">
            @for (entry of orderHistory; track entry.orderId) {
              <div class="rounded-md border border-slate-200 p-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <p class="font-semibold text-slate-800">Order #{{ entry.orderId }}</p>
                  <p class="text-sm text-slate-500">{{ entry.date | date:'medium' }}</p>
                </div>
                <p class="text-sm text-slate-700 mt-2">
                  {{ entry.itemCount }} item(s) | Total {{ entry.total | currency:'INR':'symbol':'1.0-0' }}
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  @for (item of entry.items; track $index) {
                    <span class="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                      {{ item.quantity }}x {{ item.name }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      <div class="bg-white mt-10 p-6 rounded-lg shadow-md text-left">
        <h2 class="text-xl font-bold mb-3">Quick feedback</h2>
        <p class="text-sm text-gray-600 mb-4">This template-driven form helps us improve your ordering experience.</p>
        <form #feedbackForm="ngForm" (ngSubmit)="submitFeedback(feedbackForm)">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="comments">Comments</label>
          <textarea
            id="comments"
            name="comments"
            rows="3"
            [(ngModel)]="feedback.comments"
            #comments="ngModel"
            required
            minlength="10"
            class="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="Tell us what you liked and what we can improve">
          </textarea>
          @if (comments.invalid && comments.touched) {
            <p class="text-red-600 text-sm mt-1">Please enter at least 10 characters.</p>
          }

          <label class="block text-sm font-medium text-gray-700 mt-4 mb-1" for="rating">Rating (1 to 5)</label>
          <input
            id="rating"
            name="rating"
            type="number"
            min="1"
            max="5"
            [(ngModel)]="feedback.rating"
            #rating="ngModel"
            required
            class="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-400" />
          @if (rating.invalid && rating.touched) {
            <p class="text-red-600 text-sm mt-1">Rating is required between 1 and 5.</p>
          }

          <div class="mt-4">
            <button mat-stroked-button color="primary" type="submit" [disabled]="feedbackForm.invalid">Submit Feedback</button>
          </div>
        </form>
      </div>
      </div>
    </div>
  `
})
export class OrderConfirmationComponent {
  private router = inject(Router);
  private orderService = inject(OrderService);
  orderId: number | null = null;
  orderDate: Date | null = null;
  customerName = '';
  orderHistory: OrderHistoryEntry[] = [];

  feedback = {
    comments: '',
    rating: 5,
  };

  constructor() {
    this.orderHistory = this.orderService.getOrderHistory();

    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.orderId = nav.extras.state['orderId'];
      this.orderDate = nav.extras.state['orderDate'] ? new Date(nav.extras.state['orderDate']) : null;
      this.customerName = nav.extras.state['customerName'] || '';
    }

    if ((!this.orderId || !this.orderDate || !this.customerName) && this.orderHistory.length > 0) {
      const latest = this.orderHistory[0];
      if (!this.orderId) {
        this.orderId = latest.orderId;
      }
      if (!this.orderDate) {
        this.orderDate = new Date(latest.date);
      }
      if (!this.customerName) {
        this.customerName = latest.customerName;
      }
    }
  }

  submitFeedback(form: NgForm) {
    if (!form.valid) {
      return;
    }

    // Placeholder for API integration.
    console.log('Feedback submitted', this.feedback);
    form.resetForm();
    this.feedback = { comments: '', rating: 5 };
  }
}
