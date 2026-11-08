import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { ThemeService } from '../../lib/theme/Theme.service';


@Component({
  selector: 'app-mode-toggle',
  standalone: true,
  imports: [AsyncPipe, NgIcon, HlmButton],
  providers: [provideIcons({ lucideSun, lucideMoon })],
  template: `
    <button
      hlmBtn
      variant="ghost"
      size="icon"
      (click)="themeService.toggleDarkMode()"
      [attr.aria-label]="
        (themeService.theme$ | async) === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      "
    >
      @if ((themeService.theme$ | async) === 'dark') {
        <ng-icon name="lucideSun" class="size-5" />
      } @else {
        <ng-icon name="lucideMoon" class="size-5" />
      }
    </button>
  `,
})
export class ModeToggleComponent {
  readonly themeService = inject(ThemeService);
}
