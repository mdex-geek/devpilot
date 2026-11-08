import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ChatViewComponent } from '../../components/chat/chat-view';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [ChatViewComponent],
  template: `
    @if (repoId(); as id) {
      <app-chat-view [repoId]="id" />
    }
  `,
})
export class Chat {
  private route = inject(ActivatedRoute);

  /** /chat/:repoId or /chat/:id — match your route param name */
  repoId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? p.get('repoId') ?? '')), {
    initialValue: '',
  });
}
