import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductDTO } from '@shared/models/dtos/product.dto';
import { API_URL } from '../config/api.tokens';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_URL);
  private apiUrl = `${this.baseUrl}/products`;

  getAllProducts() {
    return this.http.get<ProductDTO[]>(this.apiUrl);
  }

  toggleAvailability(id: number, isAvailable: boolean) {
    return this.http.put<ProductDTO>(`${this.apiUrl}/${id}/availability`, { isAvailable });
  }

  createProduct(product: Partial<ProductDTO>) {
    return this.http.post<ProductDTO>(this.apiUrl, product);
  }

  updateProduct(id: number, product: Partial<ProductDTO>) {
    return this.http.put<ProductDTO>(`${this.apiUrl}/${id}`, product);
  }
}
