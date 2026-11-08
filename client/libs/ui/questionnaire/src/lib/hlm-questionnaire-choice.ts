import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import {
  BrnQuestionnaireChoice,
  BrnQuestionnaireChoiceInput,
  BrnQuestionnaireChoiceLabel,
  BrnQuestionnaireChoiceShortcut,
} from '@spartan-ng/brain/questionnaire';
import { classes } from '@spartan-ng/helm/utils';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- attribute selector on native label
  selector: 'label[hlmQuestionnaireChoice]',
  exportAs: 'hlmQuestionnaireChoice',
  imports: [
    BrnQuestionnaireChoiceInput,
    BrnQuestionnaireChoiceLabel,
    BrnQuestionnaireChoiceShortcut,
    NgIcon,
  ],
  viewProviders: [provideIcons({ lucideCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: BrnQuestionnaireChoice,
      inputs: ['value', 'disabled', 'defaultChecked', 'checked'],
      outputs: ['checkedChange'],
    },
  ],
  host: {
    'data-slot': 'questionnaire-choice',
  },
  template: `
    <input
      brnQuestionnaireChoiceInput
      data-slot="questionnaire-choice-input"
      class="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
    />
    <span
      aria-hidden="true"
      data-slot="questionnaire-choice-indicator"
      class="border-input group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground dark:bg-input/30 dark:group-data-checked/questionnaire-choice:bg-primary pointer-events-none relative flex size-4 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-[4px] border group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[type=radio]/questionnaire-choice:rounded-full"
    >
      @if (_choice.checked() && _choice.type() === 'radio') {
        <span
          data-slot="questionnaire-choice-indicator-dot"
          class="bg-primary-foreground size-2 rounded-full"
        ></span>
      }
      @if (_choice.checked() && _choice.type() === 'checkbox') {
        <ng-icon
          name="lucideCheck"
          data-slot="questionnaire-choice-indicator-check"
          class="text-[length:--spacing(3.5)]"
        />
      }
    </span>
    <span
      brnQuestionnaireChoiceLabel
      data-slot="questionnaire-choice-label"
      class="gap-0.5 flex min-w-0 flex-1 flex-col leading-snug"
    >
      <ng-content />
    </span>
    @if (_choice.shortcut(); as shortcut) {
      <span
        brnQuestionnaireChoiceShortcut
        data-slot="questionnaire-choice-shortcut"
        class="border-input bg-background/80 text-muted-foreground pointer-events-none ms-auto inline-flex size-4 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-sm border font-mono text-[0.5625rem] leading-none font-medium group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5"
      >
        {{ shortcut }}
      </span>
    }
  `,
})
export class HlmQuestionnaireChoice {
  protected readonly _choice = inject(BrnQuestionnaireChoice);

  constructor() {
    classes(
      () =>
        'border-input bg-input/20 hover:bg-input/40 has-[>input:focus-visible]:border-ring has-[>input:focus-visible]:ring-ring/30 data-invalid:border-destructive data-checked:border-primary/40 data-checked:bg-primary/10 gap-2.5 rounded-xl border px-3 py-2.5 text-xs/relaxed transition-colors has-[>input:focus-visible]:ring-2 data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start text-start outline-none select-none',
    );
  }
}
