import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideExternalLink,
  lucideGitBranch,
  lucideLock,
  lucideMessageSquare,
  lucideRotateCcw,
  lucideSparkles,
  lucideLoaderCircle,
} from '@ng-icons/lucide';
import { Repository } from '../../api';
import { getRepoProgress, useStartIndexing } from '../../service/repository-queries';
import { IndexErrorAlertComponent } from './index-error-alert';
import { LanguageBadgeComponent } from './language-badge';
import { LanguageIconComponent } from '../language-icon';
import { IndexStatusBadgeComponent } from './repo-status';

@Component({
  selector: 'app-repo-card',
  standalone: true,
  imports: [
    NgIcon,
    IndexErrorAlertComponent,
    LanguageBadgeComponent,
    LanguageIconComponent,
    IndexStatusBadgeComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideExternalLink,
      lucideGitBranch,
      lucideLock,
      lucideMessageSquare,
      lucideRotateCcw,
      lucideSparkles,
      lucideLoaderCircle,
    }),
  ],
  template: `
    <article
      class="group flex flex-col overflow-hidden rounded-2xl border border-dashed bg-card/80 shadow-md shadow-foreground/5 transition-all"
      [class.border-destructive/30]="isFailed()"
      [class.bg-destructive/2]="isFailed()"
      [class.hover:border-destructive/40]="isFailed()"
      [class.border-border/80]="!isFailed()"
      [class.hover:-translate-y-0.5]="!isFailed()"
      [class.hover:border-foreground/15]="!isFailed()"
      [class.hover:shadow-lg]="!isFailed()"
    >
      <div class="border-b border-dashed border-border/70 p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <app-language-badge [language]="repo().language" [showLabel]="false" />
            <div class="min-w-0">
              <p class="truncate text-xs text-muted-foreground">{{ repo().owner }}</p>
              <h3 class="truncate font-medium">{{ repo().name }}</h3>
            </div>
          </div>
          <app-index-status-badge [status]="repo().indexStatus" />
        </div>
      </div>

      <div class="flex flex-1 flex-col gap-3 p-4">
        @if (!isFailed() || repo().description) {
          <p class="line-clamp-2 text-sm text-muted-foreground" [class.min-h-10]="!isFailed()">
            {{ repo().description || 'No description provided.' }}
          </p>
        }
        <div class="flex flex-wrap items-center gap-2">
          @if (repo().isPrivate) {
            <span
              class="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground"
              ><ng-icon name="lucideLock" class="size-3" />Private</span
            >
          }
          <span
            class="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground"
            ><ng-icon name="lucideGitBranch" class="size-3" />{{ repo().defaultBranch }}</span
          >
          @if (repo().language) {
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2 py-0.5 text-xs"
              ><app-language-icon [language]="repo().language" size="sm" />{{
                repo().language
              }}</span
            >
          }
          @if (repo().chunkCount > 0) {
            <span
              class="rounded-full border border-dashed px-2 py-0.5 text-xs"
              [class.border-destructive/20]="isFailed()"
              [class.text-destructive/80]="isFailed()"
              [class.text-muted-foreground]="!isFailed()"
              >{{ repo().chunkCount.toLocaleString() }} chunks{{
                isFailed() ? ' indexed' : ''
              }}</span
            >
          }
        </div>

        @if (isIndexing()) {
          <div class="space-y-2 rounded-xl border border-dashed bg-muted/30 p-3">
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span>Indexing…</span
              ><span>{{ repo().filesProcessed }}/{{ repo().filesTotal || '?' }}</span>
            </div>
            <div class="h-1 overflow-hidden rounded-md bg-muted">
              <div class="h-full bg-primary transition-all" [style.width.%]="progress() || 8"></div>
            </div>
          </div>
        }
        @if (isFailed() && repo().errorMessage) {
          <app-index-error-alert [message]="repo().errorMessage!" />
        }
      </div>

      <div
        class="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-border/70 p-4"
      >
        @if (repo().htmlUrl) {
          <a
            [href]="repo().htmlUrl"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
            ><ng-icon name="lucideExternalLink" class="size-4" />GitHub</a
          >
        } @else {
          <span></span>
        }
        <div class="flex gap-2">
          @if (repo().indexStatus === 'READY') {
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground"
              (click)="openChat()"
            >
              <ng-icon name="lucideMessageSquare" class="size-4" />Chat
            </button>
          }
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary-foreground"
            [class.bg-primary]="!isFailed()"
            [class.border]="isFailed()"
            [class.border-destructive/30]="isFailed()"
            [class.text-destructive]="isFailed()"
            [disabled]="isIndexing()"
            (click)="handlePrimary()"
          >
            @if (isIndexing()) {
              <ng-icon name="lucideLoaderCircle" class="size-4 animate-spin" />Indexing
            } @else if (repo().indexStatus === 'READY') {
              Open<ng-icon name="lucideArrowRight" class="size-4" />
            } @else if (isFailed()) {
              <ng-icon name="lucideRotateCcw" class="size-4" />Retry
            } @else {
              <ng-icon name="lucideSparkles" class="size-4" />Index
            }
          </button>
        </div>
      </div>
    </article>
  `,
})
export class RepoCardComponent {
  readonly repo = input.required<Repository>();
  private readonly router = inject(Router);
  private readonly indexMutation = useStartIndexing();

  readonly isFailed = computed(() => this.repo().indexStatus === 'FAILED');
  readonly isIndexing = computed(
    () => this.repo().indexStatus === 'INDEXING' || this.indexMutation.isPending(),
  );
  readonly progress = computed(() => getRepoProgress(this.repo()));

  openChat(): void {
    void this.router.navigateByUrl(`/chat/${this.repo().id}`);
  }

  handlePrimary(): void {
    if (this.repo().indexStatus === 'READY') {
      this.openChat();
      return;
    }
    this.indexMutation.mutate(this.repo().id, {
      onSuccess: () => this.openChat(),
    });
  }
}
