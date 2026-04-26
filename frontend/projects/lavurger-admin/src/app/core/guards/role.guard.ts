import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '@shared';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as Array<string>;
  const userProfile = authService.getUserProfile();

  if (!userProfile) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRoles.includes(userProfile.role)) {
    return true;
  }

  else {
    if (userProfile.role === Role.CASHIER) {
      router.navigate(['/monitor']);
    } else {
      router.navigate(['/kitchen']);
    }
    return false;
  }
};
