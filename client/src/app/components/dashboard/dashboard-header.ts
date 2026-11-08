import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideRefreshCw, lucideSearch } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSidebarTrigger } from '@spartan-ng/helm/sidebar';
import { IndexStatus } from '../../api';
import { ModeToggleComponent } from '../mode-toggle';

export type FilterStatus = 'ALL' | IndexStatus;
export type RepositoryVisibility = 'all' | 'public' | 'private';

type FilterOption<T extends string> = {
  value: T;
  label: string;
};

@Component({
  selector: 'app-dashboard-header',
  imports: [NgIcon, HlmButton, HlmInput, HlmSeparator, HlmSidebarTrigger, ModeToggleComponent],
  providers: [provideIcons({ lucideRefreshCw, lucideSearch })],
  template: `
    <div class="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-xl">
      <div class="flex flex-col gap-4 px-4 py-4 md:px-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex min-w-0 items-start gap-3">
            <button hlmSidebarTrigger class="-ml-1 mt-0.5"></button>
            <div class="min-w-0">
              <h1 class="text-xl font-semibold tracking-tight">Repositories</h1>
              <p class="text-sm text-muted-foreground">
                @if (totalCount() !== undefined) {
                  {{ totalCount() }} connected · {{ readyCount() ?? 0 }} ready
                } @else {
                  Sync and index a repo to start chatting
                }
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div class="relative min-w-55 flex-1 sm:min-w-70">
              <ng-icon
                name="lucideSearch"
                class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                hlmInput
                [value]="search()"
                (input)="searchChange.emit(getInputValue($event))"
                placeholder="Search repositories…"
                class="border-dashed bg-background pl-9 shadow-sm"
              />
            </div>
            <div class="flex items-center gap-2">
              <button
                hlmBtn
                variant="outline"
                class="border-dashed shadow-sm"
                [disabled]="isSyncing()"
                (click)="sync.emit()"
              >
                <ng-icon
                  name="lucideRefreshCw"
                  class="mr-2 size-4"
                  [class.animate-spin]="isSyncing()"
                />
                Sync
              </button>
              <app-mode-toggle />
            </div>
          </div>
        </div>

        <hlm-separator class="opacity-60" />

        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <span class="mr-1 text-xs font-medium text-muted-foreground">Visibility</span>
            @for (filter of visibilityFilters; track filter.value) {
              <button
                type="button"
                class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                [class.border-foreground/20]="visibility() === filter.value"
                [class.bg-foreground]="visibility() === filter.value"
                [class.text-background]="visibility() === filter.value"
                [class.shadow-sm]="visibility() === filter.value"
                [class.border-dashed]="visibility() !== filter.value"
                [class.bg-background]="visibility() !== filter.value"
                [class.text-muted-foreground]="visibility() !== filter.value"
                (click)="visibilityChange.emit(filter.value)"
              >
                {{ filter.label }}
              </button>
            }
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="mr-1 text-xs font-medium text-muted-foreground">Status</span>
            @for (filter of statusFilters; track filter.value) {
              <button
                type="button"
                class="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                [class.border-foreground/20]="status() === filter.value"
                [class.bg-foreground]="status() === filter.value"
                [class.text-background]="status() === filter.value"
                [class.shadow-sm]="status() === filter.value"
                [class.border-dashed]="status() !== filter.value"
                [class.bg-background]="status() !== filter.value"
                [class.text-muted-foreground]="status() !== filter.value"
                (click)="statusChange.emit(filter.value)"
              >
                {{ filter.label }}
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardHeaderComponent {
  readonly search = input('');
  readonly visibility = input<RepositoryVisibility>('all');
  readonly status = input<FilterStatus>('ALL');
  readonly totalCount = input<number>();
  readonly readyCount = input<number>();
  readonly isSyncing = input(false);

  readonly searchChange = output<string>();
  readonly visibilityChange = output<RepositoryVisibility>();
  readonly statusChange = output<FilterStatus>();
  readonly sync = output<void>();

  readonly visibilityFilters: FilterOption<RepositoryVisibility>[] = [
    { value: 'all', label: 'All' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
  ];

  readonly statusFilters: FilterOption<FilterStatus>[] = [
    { value: 'ALL', label: 'All' },
    { value: 'READY', label: 'Ready' },
    { value: 'INDEXING', label: 'Indexing' },
    { value: 'PENDING', label: 'New' },
    { value: 'FAILED', label: 'Failed' },
  ];

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
