import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderDTO, OrderRequest, OrderResponse } from '../../models/dtos/order.dto';
import { OrderStatus } from '../../models/enums/order-status.enum';
import { PaymentStatus } from '../../models/enums/payment-status.enum';
import { APP_CONFIG } from '@shared/core/config/api.tokens';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);
  private apiUrl = `${this.config.apiUrl}/orders`;

  getOrders() {
    return this.http.get<OrderDTO[]>(`${this.apiUrl}?t=${new Date().getTime()}`);
  }

  createOrder(orderData: OrderRequest) {
    return this.http.post<OrderResponse>(this.apiUrl, orderData);
  }

  getOrderById(id: number) {
    return this.http.get<OrderDTO>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: number, status: OrderStatus) {
    return this.http.patch<OrderDTO>(`${this.apiUrl}/${id}/status`, `"${status}"`);
  }

  updatePaymentStatus(id: number, status: PaymentStatus) {
    return this.http.patch<OrderDTO>(`${this.apiUrl}/${id}/payment-status`, `"${status}"`);
  }

  getMyOrders() {
    return this.http.get<OrderDTO[]>(`${this.apiUrl}/my-orders`);
  }
}
