import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';

import { HlmSpinner } from '@spartan-ng/helm/spinner';

import { useCurrentUser } from '../../../service/auth-queries';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [HlmSpinner],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center gap-3">
      <hlm-spinner class="size-6" />
      <p class="text-sm text-muted-foreground">Finishing GitHub sign-in…</p>
    </div>
  `,
})
export class AuthCallbackComponent {
  private router = inject(Router);
  readonly userQuery = useCurrentUser();

  constructor() {
    effect(() => {
      // Wait until the query is no longer pending
      if (this.userQuery.isPending()) return;

      if (this.userQuery.isError()) {
        this.router.navigateByUrl('/login?error=connection', { replaceUrl: true });
        return;
      }

      const user = this.userQuery.data();

      if (user) {
        this.router.navigateByUrl('/dashboard', {
          replaceUrl: true,
        });
      } else {
        this.router.navigateByUrl('/login?error=session', { replaceUrl: true });
      }
    });
  }
}
