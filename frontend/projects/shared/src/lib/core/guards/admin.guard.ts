import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@shared';
import { Role } from '@shared';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getRole() as Role;
  const adminRoles: Role[] = [Role.ADMIN, Role.MANAGER, Role.KITCHEN, Role.CASHIER];

  if (role && adminRoles.includes(role)) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
