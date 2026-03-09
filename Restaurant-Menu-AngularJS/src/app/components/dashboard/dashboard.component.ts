import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { OrderHistoryEntry, OrderService, OrderStatus } from '../../services/order.service';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-4 pb-20 max-w-5xl">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 class="text-3xl font-bold">My Dashboard</h1>
          <p class="text-slate-600 mt-1">Track placed and cancelled orders in one place.</p>
          <p class="text-xs text-slate-500 mt-1">Cancellation is available within {{ orderService.cancellationWindowMinutes }} minutes of placing an order.</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/menu">Order Now</a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <mat-card>
          <mat-card-content>
            <p class="text-sm text-slate-500">Total Orders</p>
            <p class="text-2xl font-bold">{{ orders.length }}</p>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <p class="text-sm text-slate-500">Placed</p>
            <p class="text-2xl font-bold text-emerald-700">{{ placedCount }}</p>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <p class="text-sm text-slate-500">Cancelled</p>
            <p class="text-2xl font-bold text-rose-700">{{ cancelledCount }}</p>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="flex flex-wrap gap-2 mb-5">
        <button mat-stroked-button [class.active-filter]="activeFilter === 'all'" (click)="activeFilter = 'all'">All</button>
        <button mat-stroked-button [class.active-filter]="activeFilter === 'placed'" (click)="activeFilter = 'placed'">Placed</button>
        <button mat-stroked-button [class.active-filter]="activeFilter === 'cancelled'" (click)="activeFilter = 'cancelled'">Cancelled</button>
      </div>

      @if (isLoading) {
        <p class="text-slate-600">Loading orders...</p>
      } @else if (filteredOrders.length === 0) {
        <mat-card>
          <mat-card-content class="py-8 text-center">
            <p class="text-slate-600">No orders available for this filter.</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="space-y-4">
          @for (entry of filteredOrders; track entry.orderId) {
            <mat-card>
              <mat-card-content>
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p class="font-semibold text-lg">Order #{{ entry.orderId }}</p>
                    <p class="text-sm text-slate-500">{{ entry.date | date:'medium' }}</p>
                    <p class="text-sm text-slate-700 mt-1">{{ entry.itemCount }} item(s) | {{ entry.total | currency:'INR':'symbol':'1.0-0' }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="status-chip" [class.cancelled]="entry.status === 'cancelled'">{{ entry.status | titlecase }}</span>
                    @if (entry.status === 'placed') {
                      <button
                        mat-raised-button
                        color="warn"
                        class="cancel-order-btn"
                        [disabled]="cancellingOrderId === entry.orderId || !canCancel(entry)"
                        (click)="cancelOrder(entry)">
                        {{ cancellingOrderId === entry.orderId ? 'Cancelling...' : 'Cancel Order' }}
                      </button>
                    }
                  </div>
                </div>

                @if (entry.status === 'placed' && canCancel(entry)) {
                  <p class="text-xs text-amber-700 mt-2">You can cancel this order for {{ remainingMinutes(entry) }} more minute(s).</p>
                }

                @if (entry.status === 'placed' && !canCancel(entry)) {
                  <p class="text-xs text-slate-500 mt-2">Cancellation window expired.</p>
                }

                <div class="mt-3 flex flex-wrap gap-2">
                  @for (item of entry.items; track $index) {
                    <span class="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                      {{ item.quantity }}x {{ item.name }}
                    </span>
                  }
                </div>

                @if (entry.cancelledAt) {
                  <p class="text-xs text-rose-700 mt-2">Cancelled on {{ entry.cancelledAt | date:'medium' }}</p>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .active-filter {
      background: #111827;
      color: #ffffff;
      border-color: #111827;
    }

    .status-chip {
      border-radius: 9999px;
      padding: 0.25rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 600;
      background: #dcfce7;
      color: #166534;
    }

    .status-chip.cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    .cancel-order-btn {
      --mdc-protected-button-container-color: #b91c1c;
      --mdc-protected-button-label-text-color: #ffffff;
      border: 1px solid #991b1b;
      font-weight: 700;
      box-shadow: 0 6px 14px rgba(153, 27, 27, 0.35);
    }

    .cancel-order-btn:disabled {
      box-shadow: none;
      opacity: 0.6;
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly orderService = inject(OrderService);
  private userProfileService = inject(UserProfileService);

  orders: OrderHistoryEntry[] = [];
  activeFilter: OrderStatus | 'all' = 'all';
  isLoading = true;
  cancellingOrderId: number | null = null;

  get filteredOrders(): OrderHistoryEntry[] {
    if (this.activeFilter === 'all') {
      return this.orders;
    }

    return this.orders.filter((order) => order.status === this.activeFilter);
  }

  get placedCount(): number {
    return this.orders.filter((order) => order.status === 'placed').length;
  }

  get cancelledCount(): number {
    return this.orders.filter((order) => order.status === 'cancelled').length;
  }

  ngOnInit(): void {
    const profile = this.userProfileService.getProfile();
    if (!profile) {
      this.isLoading = false;
      return;
    }

    this.orderService.fetchOrderHistoryByEmail(profile.email).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: () => {
        this.orders = this.orderService.getOrderHistoryByEmail(profile.email);
        this.isLoading = false;
      },
    });
  }

  cancelOrder(entry: OrderHistoryEntry): void {
    if (entry.status !== 'placed' || !this.canCancel(entry)) {
      return;
    }

    this.cancellingOrderId = entry.orderId;
    this.orderService.cancelOrder(entry.orderId).subscribe({
      next: (updated) => {
        this.orders = this.orders.map((order) => order.orderId === updated.orderId ? updated : order);
        this.cancellingOrderId = null;
      },
      error: () => {
        this.cancellingOrderId = null;
      },
    });
  }

  canCancel(entry: OrderHistoryEntry): boolean {
    return this.orderService.canCancelOrder(entry);
  }

  remainingMinutes(entry: OrderHistoryEntry): number {
    return this.orderService.getRemainingCancellationMinutes(entry);
  }
}
