import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth']);
    return false;
  }

  const user = authService.getUserData();
  if (!user || !user.isAdmin) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
