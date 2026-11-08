import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ApiService } from '../service/api-service';

export const authGuard: CanActivateFn = (_route, state) => {
  const api = inject(ApiService);
  const router = inject(Router);

  return api.me().pipe(
    map((user) => {
      if (user) return true;
      return router.createUrlTree(['/login'], {
        queryParams: { next: state.url },
      });
    }),
    catchError((err) => {
      // Not logged in
      if (err?.status === 401 || err?.status === 403) {
        return of(
          router.createUrlTree(['/login'], {
            queryParams: { next: state.url },
          }),
        );
      }
      // Real failure → optional: error page instead of login
      return of(
        router.createUrlTree(['/error'], {
          queryParams: { status: err?.status ?? 500 },
        }),
      );
    }),
  );
};
