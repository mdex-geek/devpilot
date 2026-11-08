import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { QueryClient } from '@tanstack/query-core';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { User } from '../api';
import { queryKeys } from '../../lib/query-keys';

import { ApiService } from './api-service';

/**
 * Current user. 401/403 → null (not an error).
 * Other errors still fail the query.
 */
export function useCurrentUser() {
  const api = inject(ApiService);

  return injectQuery(() => ({
    queryKey: queryKeys.auth.me(),
    queryFn: async (): Promise<User | null> => {
      try {
        return await firstValueFrom(api.me());
      } catch (error: unknown) {
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  }));
}

export function useLogout() {
  const api = inject(ApiService);
  const queryClient = inject(QueryClient);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: () => firstValueFrom(api.logout()),
    onSettled: async () => {
      queryClient.setQueryData<User | null>(queryKeys.auth.me(), null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      await router.navigateByUrl('/login');
    },
  }));
}
