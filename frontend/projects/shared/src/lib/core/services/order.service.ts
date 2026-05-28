import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrderDTO, OrderRequest, OrderResponse } from '../../models/dtos/order.dto';
import { OrderStatus } from '../../models/enums/order-status.enum';
import { PaymentStatus } from '../../models/enums/payment-status.enum';
import { APP_CONFIG } from '@shared/core/config/api.tokens';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);
  private apiUrl = `${this.config.apiUrl}/orders`;

  getOrders(status?: OrderStatus) {
    let params = new HttpParams().set('t', new Date().getTime().toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<OrderDTO[]>(this.apiUrl, { params });
  }

  createOrder(orderData: OrderRequest) {
    return this.http.post<OrderResponse>(this.apiUrl, orderData);
  }

  getOrderById(id: number) {
    return this.http.get<OrderDTO>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: number, status: OrderStatus) {
    return this.http.patch<OrderDTO>(`${this.apiUrl}/${id}/status`, `"${status}"`, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  updatePaymentStatus(id: number, status: PaymentStatus) {
    return this.http.patch<OrderDTO>(`${this.apiUrl}/${id}/payment-status`, `"${status}"`, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getMyOrders() {
    return this.http.get<OrderDTO[]>(`${this.apiUrl}/my-orders`);
  }

  getRecentOrders(status: OrderStatus, hours: number = 24) {
    let params = new HttpParams()
      .set('status', status)
      .set('hours', hours.toString())
      .set('t', new Date().getTime().toString());

    return this.http.get<OrderDTO[]>(`${this.apiUrl}/recent`, { params });
  }

  getHistoryAdmin(date?: string, startDate?: string, endDate?: string): Observable<OrderDTO[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<OrderDTO[]>(`${this.apiUrl}/history-admin`, { params });
  }
}
