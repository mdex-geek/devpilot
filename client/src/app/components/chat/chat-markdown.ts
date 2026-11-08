import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { marked, type Token, type Tokens } from 'marked';
import { CodeBlockComponent } from './code-block';
import { hlm } from '@spartan-ng/helm/utils';

type Block = { kind: 'html'; html: string } | { kind: 'code'; lang: string; text: string };

@Component({
  selector: 'app-chat-markdown',
  imports: [CodeBlockComponent],
  encapsulation: ViewEncapsulation.None, // rendered HTML is not scoped
  styleUrl: './chat-markdown.css',
  host: {
    '[class]': 'hostClass()',
    '[attr.data-streaming]': 'isStreaming() ? "" : null',
  },
  template: `
    @for (block of blocks(); track $index) {
      @if (block.kind === 'code') {
        <app-code-block
          [code]="block.text"
          [lang]="block.lang"
          [streaming]="isStreaming() && $last"
        />
      } @else {
        <div class="md-block" [innerHTML]="block.html"></div>
      }
    }
  `,
})
export class ChatMarkdownComponent {
  readonly content = input.required<string>();
  readonly isStreaming = input(false);
  readonly className = input<string>('');

  protected readonly hostClass = computed(() =>
    hlm('chat-markdown block max-w-none text-sm leading-relaxed', this.className()),
  );

  protected readonly blocks = computed<Block[]>(() => {
    const tokens = marked.lexer(this.content(), { gfm: true, breaks: false });
    const result: Block[] = [];

    for (const token of tokens) {
      if (token.type === 'space') continue;

      if (token.type === 'code') {
        const code = token as Tokens.Code;
        // "ts title=foo" -> "ts"
        const lang = (code.lang ?? '').trim().split(/\s+/)[0] || 'text';
        result.push({ kind: 'code', lang, text: code.text });
        continue;
      }

      const html = marked.parser([token] as Token[] & { links: Record<string, never> });
      result.push({ kind: 'html', html });
    }

    return result;
  });
}
