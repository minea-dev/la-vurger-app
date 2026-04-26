import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductDTO } from '../../models/dtos/product.dto';
import { OrderRequest, OrderResponse } from '../../models/dtos/order.dto';
import { APP_CONFIG } from '@shared/core/config/api.tokens';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);
  private readonly API_URL = this.config.apiUrl;

  getProducts(): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.API_URL}/products`);
  }

  createOrder(order: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.API_URL}/orders`, order);
  }
}
