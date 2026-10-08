import type { ComponentType, SVGProps } from 'react';
import { DashboardIcon, DealsIcon, TasksIcon, UsersIcon } from '../ui/icons';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon },
  { to: '/customers', label: 'Customers', icon: UsersIcon },
  { to: '/deals', label: 'Deals', icon: DealsIcon },
  { to: '/tasks', label: 'Tasks', icon: TasksIcon },
];
