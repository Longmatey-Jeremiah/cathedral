// Placeholder data used by the dashboard while the API hooks are still being
// wired. Each export maps 1:1 to a planned query so swapping to live data is
// just a single import change in the consuming component.
//
// TODO(api): replace with live `useQuery(...)` hooks from features/dashboard/api.ts

import type { UserRole } from '@/shared/lib/types';

export const churchContext = {
  name: 'Grace Central Cathedral',
  address: 'Accra · Greater Accra Region',
  todayLabel: 'Sunday · Nov 9',
};

export const overviewKpis = [
  {
    key: 'members',
    label: 'Active members',
    value: '1,284',
    delta: '+24 this month',
    tone: 'positive' as const,
  },
  {
    key: 'attendance',
    label: 'Last service',
    value: '892',
    delta: '+6.2% vs prior',
    tone: 'positive' as const,
  },
  {
    key: 'giving',
    label: 'Giving · MTD',
    value: '$48,210',
    delta: '+8.6% vs October',
    tone: 'positive' as const,
  },
  {
    key: 'invites',
    label: 'Pending invites',
    value: '7',
    delta: '3 expire this week',
    tone: 'warn' as const,
  },
];

export const platformKpis = [
  {
    key: 'churches',
    label: 'Churches',
    value: '38',
    delta: '+2 this month',
    tone: 'positive' as const,
  },
  {
    key: 'users',
    label: 'Platform users',
    value: '4,612',
    delta: '+148 this week',
    tone: 'positive' as const,
  },
  {
    key: 'giving',
    label: 'Giving · platform',
    value: '$1.42M',
    delta: 'Nov, all churches',
    tone: 'neutral' as const,
  },
  {
    key: 'incidents',
    label: 'Open incidents',
    value: '0',
    delta: 'All systems calm',
    tone: 'positive' as const,
  },
];

export const recentActivity = [
  {
    id: '1',
    actor: 'Pastor Daniel',
    verb: 'invited',
    target: 'Naana Mensah',
    role: 'Department Leader',
    at: '12 min ago',
  },
  {
    id: '2',
    actor: 'Ama Boateng',
    verb: 'reconciled',
    target: 'Building fund — Wk 45',
    role: 'Finance',
    at: '2 h ago',
  },
  {
    id: '3',
    actor: 'Kojo Asante',
    verb: 'checked in',
    target: '312 children · 9am service',
    role: 'Volunteer',
    at: 'Sun 9:14am',
  },
  {
    id: '4',
    actor: 'System',
    verb: 'archived',
    target: '2 expired invites',
    role: 'Audit',
    at: 'Yesterday',
  },
];

export const churchesList = [
  { id: '1', name: 'Grace Central', city: 'Accra', members: 1284, status: 'active' as const },
  { id: '2', name: 'Mountain View', city: 'Kumasi', members: 612, status: 'active' as const },
  { id: '3', name: 'Riverside Chapel', city: 'Takoradi', members: 408, status: 'active' as const },
  { id: '4', name: 'New Hope Tema', city: 'Tema', members: 96, status: 'pending' as const },
];

export const givingByFund = [
  { label: 'Tithes', amount: '$28,410', share: 58 },
  { label: 'Building fund', amount: '$11,200', share: 23 },
  { label: 'Missions', amount: '$5,600', share: 12 },
  { label: 'Other', amount: '$3,000', share: 7 },
];

export const attendanceWeeks = [
  { label: 'Wk 1', value: 62 },
  { label: 'Wk 2', value: 78 },
  { label: 'Wk 3', value: 71 },
  { label: 'Wk 4', value: 88 },
  { label: 'Wk 5', value: 92 },
  { label: 'Wk 6', value: 84 },
  { label: 'Wk 7', value: 96 },
];

export const roleDescriptions: Record<UserRole, string> = {
  SUPER_ADMIN: 'Platform operator',
  ADMIN: 'Church administrator',
  FINANCE: 'Finance team',
  DEPARTMENT_LEADER: 'Department leader',
  VIEWER: 'Read-only',
};
