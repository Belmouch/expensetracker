import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {

  console.log('AUTH GUARD CALLED');

  const router = inject(Router);

  const token = localStorage.getItem('token');

  console.log('TOKEN =', token);

  if (token) {
    return true;
  }

  router.navigate(['/login']);

  return false;

};