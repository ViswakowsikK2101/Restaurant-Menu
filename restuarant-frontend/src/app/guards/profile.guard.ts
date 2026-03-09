import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserProfileService } from '../services/user-profile.service';

export const profileGuard: CanActivateFn = (_route, state) => {
  const profileService = inject(UserProfileService);
  const router = inject(Router);

  if (profileService.hasProfile()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
