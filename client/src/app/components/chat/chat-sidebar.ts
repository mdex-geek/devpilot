import { Component, input, output, computed } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideRotateCcw } from '@ng-icons/lucide';

import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { IndexStatusBadgeComponent } from '../dashboard/repo-status';
import { Repository } from '../../api';
import { useStartIndexing } from '../../service/repository-queries';
import { injectChatSessions, injectCreateChatSession } from '../../service/chat-queries';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    NgIcon,
    HlmButton,
    HlmSeparator,
    HlmSkeletonImports,
    IndexStatusBadgeComponent,
  ],
  providers: [provideIcons({ lucidePlus, lucideRotateCcw })],
  template: `
    <aside class="flex w-full flex-col border-b md:w-72 md:border-r md:border-b-0">
      <div class="space-y-3 p-4">
        <div class="space-y-1">
          <p class="truncate text-sm font-medium">{{ repo().fullName }}</p>
          <div class="flex flex-wrap items-center gap-2">
            <app-index-status-badge [status]="repo().indexStatus" />
            @if (repo().isPrivate) {
              <span class="text-xs text-muted-foreground">Private</span>
            }
          </div>
        </div>

        <div class="flex gap-2">
          <button
            hlmBtn
            size="sm"
            class="flex-1"
            [disabled]="!ready() || createSession.isPending()"
            (click)="onNewChat()"
          >
            <ng-icon name="lucidePlus" class="mr-1 size-4" />
            New chat
          </button>
          <button
            hlmBtn
            size="sm"
            variant="outline"
            [disabled]="reindex.isPending() || repo().indexStatus === 'INDEXING'"
            (click)="reindex.mutate(repo().id)"
            aria-label="Re-index repository"
          >
            <ng-icon name="lucideRotateCcw" class="size-4" />
          </button>
        </div>
      </div>

      <hlm-separator />

      <div class="px-4 py-2 text-xs font-medium text-muted-foreground">Sessions</div>

      <div class="flex-1 overflow-y-auto">
        <div class="space-y-1 px-2 pb-4">
          @if (!ready()) {
            <p class="px-2 text-xs text-muted-foreground">
              Sessions unlock after indexing completes.
            </p>
          }

          @if (sessionsQuery.isPending()) {
            @for (i of skeletons; track i) {
              <hlm-skeleton class="h-12 rounded-xl" />
            }
          }

          @if (sessionsQuery.data(); as sessions) {
            @for (session of sessions; track session.id) {
              <button
                type="button"
                class="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted"
                [ngClass]="sessionId() === session.id ? 'bg-muted' : ''"
                (click)="selectSession.emit(session.id)"
              >
                <p class="truncate text-sm font-medium">{{ session.title }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ session.createdAt | date: 'mediumDate' }}
                </p>
              </button>
            }

            @if (ready() && sessionsQuery.isSuccess() && sessions.length === 0) {
              <p class="px-2 text-xs text-muted-foreground">No chats yet. Start one to begin.</p>
            }
          }
        </div>
      </div>
    </aside>
  `,
})
export class ChatSidebarComponent {
  repo = input.required<Repository>();
  sessionId = input<string | null>(null);
  selectSession = output<string>();

  skeletons = [0, 1, 2];

  ready = computed(() => this.repo().indexStatus === 'READY');
  repoId = computed(() => this.repo().id);

  sessionsQuery = injectChatSessions(this.repoId, this.ready);
  createSession = injectCreateChatSession(this.repoId);
  reindex = useStartIndexing();

  onNewChat(): void {
    this.createSession.mutate('New chat', {
      onSuccess: (session) => this.selectSession.emit(session.id),
    });
  }
}
