import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductDTO } from '../../shared/models/dtos/product.dto';
import { OrderRequest, OrderResponse } from '../../shared/models/dtos/order.dto';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  private readonly API_URL = environment.apiUrl;

  getProducts(): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.API_URL}/products`);
  }

  createOrder(order: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.API_URL}/orders`, order);
  }
}
