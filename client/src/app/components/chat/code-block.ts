import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCopy } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { bundledLanguages, codeToHtml } from 'shiki';

async function highlight(code: string, lang: string): Promise<string> {
  const safeLang = lang in bundledLanguages ? lang : 'text';
  return codeToHtml(code, {
    lang: safeLang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false, // colors come from CSS variables, see the .css file
  });
}

@Component({
  selector: 'app-code-block',
  encapsulation: ViewEncapsulation.None,
  styleUrl: './code-block.css',
  imports: [NgIcon, HlmButtonImports],
  providers: [provideIcons({ lucideCopy, lucideCheck })],
  template: `
      <div class="code-block group relative my-3 overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm">
      <div
        class="flex items-center justify-between border-b border-border px-3 py-1.5 text-xs text-muted-foreground"
      >
        <span class="font-mono uppercase tracking-wide">{{ lang() }}</span>
        <button
          hlmBtn
          type="button"
          variant="ghost"
          size="icon"
          class="size-7"
          [attr.aria-label]="copyError() ? 'Copy failed' : copied() ? 'Copied' : 'Copy code'"
          [attr.title]="copyError() ? 'Copy failed' : copied() ? 'Copied' : 'Copy code'"
          (click)="copy()"
        >
          <ng-icon hlm size="sm" [name]="copied() ? 'lucideCheck' : 'lucideCopy'" />
        </button>
      </div>

      @if (html(); as h) {
        <div class="shiki-wrap overflow-x-auto px-4 py-3 text-[13px]" [innerHTML]="h"></div>
      } @else {
        <pre class="overflow-x-auto px-4 py-3 text-[13px]"><code>{{ code() }}</code></pre>
      }
      @if (copyError()) {
        <span class="sr-only" aria-live="polite">Could not copy code. Select and copy it manually.</span>
      }
    </div>
  `,
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly lang = input('text');
  readonly streaming = input(false);

  protected readonly html = signal<SafeHtml | null>(null);
  protected readonly copied = signal(false);
  protected readonly copyError = signal(false);

  private readonly sanitizer = inject(DomSanitizer);
  private copyTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Re-highlight whenever the code changes (e.g. while streaming).
    effect((onCleanup) => {
      const code = this.code();
      const lang = this.lang();
      let stale = false;
      onCleanup(() => (stale = true));

      highlight(code, lang)
        .then((out) => {
          // Shiki output is generated from escaped source, so it is safe to trust.
          if (!stale) this.html.set(this.sanitizer.bypassSecurityTrustHtml(out));
        })
        .catch(() => {
          if (!stale) this.html.set(null); // fall back to plain <pre>
        });
    });

    inject(DestroyRef).onDestroy(() => clearTimeout(this.copyTimer));
  }

  protected async copy(): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(this.code());
        } catch {
          this.copyWithSelection();
        }
      } else {
        this.copyWithSelection();
      }
      this.copied.set(true);
      this.copyError.set(false);
      clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => this.copied.set(false), 1800);
    } catch {
      this.copied.set(false);
      this.copyError.set(true);
      clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => this.copyError.set(false), 2500);
    }
  }

  private copyWithSelection(): void {
    const textarea = document.createElement('textarea');
    textarea.value = this.code();
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Clipboard access is unavailable');
  }
}
