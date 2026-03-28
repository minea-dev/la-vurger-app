import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductDTO } from '../../../shared/models/dtos/product.dto';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/products';

  getAllProducts() {
    return this.http.get<ProductDTO[]>(this.apiUrl);
  }

  getProductById(id: number) {
    return this.http.get<ProductDTO>(`${this.apiUrl}/${id}`);
  }

  getProductsByCategory(category: string) {
    return this.http.get<ProductDTO[]>(`${this.apiUrl}/category/${category}`);
  }
}
