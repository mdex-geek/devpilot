import { Component, input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut, lucideLayoutDashboard, lucideMessageSquare } from '@ng-icons/lucide';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSeparator } from '@spartan-ng/helm/separator';

import { User } from '../api';
import {
  dashboardNavGroups,
  dashboardNavIcons,
  isDashboardNavActive,
} from '../../lib/dashboard-nav';
import { ModeToggleComponent } from './mode-toggle';
import { useCurrentUser, useLogout } from '../service/auth-queries';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterLink,
    NgIcon,
    ...HlmSidebarImports,
    ...HlmAvatarImports,
    ...HlmDropdownMenuImports,
    HlmSeparator,
    ModeToggleComponent,
  ],
  providers: [
    provideIcons({
      lucideLogOut,
      lucideLayoutDashboard,
      lucideMessageSquare,
      ...dashboardNavIcons,
    }),
  ],
  template: `
    <div hlmSidebarWrapper>
      <hlm-sidebar variant="inset" collapsible="offcanvas">
        <!-- Header -->
        <hlm-sidebar-header>
          <ul hlmSidebarMenu>
            <li hlmSidebarMenuItem>
              <a routerLink="/dashboard" hlmSidebarMenuButton size="lg">
                <div
                  class="size-8 rounded-[10px] bg-foreground text-background flex items-center justify-center text-xs font-bold"
                >
                  DP
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">DevPilot</span>
                  <span class="truncate text-xs text-muted-foreground"> Chat with your code </span>
                </div>
              </a>
            </li>
          </ul>
        </hlm-sidebar-header>

        <!-- Nav -->
        <hlm-sidebar-content>
          @for (group of navGroups; track group.label) {
            <hlm-sidebar-group>
              <div hlmSidebarGroupLabel>{{ group.label }}</div>
              <div hlmSidebarGroupContent>
                <ul hlmSidebarMenu>
                  @for (item of group.items; track item.href) {
                    <li hlmSidebarMenuItem>
                      <a
                        [routerLink]="item.href"
                        hlmSidebarMenuButton
                        [isActive]="isActive(item.href, item.exact)"
                      >
                        <ng-icon [name]="item.icon" />
                        <span>{{ item.title }}</span>
                      </a>
                    </li>
                  }
                </ul>
              </div>
            </hlm-sidebar-group>
          }
        </hlm-sidebar-content>

        <!-- Footer user menu -->
        <hlm-sidebar-footer>
          <ul hlmSidebarMenu>
            <li hlmSidebarMenuItem>
              <button
                hlmSidebarMenuButton
                size="lg"
                side="top"
                align="start"
                [hlmDropdownMenuTrigger]="userMenu"
              >
                <hlm-avatar class="size-8 rounded-lg">
                  @if (user?.avatarUrl) {
                    <img [src]="user!.avatarUrl!" [alt]="user?.displayName ?? ''" hlmAvatarImage />
                  }
                  <span hlmAvatarFallback class="rounded-lg">
                    {{ initials }}
                  </span>
                </hlm-avatar>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-medium">{{ user?.displayName }}</span>
                  <span class="truncate text-xs text-muted-foreground">
                    @{{ user?.githubUsername }}
                  </span>
                </div>
              </button>

              <ng-template #userMenu>
                <div hlmDropdownMenu class="min-w-56 rounded-lg">
                  @if (logoutError) {
                    <p class="px-2 py-1 text-xs text-destructive" role="alert">{{ logoutError }}</p>
                    <hlm-dropdown-menu-separator />
                  }
                  <div class="px-2 py-1.5">
                    <div class="text-sm font-medium">{{ user?.displayName }}</div>
                    <div class="text-xs text-muted-foreground">Connected via GitHub</div>
                  </div>
                  <hlm-dropdown-menu-separator />
                  <button hlmDropdownMenuItem (click)="goSettings()">
                    <ng-icon name="lucideSettings" class="mr-2 size-4" />
                    Settings
                  </button>
                  <hlm-dropdown-menu-separator />
                  <button hlmDropdownMenuItem (click)="logout()" [disabled]="loggingOut">
                    <ng-icon name="lucideLogOut" class="mr-2 size-4" />
                    Log out
                  </button>
                </div>
              </ng-template>
            </li>
          </ul>
        </hlm-sidebar-footer>
      </hlm-sidebar>

      <!-- Main -->
      <main hlmSidebarInset>
        @if (!hideHeader()) {
          <header
            class="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur"
          >
            <button hlmSidebarTrigger class="-ml-1"></button>
            <hlm-separator orientation="vertical" class="mr-2 h-4" />
            <div class="flex min-w-0 flex-1 items-center justify-between gap-3">
              <div class="min-w-0">
                @if (title()) {
                  <h1 class="truncate text-sm font-medium">{{ title() }}</h1>
                }
                @if (description()) {
                  <p class="truncate text-xs text-muted-foreground">{{ description() }}</p>
                }
              </div>
              <div class="flex items-center gap-2">
                <ng-content select="[shellActions]" />
                <app-mode-toggle />
              </div>
            </div>
          </header>
        }

        <div class="flex flex-1 flex-col">
          <ng-content />
        </div>
      </main>
    </div>
  `,
})
export class AppShellComponent {
  title = input<string | undefined>();
  description = input<string | undefined>();
  hideHeader = input(false);

  private router = inject(Router);
  private readonly currentUser = useCurrentUser();
  private readonly logoutMutation = useLogout();

  navGroups = dashboardNavGroups;
  get user(): User | null { return this.currentUser.data() ?? null; }
  get loggingOut(): boolean { return this.logoutMutation.isPending(); }
  get logoutError(): string | null { return this.logoutMutation.error()?.message ?? null; }

  get initials(): string {
    return (this.user?.displayName ?? 'DP').slice(0, 2).toUpperCase();
  }

  isActive(href: string, exact?: boolean): boolean {
    return isDashboardNavActive(this.router.url.split('?')[0], href, exact);
  }

  goSettings(): void {
    this.router.navigateByUrl('/dashboard/settings');
  }

  logout(): void {
    if (!this.loggingOut) this.logoutMutation.mutate();
  }
}
