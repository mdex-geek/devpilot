import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideExternalLink } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { Repository, Citation } from '../../api';

export function citationHref(repo: Repository, citation: Citation): string {
  const line =
    citation.startLine != null
      ? `#L${citation.startLine}${
          citation.endLine != null && citation.endLine !== citation.startLine
            ? `-L${citation.endLine}`
            : ''
        }`
      : '';
  return `https://github.com/${repo.fullName}/blob/${repo.defaultBranch}/${citation.filePath}${line}`;
}

@Component({
  selector: 'app-citation-chips',
  standalone: true,
  imports: [NgIcon, HlmBadge],
  providers: [provideIcons({ lucideExternalLink })],
  template: `
    @if (citations().length) {
      <div class="flex flex-wrap gap-1.5 pt-1">
        @for (citation of citations(); track trackKey(citation, $index)) {
          <a
            hlmBadge
            variant="outline"
            class="max-w-full gap-1 font-normal"
            [href]="href(citation)"
            target="_blank"
            rel="noreferrer"
          >
            <span class="truncate">
              {{ citation.filePath }}
              @if (citation.startLine != null) {
                :{{ citation.startLine }}
              }
            </span>
            <ng-icon name="lucideExternalLink" class="size-3 opacity-60" />
          </a>
        }
      </div>
    }
  `,
})
export class CitationChipsComponent {
  repo = input.required<Repository>();
  citations = input.required<Citation[]>();

  href(citation: Citation): string {
    return citationHref(this.repo(), citation);
  }

  trackKey(citation: Citation, index: number): string {
    return `${citation.filePath}-${index}`;
  }
}
