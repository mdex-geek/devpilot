import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSendHorizontal, lucideSquare } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { HlmKbd } from '@spartan-ng/helm/kbd';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTextarea } from '@spartan-ng/helm/textarea';

/**
 * Angular port of the React <ChatComposer />.
 *
 * Usage:
 *   <app-chat-composer
 *     [disabled]="sending()"
 *     [streaming]="streaming()"
 *     (send)="onSend($event)"
 *     (stop)="onStop()"
 *   />
 */
@Component({
  selector: 'app-chat-composer',
  imports: [NgIcon, HlmButtonImports, HlmKbd, HlmSpinner, HlmTextarea],
  providers: [provideIcons({ lucideSendHorizontal, lucideSquare })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="border-t bg-background/95 p-3 backdrop-blur sm:p-4">
      <div class="mx-auto max-w-4xl space-y-2">
        <div class="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
          <textarea
            hlmTextarea
            class="max-h-48 min-h-12 flex-1 resize-y border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0"
            placeholder="Ask about architecture, files, flows…"
            [value]="value()"
            [disabled]="disabled()"
            (input)="onInput($event)"
            (keydown.enter)="onEnter($event)"
          ></textarea>

          @if (streaming()) {
            <button
              hlmBtn
              type="button"
              size="icon-lg"
              variant="secondary"
              class="shrink-0"
              aria-label="Stop generating"
              (click)="stop.emit()"
            >
              <ng-icon hlm size="sm" name="lucideSquare" />
            </button>
          } @else {
            <button
              hlmBtn
              type="button"
              size="icon-lg"
              class="shrink-0"
              aria-label="Send message"
              [disabled]="sendDisabled()"
              (click)="submit()"
            >
              @if (disabled()) {
                <hlm-spinner />
              } @else {
                <ng-icon hlm size="sm" name="lucideSendHorizontal" />
              }
            </button>
          }
        </div>

        <p class="px-1 text-xs text-muted-foreground">
          Press <kbd hlmKbd>Enter</kbd> to send · <kbd hlmKbd>Shift</kbd> +
          <kbd hlmKbd>Enter</kbd> for a new line
        </p>
      </div>
    </div>
  `,
})
export class ChatComposerComponent {
  readonly disabled = input(false);
  readonly streaming = input(false);

  readonly send = output<string>();
  readonly stop = output<void>();

  protected readonly value = signal('');
  protected readonly sendDisabled = computed(() => this.disabled() || !this.value().trim());

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLTextAreaElement).value);
  }

  protected onEnter(event: Event): void {
    const e = event as KeyboardEvent;
    if (e.shiftKey) return; // Shift+Enter inserts a new line
    e.preventDefault();
    this.submit();
  }

  protected submit(): void {
    const content = this.value().trim();
    if (!content || this.disabled() || this.streaming()) return;
    this.value.set('');
    this.send.emit(content);
  }
}
