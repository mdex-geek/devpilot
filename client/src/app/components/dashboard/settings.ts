import { AsyncPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideGithub,
  lucideLogOut,
  lucideMoon,
  lucideSun,
  lucideUserRound,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { AppShellComponent } from '../app-shell';
import { ModeToggleComponent } from '../mode-toggle';
import { useCurrentUser, useLogout } from '../../service/auth-queries';
import { ThemeService } from '../../../lib/theme/Theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIcon,
    HlmButton,
    ...HlmCardImports,
    HlmLabel,
    HlmSeparator,
    ...HlmSwitchImports,
    AppShellComponent,
    ModeToggleComponent,
  ],
  providers: [provideIcons({ lucideGithub, lucideLogOut, lucideMoon, lucideSun, lucideUserRound })],
  template: `
    <app-shell title="Settings" description="Manage your profile and preferences">
      <div class="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 md:p-6">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Profile</h2>
            <p hlmCardDescription>Your GitHub account connected to DevPilot.</p>
          </div>
          <div hlmCardContent class="space-y-4">
            <div class="flex items-center gap-4">
              <div
                class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-lg font-semibold"
              >
                @if (user()?.avatarUrl) {
                  <img
                    [src]="user()!.avatarUrl!"
                    [alt]="user()?.displayName ?? ''"
                    class="size-full object-cover"
                  />
                } @else {
                  {{ (user()?.displayName ?? 'DP').slice(0, 2).toUpperCase() }}
                }
              </div>
              <div class="min-w-0">
                <p class="truncate font-medium">{{ user()?.displayName ?? 'Loading profile…' }}</p>
                <p class="truncate text-sm text-muted-foreground">@{{ user()?.githubUsername }}</p>
              </div>
            </div>
            <div hlmSeparator></div>
            <div class="grid gap-3 text-sm">
              <div class="flex items-center justify-between gap-3">
                <span class="text-muted-foreground">Display name</span
                ><span class="font-medium">{{ user()?.displayName ?? '—' }}</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="text-muted-foreground">GitHub username</span
                ><span class="font-medium">@{{ user()?.githubUsername ?? '—' }}</span>
              </div>
              <div class="flex items-center justify-between gap-3">
                <span class="text-muted-foreground">Authentication</span
                ><span class="inline-flex items-center gap-1.5 font-medium"
                  ><ng-icon name="lucideGithub" class="size-4" />GitHub OAuth</span
                >
              </div>
            </div>
          </div>
        </section>

        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Appearance</h2>
            <p hlmCardDescription>Customize how DevPilot looks on your device.</p>
          </div>
          <div hlmCardContent class="space-y-4">
            <div class="flex items-center justify-between gap-4">
              <div class="space-y-1">
                <label hlmLabel for="settings-dark-mode">Dark mode</label>
                <p class="text-sm text-muted-foreground">Switch between light and dark themes.</p>
              </div>
              <div class="flex items-center gap-3">
                <ng-icon name="lucideSun" class="size-4 text-muted-foreground" />
                <hlm-switch
                  inputId="settings-dark-mode"
                  [checked]="(themeService.theme$ | async) === 'dark'"
                  (checkedChange)="setDarkMode($event)"
                  aria-label="Toggle dark mode"
                />
                <ng-icon name="lucideMoon" class="size-4 text-muted-foreground" />
              </div>
            </div>
            <div hlmSeparator></div>
            <div class="flex items-center justify-between gap-4">
              <div class="space-y-1">
                <span class="text-sm font-medium">Theme selector</span>
                <p class="text-sm text-muted-foreground">
                  Current theme: {{ (themeService.theme$ | async) ?? 'light' }}
                </p>
              </div>
              <app-mode-toggle />
            </div>
          </div>
        </section>

        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Account actions</h2>
            <p hlmCardDescription>Manage your session and connected workspace.</p>
          </div>
          <div hlmCardContent class="flex flex-col gap-3 sm:flex-row">
            <a
              hlmBtn
              variant="outline"
              class="justify-start"
              href="https://github.com/settings/profile"
              target="_blank"
              rel="noreferrer"
            >
              <ng-icon name="lucideUserRound" class="mr-2 size-4" />Manage on GitHub
            </a>
            <button
              hlmBtn
              variant="destructive"
              class="justify-start"
              [disabled]="isLoggingOut()"
              (click)="logout()"
            >
              <ng-icon name="lucideLogOut" class="mr-2 size-4" />{{
                isLoggingOut() ? 'Logging out…' : 'Log out'
              }}
            </button>
          </div>
        </section>
      </div>
    </app-shell>
  `,
})
export class Settings {
  readonly themeService = inject(ThemeService);
  private readonly currentUserQuery = useCurrentUser();
  private readonly logoutMutation = useLogout();
  readonly user = computed(() => this.currentUserQuery.data() ?? null);
  readonly isLoggingOut = computed(() => this.logoutMutation.isPending());

  setDarkMode(enabled: boolean): void {
    const currentTheme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    if ((enabled ? 'dark' : 'light') !== currentTheme) this.themeService.toggleDarkMode();
  }

  logout(): void {
    if (!this.isLoggingOut()) this.logoutMutation.mutate();
  }
}
