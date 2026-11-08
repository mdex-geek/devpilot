// lib/dashboard-nav.ts
import { lucideFolderGit2, lucideLayoutGrid, lucideSettings } from '@ng-icons/lucide';

export type DashboardNavItem = {
  title: string;
  href: string;
  /** ng-icon name, e.g. 'lucideLayoutGrid' */
  icon: string;
  exact?: boolean;
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    label: 'Workspace',
    items: [
      {
        title: 'Overview',
        href: '/dashboard/overview',
        icon: 'lucideLayoutGrid',
      },
      {
        title: 'Repositories',
        href: '/dashboard',
        icon: 'lucideFolderGit2',
        exact: true,
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: 'lucideSettings',
      },
    ],
  },
];

export function isDashboardNavActive(pathname: string, href: string, exact = false): boolean {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Register these in the component that renders the nav */
export const dashboardNavIcons = {
  lucideLayoutGrid,
  lucideFolderGit2,
  lucideSettings,
};
