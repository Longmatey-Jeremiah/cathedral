import type { Contribution, Fund } from './types';

export const funds: Fund[] = [
  { label: 'Tithes', amount: 28410, share: 58 },
  { label: 'Building fund', amount: 11200, share: 23 },
  { label: 'Missions', amount: 5600, share: 12 },
  { label: 'Other', amount: 3000, share: 7 },
];

export const contributions: Contribution[] = [
  {
    id: 'c-1',
    date: '2026-05-10',
    donor: 'Daniel Aboagye',
    fund: 'Tithes',
    amount: 320,
    method: 'card',
    recurring: true,
  },
  {
    id: 'c-2',
    date: '2026-05-10',
    donor: 'Ama Boateng',
    fund: 'Building fund',
    amount: 1200,
    method: 'transfer',
    recurring: false,
  },
  {
    id: 'c-3',
    date: '2026-05-09',
    donor: 'Naana Mensah',
    fund: 'Tithes',
    amount: 200,
    method: 'mobile-money',
    recurring: true,
  },
  {
    id: 'c-4',
    date: '2026-05-08',
    donor: 'Kojo Asante',
    fund: 'Missions',
    amount: 75,
    method: 'card',
    recurring: false,
  },
  {
    id: 'c-5',
    date: '2026-05-07',
    donor: 'Akua Sarpong',
    fund: 'Tithes',
    amount: 410,
    method: 'mobile-money',
    recurring: true,
  },
  {
    id: 'c-6',
    date: '2026-05-05',
    donor: 'Kwame Owusu',
    fund: 'Other',
    amount: 90,
    method: 'cash',
    recurring: false,
  },
];

export const methodLabel: Record<Contribution['method'], string> = {
  card: 'Card',
  'mobile-money': 'Mobile money',
  cash: 'Cash',
  transfer: 'Bank transfer',
};

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
