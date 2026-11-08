import { Directive } from '@angular/core';
import { BrnQuestionnaireInput } from '@spartan-ng/brain/questionnaire';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: 'input[hlmQuestionnaireInput]',
  exportAs: 'hlmQuestionnaireInput',
  hostDirectives: [
    {
      directive: BrnQuestionnaireInput,
      inputs: ['type', 'disabled', 'value', 'defaultValue'],
    },
  ],
  host: {
    'data-slot': 'questionnaire-input',
  },
})
export class HlmQuestionnaireInput {
  constructor() {
    classes(() => [
      'bg-input/20 dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-7 rounded-md border px-2 py-0.5 text-sm focus-visible:ring-2 aria-invalid:ring-2 md:text-xs/relaxed min-h-11 w-full min-w-0 transition-[color,box-shadow,background-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0',
      'selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground',
    ]);
  }
}
