import type { Service } from './types';

export const services: Service[] = [
  {
    id: 's-7',
    date: '2026-05-10',
    time: '9:00am',
    title: 'Sunday · Main service',
    total: 892,
    firstTimers: 24,
    children: 312,
    volunteersFilled: 48,
    volunteersTotal: 52,
  },
  {
    id: 's-6',
    date: '2026-05-03',
    time: '9:00am',
    title: 'Sunday · Main service',
    total: 866,
    firstTimers: 19,
    children: 296,
    volunteersFilled: 50,
    volunteersTotal: 52,
  },
  {
    id: 's-5',
    date: '2026-04-26',
    time: '9:00am',
    title: 'Sunday · Main service',
    total: 824,
    firstTimers: 16,
    children: 282,
    volunteersFilled: 47,
    volunteersTotal: 52,
  },
  {
    id: 's-4',
    date: '2026-04-19',
    time: '9:00am',
    title: 'Easter Sunday',
    total: 1124,
    firstTimers: 88,
    children: 388,
    volunteersFilled: 62,
    volunteersTotal: 64,
  },
  {
    id: 's-3',
    date: '2026-04-12',
    time: '9:00am',
    title: 'Sunday · Main service',
    total: 778,
    firstTimers: 14,
    children: 268,
    volunteersFilled: 46,
    volunteersTotal: 52,
  },
  {
    id: 's-2',
    date: '2026-04-05',
    time: '9:00am',
    title: 'Sunday · Main service',
    total: 802,
    firstTimers: 17,
    children: 274,
    volunteersFilled: 49,
    volunteersTotal: 52,
  },
];

export const attendanceTrend = services
  .slice()
  .reverse()
  .map((s, i) => ({
    label: `Wk ${i + 1}`,
    value: s.total,
  }));
