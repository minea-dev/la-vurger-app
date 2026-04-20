import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderDTO, OrderRequest, OrderResponse } from '../../shared/models/dtos/order.dto';
import { OrderStatus } from '../../shared/models/enums/order-status.enum';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  getOrders() {
    return this.http.get<OrderDTO[]>(this.apiUrl);
  }

  createOrder(orderData: OrderRequest) {
    return this.http.post<OrderResponse>(this.apiUrl, orderData);
  }

  getOrderById(id: number) {
    return this.http.get<OrderDTO>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: number, status: OrderStatus) {
    return this.http.patch<OrderDTO>(`${this.apiUrl}/${id}/status`, { status });
  }
}
