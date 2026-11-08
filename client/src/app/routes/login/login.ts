import { Component, inject, OnInit, signal } from '@angular/core';
import { lucideAlertCircle, lucideGithub, lucideLoader } from '@ng-icons/lucide';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { HlmSpinner } from '@spartan-ng/helm/spinner';
import {
  HlmCard,
  HlmCardContent,
  HlmCardDescription,
  HlmCardHeader,
  HlmCardTitle,
} from '@spartan-ng/helm/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmAlert, HlmAlertDescription, HlmAlertTitle } from '@spartan-ng/helm/alert';
import { ModeToggleComponent } from '../../components/mode-toggle';
import { HlmButton } from '@spartan-ng/helm/button';
import { getGithubLoginUrl } from '../../api';
import { ApiService } from '../../service/api-service';
@Component({
  imports: [
    HlmSpinner,
    HlmCard,
    HlmCardHeader,
    NgIcon,
    HlmAlert,
    ModeToggleComponent,
    HlmAlertTitle,
    HlmAlertDescription,
    HlmButton,
    HlmCardTitle,
    HlmCardDescription,
    HlmCardContent,
  ],
  selector: 'app-login',
  styles: ``,
  providers: [provideIcons({ lucideGithub, lucideAlertCircle, lucideLoader })],
  template: `
    @if (isCheckingAuth()) {
      <div class="flex min-h-svh items-center justify-center">
        <hlm-spinner icon="lucideLoader" />
      </div>
    } @else {
      <div class="relative flex min-h-svh flex-col overflow-hidden bg-background">
        <!-- Background gradient -->
        <div
          class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(from_var(--primary)_l_c_h/0.1),transparent_55%)]"
        ></div>

        <!-- Header -->
        <header class="relative z-10 flex h-14 items-center justify-between px-4">
          <!-- <a routerLink="/">
                     <app-brand-mark />
                   </a> -->
          <app-mode-toggle></app-mode-toggle>
        </header>

        <!-- Main -->
        <main class="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
          <hlm-card
            class="w-full max-w-sm border-border/70 bg-card/90 shadow-lg shadow-foreground/5 backdrop-blur-xl"
          >
            <hlm-card-header class="space-y-4 text-center">
              <div
                class="mx-auto flex size-12 items-center justify-center rounded-2xl bg-foreground text-background"
              >
                <ng-icon name="lucideGithub" class="size-6" />
              </div>

              <div class="space-y-1">
                <h3 hlmCardTitle class="text-xl">Sign in</h3>
                <p hlmCardDescription>Connect GitHub to chat with your repositories.</p>
              </div>
            </hlm-card-header>

            <div hlmCardContent class="space-y-4">
              @if (error()) {
                <hlm-alert variant="destructive">
                  <ng-icon name="lucideAlertCircle" />
                  <h4 hlmAlertTitle>Sign-in failed</h4>
                  <div hlmAlertDescription>
                    @if (error() === 'connection') {
                      Could not check your session. Check that the server is available, then try
                      again.
                    } @else {
                      Please try again.
                    }
                  </div>
                </hlm-alert>
              }

              <a
                hlmBtn
                [attr.href]="githubLoginUrl"
                size="lg"
                class="inline-flex w-full items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90"
              >
                <ng-icon name="lucideGithub" class="size-5" />
                Continue with GitHub
              </a>
            </div>
          </hlm-card>
        </main>
      </div>
    }
  `,
})
export class Login implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(ApiService);

  isCheckingAuth = signal(true);
  error = signal<string | null>(null);
  next = '/dashboard';
  githubLoginUrl = getGithubLoginUrl();

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.error.set(params.get('error'));
      const nextParam = params.get('next');
      this.next = nextParam?.startsWith('/') ? nextParam : '/dashboard';
    });

    this.authService.me().subscribe({
      next: (user) => {
        this.isCheckingAuth.set(false);
        if (user) {
          this.router.navigateByUrl(this.next, {
            replaceUrl: true,
          });
        }
      },
      error: () => {
        this.isCheckingAuth.set(false);
        this.error.set('connection');
      },
    });
  }
}
