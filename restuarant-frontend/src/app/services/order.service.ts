import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Order } from '../models/order.model';
import { OrderResponse } from '../models/order-response.model';

interface OrderApiResponse {
  orderId?: number;
  order?: { id?: number };
  message?: string;
}

interface OrderApiHistoryResponse {
  id: number;
  customer?: {
    name?: string;
    email?: string;
  };
  total?: number;
  date?: string;
  status?: OrderStatus;
  cancelledAt?: string | null;
  items?: Array<{
    name?: string;
    price?: number;
    quantity?: number;
  }>;
}

export type OrderStatus = 'placed' | 'cancelled';

export interface OrderHistoryEntry {
  orderId: number;
  customerName: string;
  customerEmail: string;
  total: number;
  date: string;
  status: OrderStatus;
  cancelledAt: string | null;
  itemCount: number;
  items: Array<{
    name: string;
    quantity: number;
    lineTotal: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = '/api/orders';
  private readonly historyStorageKey = 'urban-plate-order-history';
  readonly cancellationWindowMinutes = 15;

  placeOrder(order: Order): Observable<OrderResponse> {
    const fallbackOrderId = Date.now();

    if (isPlatformBrowser(this.platformId)) {
      return this.http.post<OrderApiResponse>(this.apiUrl, order).pipe(
        map((res) => ({
          message: res.message,
          orderId: res.orderId ?? res.order?.id ?? fallbackOrderId,
        })),
        tap((res) => this.saveOrderToHistory(order, res.orderId))
      );
    }

    return of({ orderId: fallbackOrderId });
  }

  fetchOrderHistoryByEmail(email: string): Observable<OrderHistoryEntry[]> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return of([]);
    }

    const params = new HttpParams().set('email', normalizedEmail);
    return this.http.get<OrderApiHistoryResponse[]>(this.apiUrl, { params }).pipe(
      map((response) => response.map((entry) => this.mapApiOrderToHistoryEntry(entry))),
      map((entries) => entries.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))),
      tap((entries) => this.upsertOrderHistory(entries)),
      catchError(() => of(this.getOrderHistoryByEmail(normalizedEmail)))
    );
  }

  cancelOrder(orderId: number): Observable<OrderHistoryEntry> {
    return this.http.patch<{ order?: OrderApiHistoryResponse }>(`${this.apiUrl}/${orderId}/cancel`, {}).pipe(
      map((response) => this.mapApiOrderToHistoryEntry(response.order)),
      tap((updated) => this.upsertOrderHistory([updated])),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status !== 0) {
          return throwError(() => error);
        }

        const local = this.markOrderCancelledLocally(orderId);
        return of(local);
      })
    );
  }

  canCancelOrder(entry: OrderHistoryEntry): boolean {
    if (entry.status !== 'placed') {
      return false;
    }

    const orderTimestamp = Date.parse(entry.date);
    if (Number.isNaN(orderTimestamp)) {
      return false;
    }

    const elapsedMs = Date.now() - orderTimestamp;
    return elapsedMs <= this.cancellationWindowMinutes * 60 * 1000;
  }

  getRemainingCancellationMinutes(entry: OrderHistoryEntry): number {
    const orderTimestamp = Date.parse(entry.date);
    if (Number.isNaN(orderTimestamp)) {
      return 0;
    }

    const expiresAt = orderTimestamp + this.cancellationWindowMinutes * 60 * 1000;
    const remainingMs = expiresAt - Date.now();
    return Math.max(0, Math.ceil(remainingMs / (60 * 1000)));
  }

  getOrderHistory(): OrderHistoryEntry[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    try {
      const raw = localStorage.getItem(this.historyStorageKey);
      const parsed = raw ? (JSON.parse(raw) as OrderHistoryEntry[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  getOrderHistoryByEmail(email: string): OrderHistoryEntry[] {
    const target = email.trim().toLowerCase();
    return this.getOrderHistory().filter((entry) => entry.customerEmail === target);
  }

  getLatestOrder(): OrderHistoryEntry | null {
    const history = this.getOrderHistory();
    return history.length > 0 ? history[0] : null;
  }

  private saveOrderToHistory(order: Order, orderId: number): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const items = order.items.map((item) => {
      const quantity = (item as { quantity?: number }).quantity ?? 1;
      return {
        name: item.name,
        quantity,
        lineTotal: item.price * quantity,
      };
    });

    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    const entry: OrderHistoryEntry = {
      orderId,
      customerName: order.customer.name,
      customerEmail: order.customer.email.trim().toLowerCase(),
      total: order.total,
      date: new Date(order.date).toISOString(),
      status: 'placed',
      cancelledAt: null,
      itemCount,
      items,
    };

    this.upsertOrderHistory([entry]);
  }

  private mapApiOrderToHistoryEntry(order?: OrderApiHistoryResponse): OrderHistoryEntry {
    const safeOrderId = order?.id ?? Date.now();
    const safeItems = Array.isArray(order?.items) ? order.items : [];
    const items = safeItems.map((item) => {
      const quantity = item.quantity ?? 1;
      const price = item.price ?? 0;
      return {
        name: item.name || 'Item',
        quantity,
        lineTotal: price * quantity,
      };
    });

    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return {
      orderId: safeOrderId,
      customerName: order?.customer?.name || 'Customer',
      customerEmail: String(order?.customer?.email || '').trim().toLowerCase(),
      total: order?.total ?? items.reduce((sum, item) => sum + item.lineTotal, 0),
      date: order?.date ? new Date(order.date).toISOString() : new Date().toISOString(),
      status: order?.status === 'cancelled' ? 'cancelled' : 'placed',
      cancelledAt: order?.cancelledAt || null,
      itemCount,
      items,
    };
  }

  private upsertOrderHistory(entries: OrderHistoryEntry[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const existing = this.getOrderHistory();
    const merged = [...entries, ...existing]
      .reduce<OrderHistoryEntry[]>((acc, current) => {
        if (acc.some((item) => item.orderId === current.orderId)) {
          return acc;
        }

        acc.push(current);
        return acc;
      }, [])
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .slice(0, 50);

    localStorage.setItem(this.historyStorageKey, JSON.stringify(merged));
  }

  private markOrderCancelledLocally(orderId: number): OrderHistoryEntry {
    const history = this.getOrderHistory();
    const existing = history.find((entry) => entry.orderId === orderId);
    const updated: OrderHistoryEntry = existing
      ? {
          ...existing,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
        }
      : {
          orderId,
          customerName: 'Customer',
          customerEmail: '',
          total: 0,
          date: new Date().toISOString(),
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          itemCount: 0,
          items: [],
        };

    this.upsertOrderHistory([updated]);
    return updated;
  }
}
