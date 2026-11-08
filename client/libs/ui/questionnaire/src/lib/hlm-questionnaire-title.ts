import { Directive } from '@angular/core';
import { BrnQuestionnaireTitle } from '@spartan-ng/brain/questionnaire';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: 'legend[hlmQuestionnaireTitle]',
  exportAs: 'hlmQuestionnaireTitle',
  hostDirectives: [{ directive: BrnQuestionnaireTitle }],
  host: {
    'data-slot': 'questionnaire-title',
  },
})
export class HlmQuestionnaireTitle {
  constructor() {
    classes(
      () =>
        'text-sm font-semibold [&:not(:has(~[data-slot=questionnaire-description]))]:mb-3 text-pretty',
    );
  }
}
