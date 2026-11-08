import { Routes } from '@angular/router';

import { ErrorComponent } from './components/error';
import { guestGuard } from './guards/guest-guard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./routes/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./routes/login/login').then((m) => m.Login),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./routes/auth/callback/callback').then((m) => m.AuthCallbackComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./routes/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'overview',
        loadComponent: () => import('./routes/dashboard/overview/overview').then((m) => m.Overview),
      },
      {
        path: 'settings',
        loadComponent: () => import('./routes/dashboard/settings/setting').then((m) => m.Setting),
      },
    ],
  },
  {
    path: 'chat/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./routes/chat/chat').then((m) => m.Chat),
  },
  {
    path: 'error',
    component: ErrorComponent,
  },
  {
    path: '**', // catch-all for 404
    redirectTo: 'error',
    pathMatch: 'full',
  },
];
