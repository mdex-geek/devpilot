import { Component, input } from '@angular/core';
import { IndexStatus, Repository } from '../../api';
import { HlmBadge } from '@spartan-ng/helm/badge';

export function indexStatusLabel(status: IndexStatus): string {
  switch (status) {
    case 'READY':
      return 'Ready';
    case 'INDEXING':
      return 'Indexing';
    case 'FAILED':
      return 'Failed';
    default:
      return 'Not indexed';
  }
}

export function languageColor(language: string | null): string {
  const colors: Record<string, string> = {
    TypeScript: 'bg-sky-500',
    JavaScript: 'bg-amber-400',
    Java: 'bg-orange-500',
    Python: 'bg-emerald-500',
    Go: 'bg-cyan-500',
    Rust: 'bg-orange-700',
    Kotlin: 'bg-violet-500',
  };
  return colors[language ?? ''] ?? 'bg-muted-foreground';
}

@Component({
  selector: 'app-index-status-badge',
  standalone: true,
  imports: [HlmBadge],
  template: `
    <span hlmBadge [variant]="variant" [class]="className()">
      @if (status() === 'INDEXING') {
        <span class="mr-1 size-1.5 animate-pulse rounded-full bg-current"></span>
      }
      {{ indexStatusLabel(status()) }}
    </span>
  `,
})
export class IndexStatusBadgeComponent {
  readonly status = input.required<IndexStatus>();
  readonly className = input('');

  get variant(): 'default' | 'destructive' | 'secondary' | 'outline' {
    switch (this.status()) {
      case 'READY':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'INDEXING':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  readonly indexStatusLabel = indexStatusLabel;
}

@Component({
  selector: 'app-repo-meta',
  standalone: true,
  template: `
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      @if (repo().language) {
        <span class="inline-flex items-center gap-1.5">
          <span class="size-2 rounded-full" [class]="languageColor(repo().language)"></span>
          {{ repo().language }}
        </span>
      }
      <span>{{ repo().defaultBranch }}</span>
      @if (repo().chunkCount > 0) {
        <span>{{ repo().chunkCount.toLocaleString() }} chunks</span>
      }
    </div>
  `,
})
export class RepoMetaComponent {
  readonly repo = input.required<Repository>();
  readonly languageColor = languageColor;
}
