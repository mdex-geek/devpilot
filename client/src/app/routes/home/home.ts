import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideFolderGit2,
  lucideMessageSquareCode,
  lucideSparkles,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { getGithubLoginUrl } from '../../api';
import { ModeToggleComponent } from '../../components/mode-toggle';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgIcon, HlmButton, ModeToggleComponent],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideFolderGit2,
      lucideMessageSquareCode,
      lucideSparkles,
    }),
  ],
  template: `
    <div class="relative min-h-svh overflow-hidden bg-background">
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(from_var(--primary)_l_c_h/0.12),transparent_55%)]"
      ></div>

      <header
        class="relative z-10 mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4"
      >
        <a routerLink="/" class="flex items-center gap-2 font-semibold" aria-label="DevPilot home">
          <span
            class="flex size-8 items-center justify-center rounded-[10px] bg-foreground text-xs font-bold text-background"
          >
            DP
          </span>
          <span>DevPilot</span>
        </a>

        <div class="flex items-center gap-2">
          <app-mode-toggle />
          <a routerLink="/login" hlmBtn variant="ghost" size="sm">Sign in</a>
        </div>
      </header>

      <main
        class="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-16 md:py-24"
      >
        <section class="mx-auto max-w-2xl space-y-6 text-center">
          <div
            class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-foreground text-xl font-bold text-background shadow-sm"
            aria-hidden="true"
          >
            DP
          </div>

          <div class="space-y-3">
            <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">DevPilot</h1>
            <p class="text-balance text-lg text-muted-foreground">
              Connect GitHub, index any repository, and chat with your codebase using
              retrieval-augmented answers and citations.
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-3">
            <a
              hlmBtn
              size="lg"
              [attr.href]="githubLoginUrl"
              class="inline-flex items-center gap-1.5"
            >
              <ng-icon name="lucideFolderGit2" class="size-4" />
              Continue with GitHub
              <ng-icon name="lucideArrowRight" class="size-4" />
            </a>
            <a routerLink="/login" hlmBtn variant="outline" size="lg">See how it works</a>
          </div>
        </section>

        <section class="grid gap-4 md:grid-cols-3">
          @for (feature of features; track feature.title) {
            <div class="rounded-2xl border bg-card/80 p-5 shadow-xs backdrop-blur">
              <div class="mb-4 flex size-10 items-center justify-center rounded-xl bg-muted">
                <ng-icon [name]="feature.icon" class="size-5 text-foreground" />
              </div>
              <h2 class="font-medium">{{ feature.title }}</h2>
              <p class="mt-1.5 text-sm text-muted-foreground">{{ feature.body }}</p>
            </div>
          }
        </section>
      </main>
    </div>
  `,
})
export class Home {
  readonly githubLoginUrl = getGithubLoginUrl();

  readonly features = [
    {
      title: 'Connect GitHub',
      body: 'OAuth with repo scope for public and private repositories.',
      icon: 'lucideFolderGit2',
    },
    {
      title: 'Index with RAG',
      body: 'Chunk and embed your code into Postgres + pgvector.',
      icon: 'lucideSparkles',
    },
    {
      title: 'Ask anything',
      body: 'Get grounded answers with clickable source citations.',
      icon: 'lucideMessageSquareCode',
    },
  ];
}
