import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderDTO } from '../../../shared/models/dtos/order.dto';
import { OrderStatus } from '../../../shared/models/enums/order-status.enum';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/orders';

  getOrders() {
    return this.http.get<OrderDTO[]>(this.apiUrl);
  }

  createOrder(orderData: Partial<OrderDTO>) {
    return this.http.post<OrderDTO>(this.apiUrl, orderData);
  }

  updateOrderStatus(id: number, status: OrderStatus) {
    return this.http.patch<OrderDTO>(`${this.apiUrl}/${id}/status`, { status });
  }
}
