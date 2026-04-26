import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from '@shared/core/config/api.tokens';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = inject(API_URL);

  login(credentials: { email: string; password: string }) {
    return this.http
      .post<{
        token: string;
        email: string;
        role: string;
      }>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userEmail', response.email);
            localStorage.setItem('userRole', response.role);
          }
        }),
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserProfile() {
    return {
      email: localStorage.getItem('userEmail') || 'user@lavurger.com',
      role: localStorage.getItem('userRole') || 'ADMIN',
    };
  }
}
