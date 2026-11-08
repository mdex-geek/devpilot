import { Component } from '@angular/core';

import { AppShellComponent } from '../../components/app-shell';
import { RepoDashboardComponent } from '../../components/dashboard/repo-dashboard';

@Component({
  imports: [AppShellComponent, RepoDashboardComponent],
  selector: 'app-dashboard',
  template: `
    <app-shell [hideHeader]="true">
      <app-repo-dashboard />
    </app-shell>
  `,
})
export class Dashboard {}
