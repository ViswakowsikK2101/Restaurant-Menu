import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

export const cartGuard: CanActivateFn = () => {
  const cartService = inject(CartService);
  const router = inject(Router);

  if (cartService.getSnapshot().length > 0) {
    return true;
  } else {
    router.navigate(['/menu']);
    return false;
  }
};
