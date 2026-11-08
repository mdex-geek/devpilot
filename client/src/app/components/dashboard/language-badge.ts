import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { getLanguageLabel } from '../../../lib/language-icons';
import { LanguageIconComponent } from '../language-icon';

@Component({
  selector: 'app-language-badge',
  standalone: true,
  imports: [NgClass, LanguageIconComponent],
  template: `
    <div [ngClass]="['inline-flex items-center gap-2', className()]">
      <app-language-icon [language]="language()" [size]="iconSize()" />
      @if (showLabel()) {
        <span class="text-xs font-medium text-foreground">
          {{ getLanguageLabel(language()) }}
        </span>
      }
    </div>
  `,
})
export class LanguageBadgeComponent {
  readonly language = input<string | null>(null);
  readonly className = input('');
  readonly showLabel = input(true);
  readonly iconSize = input<'sm' | 'md' | 'lg'>('md');

  readonly getLanguageLabel = getLanguageLabel;
}
