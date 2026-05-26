import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrderDTO, OrderRequest, OrderResponse } from '../../models/dtos/order.dto';
import { OrderStatus } from '../../models/enums/order-status.enum';
import { PaymentStatus } from '../../models/enums/payment-status.enum';
import { APP_CONFIG } from '@shared/core/config/api.tokens';

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
}
