import { Component } from '@angular/core';
import { AppShellComponent } from '../../../components/app-shell';
import { OverviewDashboardComponent } from '../../../components/dashboard/overview-dashboard';

@Component({
  imports: [AppShellComponent, OverviewDashboardComponent],
  template: `
    <app-shell title="Overview" description="Workspace activity and indexing status">
      <app-overview-dashboard />
    </app-shell>
  `,
})
export class Overview {}
