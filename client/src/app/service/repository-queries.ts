import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from './api-service';
import { queryKeys } from '../../lib/query-keys';
import { IndexStatusResponse, Repository } from '../api';

const INDEXING_POLL_MS = 2000;
const STATUS_POLL_MS = 1500;

function hasIndexingRepos(repos: Repository[] | undefined): boolean {
  return repos?.some((r) => r.indexStatus === 'INDEXING') ?? false;
}

function updateRepoInListCache(queryClient: QueryClient, repo: Repository): void {
  queryClient.setQueryData<Repository[]>(queryKeys.repos.list(), (current) =>
    current?.map((item) => (item.id === repo.id ? repo : item)),
  );
}

/** List repos; refresh from GitHub only if local list is empty. Poll while any are INDEXING. */
export function useRepos() {
  const api = inject(ApiService);

  return injectQuery(() => ({
    queryKey: queryKeys.repos.list(),
    queryFn: async (): Promise<Repository[]> => {
      const repos = await firstValueFrom(api.listRepos(false));
      if (repos.length > 0) return repos;
      return firstValueFrom(api.listRepos(true));
    },
    staleTime: 30_000,
    refetchInterval: (query) => (hasIndexingRepos(query.state.data) ? INDEXING_POLL_MS : false),
  }));
}

/** Single repository; polls while INDEXING. */
export function useRepository(repoId: () => string) {
  const api = inject(ApiService);

  return injectQuery(() => {
    const id = repoId();
    return {
      queryKey: queryKeys.repos.detail(id),
      queryFn: (): Promise<Repository> => firstValueFrom(api.getRepo(id)),
      enabled: Boolean(id),
      refetchInterval: (query) =>
        query.state.data?.indexStatus === 'INDEXING' ? INDEXING_POLL_MS : false,
    };
  });
}

/** Index status endpoint; enable only when you need active polling. */
export function useIndexStatus(repoId: () => string, enabled: () => boolean = () => false) {
  const api = inject(ApiService);

  return injectQuery(() => {
    const id = repoId();
    return {
      queryKey: queryKeys.repos.status(id),
      queryFn: (): Promise<IndexStatusResponse> => firstValueFrom(api.indexStatus(id)),
      enabled: Boolean(id) && enabled(),
      refetchInterval: (query) =>
        query.state.data?.indexStatus === 'INDEXING' ? STATUS_POLL_MS : false,
    };
  });
}

/** Start indexing; updates detail + list caches. */
export function useStartIndexing() {
  const api = inject(ApiService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: (repoId: string) => firstValueFrom(api.startIndex(repoId)),
    onSuccess: (repo: Repository) => {
      queryClient.setQueryData(queryKeys.repos.detail(repo.id), repo);
      updateRepoInListCache(queryClient, repo);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.repos.status(repo.id),
      });
    },
  }));
}

/** Force refresh list from GitHub. */
export function useRefreshRepos() {
  const api = inject(ApiService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: () => firstValueFrom(api.listRepos(true)),
    onSuccess: (repos: Repository[]) => {
      queryClient.setQueryData(queryKeys.repos.list(), repos);
    },
  }));
}

export function getRepoProgress(repo: Pick<Repository, 'filesProcessed' | 'filesTotal'>): number {
  if (!repo.filesTotal) return 0;
  return Math.min(100, Math.round((repo.filesProcessed / repo.filesTotal) * 100));
}
