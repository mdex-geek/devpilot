import { Component, computed, effect, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { AppShellComponent } from '../app-shell';
import { Repository } from '../../api';
import { useRepository, useIndexStatus } from '../../service/repository-queries';
import { IndexingStateComponent } from './indexing-state';
import { ChatSidebarComponent } from './chat-sidebar';
import { ChatMessagesComponent } from './chat-messages';
import { ChatComposerComponent } from './composer';
import {
  injectChatMessages,
  injectChatSessions,
  injectCreateChatSession,
  injectStreamChat,
} from '../../service/chat-queries';

@Component({
  selector: 'app-chat-view',
  standalone: true,
  imports: [
    RouterLink,
    NgIcon,
    HlmButton,
    HlmSkeleton,
    AppShellComponent,
    ChatSidebarComponent,
    ChatMessagesComponent,
    ChatComposerComponent,
    IndexingStateComponent,
  ],
  providers: [provideIcons({ lucideArrowLeft })],
  template: `
    @if (repoQuery.isPending()) {
      <app-shell title="Loading chat…">
        <div class="grid flex-1 gap-4 p-4 md:grid-cols-[18rem_1fr]">
          <hlm-skeleton class="min-h-80 rounded-2xl" />
          <hlm-skeleton class="min-h-80 rounded-2xl" />
        </div>
      </app-shell>
    } @else if (repoQuery.isError() || !repoQuery.data()) {
      <app-shell title="Repository unavailable">
        <div class="flex flex-1 flex-col items-center justify-center gap-3 p-8">
          <p class="text-sm text-muted-foreground">
            {{ errorMessage() }}
          </p>
          <a routerLink="/dashboard" hlmBtn>Back to dashboard</a>
        </div>
      </app-shell>
    } @else {
      <app-shell
        [title]="repo()!.fullName"
        [description]="
          ready() ? 'Ask questions grounded in this repository' : 'Waiting for indexing to finish'
        "
      >
        <a shellActions routerLink="/dashboard" hlmBtn variant="outline" size="sm">
          <ng-icon name="lucideArrowLeft" class="mr-1 size-4" />
          Repos
        </a>

        <div class="flex min-h-0 flex-1 flex-col md:flex-row">
          <app-chat-sidebar
            [repo]="sidebarRepo()!"
            [sessionId]="sessionId()"
            (selectSession)="selectedSessionId.set($event)"
          />

          <section class="flex min-h-[70vh] min-w-0 flex-1 flex-col">
            @if (!ready()) {
              <app-indexing-state [repo]="repo()!" [status]="statusQuery.data()" />
            } @else {
              <app-chat-messages
                [repo]="repo()!"
                [messages]="messagesQuery.data() ?? []"
                [streamText]="stream.streamText()"
                [isLoading]="messagesQuery.isPending()"
              />
              <app-chat-composer
                [disabled]="!sessionId()"
                [streaming]="stream.streaming()"
                (send)="stream.send($event)"
                (stop)="stream.stop()"
              />
            }
          </section>
        </div>
      </app-shell>
    }
  `,
})
export class ChatViewComponent {
  // Not `input.required`: the query helpers read it while the component is
  // being constructed, before Angular has bound any inputs (NG0950).
  readonly repoId = input<string>('');

  readonly selectedSessionId = signal<string | null>(null);
  private autoCreateDone = false;

  // ---- Repository + indexing status ----
  readonly repoQuery = useRepository(() => this.repoId());
  readonly statusQuery = useIndexStatus(
    () => this.repoId(),
    () => {
      const s = this.repoQuery.data()?.indexStatus;
      return s === 'INDEXING' || s === 'PENDING';
    },
  );

  readonly ready = computed(() => {
    const status = this.statusQuery.data()?.indexStatus ?? this.repoQuery.data()?.indexStatus;
    return status === 'READY';
  });

  // ---- Chat sessions ----
  readonly sessionsQuery = injectChatSessions(this.repoId, this.ready);
  readonly createSession = injectCreateChatSession(this.repoId);
  readonly sessions = computed(() => this.sessionsQuery.data() ?? []);

  readonly sessionId = computed(() => this.selectedSessionId() ?? this.sessions()[0]?.id ?? null);

  // ---- Messages + streaming ----
  readonly messagesQuery = injectChatMessages(this.sessionId);
  readonly stream = injectStreamChat(this.sessionId);

  // ---- Derived view data ----
  readonly repo = computed(() => this.repoQuery.data() ?? null);

  readonly sidebarRepo = computed((): Repository | null => {
    const r = this.repo();
    if (!r) return null;
    const st = this.statusQuery.data();
    return {
      ...r,
      indexStatus: st?.indexStatus ?? r.indexStatus,
      filesProcessed: st?.filesProcessed ?? r.filesProcessed,
      filesTotal: st?.filesTotal ?? r.filesTotal,
      chunkCount: st?.chunkCount ?? r.chunkCount,
      errorMessage: st?.errorMessage ?? r.errorMessage,
    };
  });

  readonly errorMessage = computed(
    () => (this.repoQuery.error() as Error | null)?.message ?? 'Repository not found',
  );

  constructor() {
    // Reset per-repo state if this instance is reused for a different repo.
    effect(() => {
      this.repoId();
      untracked(() => {
        this.selectedSessionId.set(null);
        this.autoCreateDone = false;
      });
    });

    // Auto-create the first session when the repo is ready and the list is empty.
    effect(() => {
      if (!this.ready() || !this.sessionsQuery.isSuccess()) return;
      if (this.sessions().length > 0) return;

      untracked(() => {
        if (this.autoCreateDone) return;
        this.autoCreateDone = true;

        this.createSession.mutate(undefined, {
          onSuccess: (session) => this.selectedSessionId.set(session.id),
          onError: () => (this.autoCreateDone = false),
        });
      });
    });
  }
}
