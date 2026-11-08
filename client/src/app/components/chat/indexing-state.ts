import { Component, computed, input, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertCircle, lucideLoader2, lucideRotateCcw } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { useStartIndexing, getRepoProgress } from '../../service/repository-queries';
import { Repository, IndexStatusResponse } from '../../api';
@Component({
  selector: 'app-indexing-state',
  standalone: true,
  imports: [NgIcon, HlmButton, ...HlmProgressImports],
  providers: [provideIcons({ lucideAlertCircle, lucideLoader2, lucideRotateCcw })],
  template: `
    @if (indexStatus() === 'FAILED') {
      <div class="flex h-full flex-col items-center justify-center gap-4 border-0 p-6 text-center">
        <div class="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <ng-icon name="lucideAlertCircle" class="size-6 text-destructive" />
        </div>
        <div class="space-y-1">
          <h3 class="font-medium">Indexing failed</h3>
          <p class="max-w-sm text-sm text-muted-foreground">
            {{ errorMessage() || 'Something went wrong while indexing this repository.' }}
          </p>
        </div>
        <button hlmBtn (click)="retry()" [disabled]="startIndex.isPending()">
          <ng-icon name="lucideRotateCcw" class="mr-2 size-4" />
          Retry indexing
        </button>
      </div>
    } @else {
      <div class="flex h-full flex-col items-center justify-center gap-4 border-0 p-6 text-center">
        <div class="flex size-12 items-center justify-center rounded-full bg-muted">
          <ng-icon name="lucideLoader2" class="size-6 animate-spin" />
        </div>
        <div class="space-y-1">
          <h3 class="font-medium">Indexing {{ repo().fullName }}</h3>
          <p class="max-w-sm text-sm text-muted-foreground">
            @if (filesTotal() > 0) {
              {{ filesProcessed() }} of {{ filesTotal() }} files · {{ chunkCount() }} chunks
              embedded
            } @else {
              Fetching repository files and preparing embeddings…
            }
          </p>
        </div>
        <div class="w-full max-w-sm space-y-2">
          <hlm-progress [value]="progressValue()" />
          <p class="text-center text-xs text-muted-foreground">
            You can leave this page open — chat unlocks when indexing finishes.
          </p>
        </div>
      </div>
    }
  `,
})
export class IndexingStateComponent {
  repo = input.required<Repository>();
  status = input<IndexStatusResponse | undefined>(undefined);

  startIndex = useStartIndexing();

  filesProcessed = computed(() => this.status()?.filesProcessed ?? this.repo().filesProcessed);
  filesTotal = computed(() => this.status()?.filesTotal ?? this.repo().filesTotal);
  chunkCount = computed(() => this.status()?.chunkCount ?? this.repo().chunkCount);
  indexStatus = computed(() => this.status()?.indexStatus ?? this.repo().indexStatus);
  errorMessage = computed(() => this.status()?.errorMessage ?? this.repo().errorMessage);

  progress = computed(() =>
    getRepoProgress({
      filesProcessed: this.filesProcessed(),
      filesTotal: this.filesTotal(),
    }),
  );

  /** At least 12% while total still unknown, so the bar isn’t empty */
  progressValue = computed(() =>
    Math.max(this.progress(), this.filesTotal() ? this.progress() : 12),
  );

  retry(): void {
    this.startIndex.mutate(this.repo().id);
  }
}
