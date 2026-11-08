import { Component, ElementRef, effect, input, viewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBot, lucideUserRound } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { Repository, ChatMessage } from '../../api';
import { CitationChipsComponent } from './citation-chips';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { ChatMarkdownComponent } from './chat-markdown';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [
    NgClass,
    NgIcon,
    ...HlmAvatarImports,
    HlmSkeleton,
    ChatMarkdownComponent,
    CitationChipsComponent,
  ],
  providers: [provideIcons({ lucideBot, lucideUserRound })],
  template: `
    @if (isLoading()) {
      <div class="flex flex-1 flex-col gap-4 p-6">
        <hlm-skeleton class="h-16 w-2/3 rounded-3xl" />
        <hlm-skeleton class="ml-auto h-12 w-1/2 rounded-3xl" />
        <hlm-skeleton class="h-24 w-3/4 rounded-3xl" />
      </div>
    } @else {
      <div class="min-h-0 flex-1 overflow-y-auto scroll-smooth">
        <div class="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6">
          @if (messages().length === 0 && !streamText()) {
            <div class="mx-auto my-auto w-full max-w-xl rounded-2xl border border-dashed bg-card px-6 py-10 text-center shadow-sm sm:py-12">
              <div class="mx-auto mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ng-icon name="lucideBot" class="size-5" />
              </div>
              <p class="font-medium">Ask anything about this codebase</p>
              <p class="mt-1 text-sm text-muted-foreground">
                Try “Where is authentication handled?” or “Explain the repository indexing flow.”
              </p>
            </div>
          }

          @for (message of messages(); track message.id) {
            <div class="flex w-full items-start gap-3" [ngClass]="message.role === 'USER' ? 'flex-row-reverse' : ''">
              <hlm-avatar class="mt-0.5 size-8 shrink-0">
                <span
                  hlmAvatarFallback
                  [ngClass]="
                    message.role === 'USER' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  "
                >
                  @if (message.role === 'USER') {
                    <ng-icon name="lucideUserRound" class="size-4" />
                  } @else {
                    <ng-icon name="lucideBot" class="size-4" />
                  }
                </span>
              </hlm-avatar>

              <div
                class="flex min-w-0 flex-col gap-1.5"
                [ngClass]="message.role === 'USER' ? 'max-w-[min(88%,44rem)] items-end' : 'w-full max-w-3xl items-start'"
              >
                <div
                  class="min-w-0 break-words rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  [ngClass]="
                    message.role === 'USER'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'w-full border border-border/60 bg-card shadow-sm'
                  "
                >
                  @if (message.role === 'USER') {
                    <span class="whitespace-pre-wrap">{{ message.content }}</span>
                  } @else {
                    <app-chat-markdown [content]="message.content" />
                  }
                </div>

                @if (message.role === 'ASSISTANT' && message.citations?.length) {
                  <app-citation-chips [repo]="repo()" [citations]="message.citations" />
                }
              </div>
            </div>
          }

          @if (streamText()) {
            <div class="flex w-full items-start gap-3">
              <hlm-avatar class="mt-0.5 size-8 shrink-0">
                <span hlmAvatarFallback class="bg-muted">
                  <ng-icon name="lucideBot" class="size-4" />
                </span>
              </hlm-avatar>
              <div class="min-w-0 w-full max-w-3xl rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm shadow-sm">
                <app-chat-markdown [content]="streamText()!" [isStreaming]="true" />
                <span
                  class="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-foreground/50 align-middle"
                ></span>
              </div>
            </div>
          }

          <div #bottom></div>
        </div>
      </div>
    }
  `,
})
export class ChatMessagesComponent {
  repo = input.required<Repository>();
  messages = input.required<ChatMessage[]>();
  streamText = input<string | undefined>(undefined);
  isLoading = input(false);

  bottom = viewChild<ElementRef<HTMLDivElement>>('bottom');

  constructor() {
    effect(() => {
      // depend on messages + stream so we scroll when they change
      this.messages();
      this.streamText();
      queueMicrotask(() => {
        this.bottom()?.nativeElement?.scrollIntoView?.({ behavior: 'smooth' });
      });
    });
  }
}
