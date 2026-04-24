import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Array<string>;
  const userProfile = authService.getUserProfile();

  if (userProfile && allowedRoles.includes(userProfile.role)) {
    return true;
  }

  router.navigate(['/kitchen']);
  return false;
};
