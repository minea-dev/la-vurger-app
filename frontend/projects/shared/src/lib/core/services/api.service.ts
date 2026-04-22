import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductDTO } from '../../models/dtos/product.dto';
import { OrderRequest, OrderResponse } from '../../models/dtos/order.dto';
import { environment } from '../../../../../lavurger-client/src/environments/environment';

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
