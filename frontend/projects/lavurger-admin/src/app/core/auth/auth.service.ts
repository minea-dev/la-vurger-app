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
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('auth_email', response.email);
            localStorage.setItem('auth_role', response.role);
          }
        }),
      );
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_email');
    localStorage.removeItem('auth_role');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getUserProfile() {
    return {
      email: localStorage.getItem('auth_email') || 'user@lavurger.com',
      role: localStorage.getItem('auth_role') || 'ADMIN',
    };
  }
}
