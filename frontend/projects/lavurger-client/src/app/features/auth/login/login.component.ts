import { Component, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '@shared';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  errorMessage: string | null = null;
  private errorTimeoutId: any = null;

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/menu';
        this.router.navigate([returnUrl], { queryParamsHandling: 'preserve' });
      },
      error: () => {
        this.errorMessage = 'Credencials incorrectes';
        this.cdr.markForCheck();

        this.errorTimeoutId = setTimeout(() => {
          this.errorMessage = null;
          this.cdr.markForCheck();
        }, 3500);
      },
    });
  }

  backToMenu(): void {
    this.router.navigate(['/menu'], { queryParamsHandling: 'preserve' });
  }

  ngOnDestroy(): void {
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }
  }
}
