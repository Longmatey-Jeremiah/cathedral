import {
  FiBarChart2,
  FiCreditCard,
  FiPieChart,
  FiUsers,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';

export interface Report {
  id: string;
  title: string;
  description: string;
  cadence: string;
  icon: IconType;
}

export const reports: Report[] = [
  {
    id: 'attendance-monthly',
    title: 'Attendance · monthly',
    description:
      'Service-by-service rolls, first-time visitors, and children check-ins, exportable to CSV.',
    cadence: 'Last run · 1st of each month',
    icon: FiBarChart2,
  },
  {
    id: 'giving-monthly',
    title: 'Giving · monthly',
    description:
      'Reconciliation report broken down by fund, donor, and method. Includes recurring schedules.',
    cadence: 'Last run · 1st of each month',
    icon: FiCreditCard,
  },
  {
    id: 'roster',
    title: 'Member roster',
    description:
      'Snapshot of every active member with role, department, and join date.',
    cadence: 'On-demand',
    icon: FiUsers,
  },
  {
    id: 'departments',
    title: 'Department health',
    description:
      'Roster size, leader engagement, and cadence adherence across all departments.',
    cadence: 'Last run · last Friday',
    icon: FiPieChart,
  },
];
