import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { ApiService } from '../service/api-service';

/**
 * If already logged in, skip login → dashboard (or ?next=).
 * On 401/403, allow login page.
 */
export const guestGuard: CanActivateFn = (_route, state) => {
  const api = inject(ApiService);
  const router = inject(Router);

  return api.me().pipe(
    map((user) => {
      if (!user) return true;

      const next = state.root.queryParams['next'];
      const target = typeof next === 'string' && next.startsWith('/') ? next : '/dashboard';
      return router.parseUrl(target);
    }),
    catchError(() => of(true)), // not logged in → show login
  );
};
