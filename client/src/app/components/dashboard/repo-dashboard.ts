import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFolderGit2 } from '@ng-icons/lucide';
import { IndexStatus, Repository } from '../../api';
import { useRefreshRepos, useRepos } from '../../service/repository-queries';
import { DashboardHeaderComponent, FilterStatus, RepositoryVisibility } from './dashboard-header';
import { RepoCardComponent } from './repo-card';

@Component({
  selector: 'app-repo-dashboard',
  standalone: true,
  imports: [NgIcon, DashboardHeaderComponent, RepoCardComponent],
  providers: [provideIcons({ lucideFolderGit2 })],
  template: `
    <div class="flex min-h-full flex-col">
      <app-dashboard-header
        [search]="search()"
        [visibility]="visibility()"
        [status]="status()"
        [totalCount]="reposQuery.data()?.length"
        [readyCount]="readyCount()"
        [isSyncing]="isSyncing()"
        (searchChange)="search.set($event)"
        (visibilityChange)="visibility.set($event)"
        (statusChange)="status.set($event)"
        (sync)="syncRepositories()"
      />

      <div class="flex flex-1 flex-col gap-4 p-4 md:p-6">
        @if (reposQuery.isLoading()) {
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            @for (item of loadingCards; track item) {
              <div class="h-64 animate-pulse rounded-2xl border bg-muted/40"></div>
            }
          </div>
        }

        @if (reposQuery.isError()) {
          <div class="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-8 text-center">
            <span class="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"><ng-icon name="lucideFolderGit2" class="size-5" /></span>
            <div>
              <h2 class="font-semibold">Couldn’t load repositories</h2>
              <p class="mt-1 text-sm text-muted-foreground">{{ reposQuery.error()?.message ?? 'Something went wrong while loading repositories.' }}</p>
            </div>
            <button type="button" class="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted" (click)="retry()">Try again</button>
          </div>
        }

        @if (reposQuery.isSuccess() && filtered().length === 0) {
          <div class="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-8 text-center">
            <span class="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"><ng-icon name="lucideFolderGit2" class="size-5" /></span>
            <div>
              <h2 class="font-semibold">No repositories match</h2>
              <p class="mt-1 text-sm text-muted-foreground">Try clearing filters or syncing again.</p>
            </div>
          </div>
        }

        @if (reposQuery.isSuccess() && filtered().length > 0) {
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            @for (repo of filtered(); track repo.id) {
              <app-repo-card [repo]="repo" />
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class RepoDashboardComponent {
  readonly reposQuery = useRepos();
  readonly refresh = useRefreshRepos();
  readonly search = signal('');
  readonly status = signal<FilterStatus>('ALL');
  readonly visibility = signal<RepositoryVisibility>('all');
  readonly loadingCards = [0, 1, 2, 3, 4, 5];

  readonly readyCount = computed(
    () => this.reposQuery.data()?.filter((repo) => repo.indexStatus === 'READY').length ?? 0,
  );
  readonly isSyncing = computed(() => this.refresh.isPending() || this.reposQuery.isFetching());
  readonly filtered = computed(() => {
    const repositories = this.reposQuery.data() ?? [];
    const query = this.search().trim().toLowerCase();
    const currentStatus = this.status();
    const currentVisibility = this.visibility();

    return repositories.filter((repo: Repository) => {
      if (currentStatus !== 'ALL' && repo.indexStatus !== (currentStatus as IndexStatus)) return false;
      if (currentVisibility === 'private' && !repo.isPrivate) return false;
      if (currentVisibility === 'public' && repo.isPrivate) return false;
      if (!query) return true;
      return (
        repo.fullName.toLowerCase().includes(query) ||
        (repo.description ?? '').toLowerCase().includes(query) ||
        (repo.language ?? '').toLowerCase().includes(query)
      );
    });
  });

  syncRepositories(): void {
    this.refresh.mutate();
  }

  retry(): void {
    void this.reposQuery.refetch();
  }
}
