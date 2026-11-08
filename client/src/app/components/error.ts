import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertTriangle, lucideHome, lucideRefreshCw } from '@ng-icons/lucide';
import { HlmCard, HlmCardHeader } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, HlmCard, HlmCardHeader],
  providers: [provideIcons({ lucideAlertTriangle, lucideHome, lucideRefreshCw })],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <hlm-card class="w-full max-w-md text-center">
        <hlm-card-header class="space-y-4">
          <div
            class="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"
          >
            <ng-icon name="lucideAlertTriangle" class="size-8" />
          </div>

          <div class="space-y-2">
            <h3 hlm-card-title class="text-2xl">
              {{ title }}
            </h3>
            <h4 hlm-card-description>
              {{ message }}
            </h4>
          </div>
        </hlm-card-header>

        <div hlm-card-content class="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a routerLink="/" hlmBtn>
            <ng-icon name="lucideHome" class="mr-2 size-4" />
            Go Home
          </a>

          <button hlmBtn variant="outline" (click)="reload()">
            <ng-icon name="lucideRefreshCw" class="mr-2 size-4" />
            Try Again
          </button>
        </div>
      </hlm-card>

      @if (status()) {
        <p class="mt-6 text-sm text-muted-foreground">Error code: {{ status() }}</p>
      }
    </div>
  `,
})
export class ErrorComponent {
  private route = inject(ActivatedRoute);
  //   private router = inject(Router);

  status = signal<number | null>(null);
  title = 'Something went wrong';
  message = 'An unexpected error occurred. Please try again later.';

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const statusParam = params.get('status');
      this.status.set(statusParam ? Number(statusParam) : null);

      // Customize message based on status
      if (this.status() === 404) {
        this.title = 'Page not found';
        this.message = 'The page you are looking for does not exist.';
      } else if (this.status() === 403) {
        this.title = 'Access denied';
        this.message = 'You do not have permission to view this page.';
      } else if (this.status() === 500) {
        this.title = 'Server error';
        this.message = 'Something went wrong on our side. Please try again later.';
      } else if (this.status() === 401) {
        this.title = 'Unauthorized';
        this.message = 'Please sign in to continue.';
      }
    });
  }

  reload() {
    window.location.reload();
  }
}
