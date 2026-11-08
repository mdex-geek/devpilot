import { Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { getLanguageConfig, languageIconProviders } from '../../lib/language-icons';

@Component({
  selector: 'app-language-icon',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons(languageIconProviders)],
  template: `
    <div [class]="boxClasses()">
      <ng-icon [name]="config().icon" [class]="iconClasses()" />
    </div>
  `,
})
export class LanguageIconComponent {
  language = input<string | null>(null);
  size = input<'sm' | 'md' | 'lg'>('md');
  className = input('');

  config = computed(() => getLanguageConfig(this.language()));

  boxClasses = computed(() => {
    const box = this.size() === 'sm' ? 'size-6' : this.size() === 'lg' ? 'size-10' : 'size-8';
    return [
      'flex shrink-0 items-center justify-center rounded-lg shadow-sm',
      box,
      this.config().bg,
      this.className(),
    ]
      .filter(Boolean)
      .join(' ');
  });

  iconClasses = computed(() => {
    const icon = this.size() === 'sm' ? 'size-3.5' : this.size() === 'lg' ? 'size-5' : 'size-4';
    return [icon, this.config().iconClass].filter(Boolean).join(' ');
  });
}
