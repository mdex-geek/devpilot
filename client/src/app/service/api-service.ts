import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ChatMessage,
  ChatSession,
  IndexStatusResponse,
  Repository,
  User,
  getApiBaseUrl,
} from '../api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = getApiBaseUrl();

  /** Shared options for session-cookie requests */
  private readonly creds = { withCredentials: true as const };

  // ── Auth ──────────────────────────────────────────────

  me(): Observable<User> {
    return this.http.get<User>(this.url('/api/auth/me'), this.creds);
  }

  logout(): Observable<void> {
    return this.http.post<void>(this.url('/api/auth/logout'), null, this.creds);
  }

  // ── Repositories ──────────────────────────────────────

  listRepos(refresh = true): Observable<Repository[]> {
    const params = new HttpParams().set('refresh', String(refresh));
    return this.http.get<Repository[]>(this.url('/api/repos'), {
      ...this.creds,
      params,
    });
  }

  getRepo(id: string): Observable<Repository> {
    return this.http.get<Repository>(this.url(`/api/repos/${encodeURIComponent(id)}`), this.creds);
  }

  startIndex(id: string): Observable<Repository> {
    return this.http.post<Repository>(
      this.url(`/api/repos/${encodeURIComponent(id)}/index`),
      null,
      this.creds,
    );
  }

  indexStatus(id: string): Observable<IndexStatusResponse> {
    return this.http.get<IndexStatusResponse>(
      this.url(`/api/repos/${encodeURIComponent(id)}/status`),
      this.creds,
    );
  }

  // ── Chat ──────────────────────────────────────────────

  createSession(repositoryId: string, title?: string): Observable<ChatSession> {
    return this.http.post<ChatSession>(
      this.url('/api/chat/sessions'),
      { repositoryId, ...(title != null ? { title } : {}) },
      this.creds,
    );
  }

  listSessions(repositoryId: string): Observable<ChatSession[]> {
    const params = new HttpParams().set('repositoryId', repositoryId);
    return this.http.get<ChatSession[]>(this.url('/api/chat/sessions'), {
      ...this.creds,
      params,
    });
  }

  getMessages(sessionId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      this.url(`/api/chat/sessions/${encodeURIComponent(sessionId)}`),
      this.creds,
    );
  }

  // ── helpers ───────────────────────────────────────────

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
