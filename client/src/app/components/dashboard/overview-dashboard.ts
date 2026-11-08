import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlertCircle,
  lucideCheckCircle2,
  lucideFolderGit2,
  lucideLoaderCircle,
  lucideMessageSquareCode,
} from '@ng-icons/lucide';
import { Repository } from '../../api';
import { useRepos } from '../../service/repository-queries';
import { RepoCardComponent } from './repo-card';

@Component({
  selector: 'app-overview-dashboard',
  standalone: true,
  imports: [NgIcon, RouterLink, RepoCardComponent],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideCheckCircle2,
      lucideFolderGit2,
      lucideLoaderCircle,
      lucideMessageSquareCode,
    }),
  ],
  template: `
    <div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @if (reposQuery.isPending()) {
          @for (item of skeletons; track item) {
            <div class="h-28 animate-pulse rounded-2xl border bg-muted/40"></div>
          }
        } @else {
          <div class="rounded-2xl border bg-card p-4 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm text-muted-foreground">Repositories</p>
                <p class="mt-1 text-2xl font-semibold">{{ repos.length }}</p>
              </div>
              <span class="rounded-lg bg-muted p-2 text-muted-foreground"><ng-icon name="lucideFolderGit2" class="size-4" /></span>
            </div>
            <p class="mt-3 text-xs text-muted-foreground">Connected from GitHub</p>
          </div>
          <div class="rounded-2xl border bg-card p-4 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm text-muted-foreground">Ready to chat</p>
                <p class="mt-1 text-2xl font-semibold">{{ readyCount }}</p>
              </div>
              <span class="rounded-lg bg-muted p-2 text-muted-foreground"><ng-icon name="lucideCheckCircle2" class="size-4" /></span>
            </div>
            <p class="mt-3 text-xs text-muted-foreground">{{ indexingCount }} currently indexing</p>
          </div>
          <div class="rounded-2xl border bg-card p-4 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm text-muted-foreground">Indexed chunks</p>
                <p class="mt-1 text-2xl font-semibold">{{ totalChunks.toLocaleString() }}</p>
              </div>
              <span class="rounded-lg bg-muted p-2 text-muted-foreground"><ng-icon name="lucideMessageSquareCode" class="size-4" /></span>
            </div>
            <p class="mt-3 text-xs text-muted-foreground">Searchable code segments</p>
          </div>
          <div class="rounded-2xl border bg-card p-4 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm text-muted-foreground">Needs attention</p>
                <p class="mt-1 text-2xl font-semibold">{{ failedCount }}</p>
              </div>
              <span class="rounded-lg bg-muted p-2 text-muted-foreground">
                <ng-icon [name]="failedCount > 0 ? 'lucideAlertCircle' : 'lucideLoaderCircle'" class="size-4" />
              </span>
            </div>
            <p class="mt-3 text-xs text-muted-foreground">
              {{ failedCount > 0 ? 'Review failed indexing jobs' : 'All repos healthy' }}
            </p>
          </div>
        }
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">Recent repositories</h2>
              <p class="text-sm text-muted-foreground">Jump back into a repo you have indexed recently.</p>
            </div>
            <a routerLink="/dashboard" class="text-sm font-medium text-primary hover:underline">View all</a>
          </div>

          @if (reposQuery.isPending()) {
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              @for (item of repoSkeletons; track item) {
                <div class="h-44 animate-pulse rounded-2xl border bg-muted/40"></div>
              }
            </div>
          } @else if (recentRepos.length > 0) {
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              @for (repo of recentRepos; track repo.id) {
                <app-repo-card [repo]="repo" />
              }
            </div>
          } @else {
            <div class="rounded-2xl border bg-card p-6">
              <h3 class="font-semibold">No repositories yet</h3>
              <p class="mt-1 text-sm text-muted-foreground">Sync your GitHub repositories to start indexing and chatting with your code.</p>
              <a routerLink="/dashboard" class="mt-4 inline-block text-sm font-medium text-primary hover:underline">Go to repositories</a>
            </div>
          }
        </section>

        <section class="space-y-4">
          <div>
            <h2 class="text-lg font-semibold">Workspace status</h2>
            <p class="text-sm text-muted-foreground">A quick snapshot of indexing across your connected repos.</p>
          </div>
          <div class="rounded-2xl border bg-card p-5 shadow-sm">
            @if (reposQuery.isPending()) {
              @for (item of statusSkeletons; track item) {
                <div class="mb-3 h-8 animate-pulse rounded-lg bg-muted/40"></div>
              }
            } @else {
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-3"><span class="text-sm text-muted-foreground">Ready</span><span class="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{{ readyCount }}</span></div>
                <div class="flex items-center justify-between gap-3"><span class="text-sm text-muted-foreground">Indexing</span><span class="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{{ indexingCount }}</span></div>
                <div class="flex items-center justify-between gap-3"><span class="text-sm text-muted-foreground">Pending</span><span class="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{{ pendingCount }}</span></div>
                <div class="flex items-center justify-between gap-3"><span class="text-sm text-muted-foreground">Failed</span><span class="rounded-full px-2.5 py-1 text-xs font-medium" [class.bg-destructive]="failedCount > 0" [class.text-destructive-foreground]="failedCount > 0" [class.bg-secondary]="failedCount === 0" [class.text-secondary-foreground]="failedCount === 0">{{ failedCount }}</span></div>
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
})
export class OverviewDashboardComponent {
  readonly reposQuery = useRepos();
  readonly skeletons = [0, 1, 2, 3];
  readonly repoSkeletons = [0, 1];
  readonly statusSkeletons = [0, 1, 2, 3];

  get repos(): Repository[] {
    return this.reposQuery.data() ?? [];
  }

  get readyCount(): number {
    return this.repos.filter((repo) => repo.indexStatus === 'READY').length;
  }

  get indexingCount(): number {
    return this.repos.filter((repo) => repo.indexStatus === 'INDEXING').length;
  }

  get pendingCount(): number {
    return this.repos.filter((repo) => repo.indexStatus === 'PENDING').length;
  }

  get failedCount(): number {
    return this.repos.filter((repo) => repo.indexStatus === 'FAILED').length;
  }

  get totalChunks(): number {
    return this.repos.reduce((total, repo) => total + repo.chunkCount, 0);
  }

  get recentRepos(): Repository[] {
    return [...this.repos]
      .sort((a, b) => {
        const aTime = a.indexedAt ? new Date(a.indexedAt).getTime() : 0;
        const bTime = b.indexedAt ? new Date(b.indexedAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 3);
  }
}
