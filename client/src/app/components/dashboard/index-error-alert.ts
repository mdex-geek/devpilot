import { Component, computed, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertCircle, lucideChevronDown } from '@ng-icons/lucide';
import { HlmAlert } from '@spartan-ng/helm/alert';

const SUMMARY_LIMIT = 100;

function getErrorSummary(message: string): string {
  const firstLine = message.split('\n').find((line) => line.trim())?.trim() ?? message;
  if (firstLine.length <= SUMMARY_LIMIT) return firstLine;
  return `${firstLine.slice(0, SUMMARY_LIMIT - 1)}…`;
}

@Component({
  selector: 'app-index-error-alert',
  standalone: true,
  imports: [NgIcon, HlmAlert],
  providers: [provideIcons({ lucideAlertCircle, lucideChevronDown })],
  template: `
    <hlm-alert
      variant="destructive"
      class="border-dashed border-destructive/30 bg-destructive/5 px-3 py-2.5"
    >
      <ng-icon name="lucideAlertCircle" class="size-4" hlmAlertIcon />
      <div hlm-alert-title class="text-xs font-semibold">Indexing failed</div>
      <div hlm-alert-description class="text-xs text-destructive/90">
        @if (!isExpandable()) {
          <p class="wrap-break-word leading-relaxed">{{ message() }}</p>
        } @else {
          @if (!open()) {
            <p class="wrap-break-word leading-relaxed">{{ summary() }}</p>
          }

          <button
            type="button"
            class="inline-flex items-center gap-1 font-medium text-destructive hover:underline"
            [class.mt-1.5]="!open()"
            [class.mt-0]="open()"
            [attr.aria-expanded]="open()"
            (click)="toggleDetails()"
          >
            {{ open() ? 'Hide details' : 'Show details' }}
            <ng-icon
              name="lucideChevronDown"
              class="size-3 transition-transform"
              [class.rotate-180]="open()"
            />
          </button>

          @if (open()) {
            <div
              class="mt-2 max-h-28 overflow-y-auto rounded-md border border-destructive/20 bg-destructive/10 p-2.5"
            >
              <p class="wrap-break-word whitespace-pre-wrap leading-relaxed">
                {{ message() }}
              </p>
            </div>
          }
        }
      </div>
    </hlm-alert>
  `,
})
export class IndexErrorAlertComponent {
  readonly message = input.required<string>();
  readonly open = signal(false);
  readonly summary = computed(() => getErrorSummary(this.message()));
  readonly isExpandable = computed(
    () => this.message().trim().length > this.summary().length,
  );

  toggleDetails(): void {
    this.open.update((isOpen) => !isOpen);
  }
}
