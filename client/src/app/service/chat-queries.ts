import { DestroyRef, inject, signal, type Signal } from '@angular/core';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { queryKeys } from '../../lib/query-keys';
import { ChatMessage } from '../api';
import { ApiService } from './api-service';
import { toast } from '@spartan-ng/brain/sonner';
import { firstValueFrom } from 'rxjs';
import { streamChatMessage } from './stream-chat';

export function injectChatSessions(
  repositoryId: Signal<string>,
  enabled: Signal<boolean> = signal(true),
) {
  const api = inject(ApiService);
  return injectQuery(() => ({
    queryKey: queryKeys.chat.sessions(repositoryId()),
    queryFn: () => firstValueFrom(api.listSessions(repositoryId())),
    enabled: Boolean(repositoryId()) && enabled(),
  }));
}

export function injectChatMessages(sessionId: Signal<string | null>) {
  const api = inject(ApiService);
  return injectQuery(() => ({
    queryKey: queryKeys.chat.messages(sessionId() ?? ''),
    queryFn: () => firstValueFrom(api.getMessages(sessionId()!)),
    enabled: Boolean(sessionId()),
  }));
}

export function injectCreateChatSession(repositoryId: Signal<string>) {
  const queryClient = inject(QueryClient);
  const api = inject(ApiService);
  return injectMutation(() => ({
    mutationFn: (title?: string) => firstValueFrom(api.createSession(repositoryId(), title)),
    onSuccess: (session) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chat.sessions(repositoryId()),
      });
      queryClient.setQueryData(queryKeys.chat.messages(session.id), []);
    },
    onError: (error: Error) => {
      toast.error('Could not create chat', { description: error.message });
    },
  }));
}

export function injectStreamChat(sessionId: Signal<string | null>) {
  const queryClient = inject(QueryClient);

  const streaming = signal(false);
  const streamText = signal('');
  let abort: AbortController | null = null;

  // Cancel any in-flight stream when the component/service is destroyed.
  inject(DestroyRef).onDestroy(() => abort?.abort());

  async function send(content: string): Promise<void> {
    const id = sessionId();
    const text = content.trim();
    if (!id || !text || streaming()) return;

    abort?.abort();
    const controller = new AbortController();
    abort = controller;

    const optimisticId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      role: 'USER',
      content: text,
      citations: [],
      createdAt: new Date().toISOString(),
    };

    const key = queryKeys.chat.messages(id);

    queryClient.setQueryData<ChatMessage[]>(key, (prev) => [...(prev ?? []), optimistic]);

    streaming.set(true);
    streamText.set('');

    try {
      await streamChatMessage(id, text, {
        signal: controller.signal,
        onUserMessage: (message: ChatMessage) => {
          queryClient.setQueryData<ChatMessage[]>(key, (prev) => [
            ...(prev ?? []).filter((m) => m.id !== optimisticId),
            message,
          ]);
        },
        onToken: (token: string) => {
          streamText.update((prev) => prev + token);
        },
        onAssistantMessage: (message: ChatMessage) => {
          queryClient.setQueryData<ChatMessage[]>(key, (prev) => [...(prev ?? []), message]);
          streamText.set('');
        },
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;

      toast.error('Message failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
      queryClient.setQueryData<ChatMessage[]>(key, (prev) =>
        (prev ?? []).filter((m) => m.id !== optimisticId),
      );
      streamText.set('');
    } finally {
      streaming.set(false);
    }
  }

  function stop(): void {
    abort?.abort();
    streaming.set(false);
  }

  return {
    send,
    stop,
    streaming: streaming.asReadonly(),
    streamText: streamText.asReadonly(),
  };
}
