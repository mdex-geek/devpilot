import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: 'dashboard/overview',
    renderMode: RenderMode.Client,
  },
  {
    path: 'dashboard/settings',
    renderMode: RenderMode.Client,
  },
  {
    path: 'chat/:id',
    // Chat loads repository and session data with the browser's auth cookies.
    // Rendering this route on the server drops that browser session and can
    // cancel the in-flight navigation before the client takes over.
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
