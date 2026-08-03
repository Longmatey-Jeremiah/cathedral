import {
  FiBarChart2,
  FiBriefcase,
  FiCalendar,
  FiCreditCard,
  FiGrid,
  FiHeart,
  FiHome,
  FiMail,
  FiMessageSquare,
  FiSettings,
  FiShield,
  FiUsers,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { UserRole } from '@/shared/lib/types';

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
  /** If set, only roles in this list see the item. SUPER_ADMIN sees everything. */
  roles?: UserRole[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', href: '/dashboard', icon: FiHome },
      {
        label: 'Members',
        href: '/dashboard/members',
        icon: FiUsers,
        roles: [UserRole.ADMIN, UserRole.DEPARTMENT_LEADER, UserRole.VIEWER],
      },
      {
        label: 'Departments',
        href: '/dashboard/departments',
        icon: FiBriefcase,
        roles: [UserRole.ADMIN, UserRole.DEPARTMENT_LEADER],
      },
      {
        label: 'Attendance',
        href: '/dashboard/attendance',
        icon: FiCalendar,
        roles: [UserRole.ADMIN, UserRole.DEPARTMENT_LEADER, UserRole.VIEWER],
      },
      {
        label: 'Care',
        href: '/dashboard/care',
        icon: FiHeart,
        roles: [UserRole.ADMIN, UserRole.MEMBER_CARE],
      },
      {
        // Roles mirror the API guard exactly — a nav item a role cannot use is
        // just a 403 with extra steps.
        label: 'Giving',
        href: '/dashboard/giving',
        icon: FiCreditCard,
        roles: [UserRole.ADMIN, UserRole.FINANCE],
      },
      {
        label: 'Team & roles',
        href: '/dashboard/team',
        icon: FiShield,
        roles: [UserRole.ADMIN],
      },
      {
        label: 'Invites',
        href: '/dashboard/invites',
        icon: FiMail,
        roles: [UserRole.ADMIN],
      },
      {
        label: 'Reports',
        href: '/dashboard/reports',
        icon: FiBarChart2,
        roles: [UserRole.ADMIN, UserRole.FINANCE],
      },
      // No roles: the assistant reads no church data, so there is nothing to gate.
      // { label: 'Assistant', href: '/dashboard/assistant', icon: FiMessageSquare },
    ],
  },
  {
    label: 'Platform',
    items: [
      {
        label: 'Churches',
        href: '/dashboard/churches',
        icon: FiGrid,
        roles: [UserRole.SUPER_ADMIN],
      },
      {
        label: 'Platform users',
        href: '/dashboard/platform/users',
        icon: FiShield,
        roles: [UserRole.SUPER_ADMIN],
      },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: FiSettings },
    ],
  },
];

/** Filters the nav to what the given role should see. */
export function visibleNav(groups: NavGroup[], role: UserRole): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.roles) return true;
        if (role === UserRole.SUPER_ADMIN) return true;
        return item.roles.includes(role);
      }),
    }))
    .filter((group) => group.items.length > 0);
}
