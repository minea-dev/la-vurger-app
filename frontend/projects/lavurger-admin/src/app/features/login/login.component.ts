import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  credentials = { email: '', password: '' };
  errorMessage = '';
  isLoading = false;

  onSubmit() {
    this.errorMessage = '';

    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Introdueix correu i contrasenya.';
      return;
    }

    this.isLoading = true;
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;

        if (err.status === 401) {
          this.errorMessage = 'Credencials incorrectes o compte desactivat.';
        } else if (err.status === 403) {
          this.errorMessage = "No tens permisos per accedir al panell d'administració.";
        } else {
          this.errorMessage = 'Error de connexió amb el servidor. Torna-ho a provar.';
        }

        this.cdr.detectChanges();
      },
    });
  }
}
