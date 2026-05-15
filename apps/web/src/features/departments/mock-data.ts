import type { Department } from './types';

export const departments: Department[] = [
  {
    id: 'pastoral',
    name: 'Pastoral',
    leader: 'Pastor Daniel Aboagye',
    membersCount: 8,
    meets: 'Mondays · 6pm',
    description:
      'Shepherding, visitation, and the rhythm of services. Sets the spiritual cadence of the week.',
  },
  {
    id: 'worship',
    name: 'Worship',
    leader: 'Naana Mensah',
    membersCount: 24,
    meets: 'Thursdays · 7pm',
    description: 'Vocalists, instrumentalists, and the audio team behind every service.',
  },
  {
    id: 'children',
    name: 'Children',
    leader: 'Kojo Asante',
    membersCount: 32,
    meets: 'Sundays · 9am',
    description: 'Sunday school, nursery, and the mid-week kids program.',
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    leader: 'Akua Sarpong',
    membersCount: 18,
    meets: 'Saturdays · 4pm',
    description: 'Welcomes first-time visitors, runs the welcome desk, and keeps the lobby warm.',
  },
  {
    id: 'finance',
    name: 'Finance',
    leader: 'Ama Boateng',
    membersCount: 6,
    meets: 'Last Friday · 6pm',
    description: 'Tithes, building fund reconciliation, and the monthly board report.',
  },
  {
    id: 'media',
    name: 'Media',
    leader: 'Kwame Owusu',
    membersCount: 12,
    meets: 'Saturdays · 5pm',
    description: 'Livestream, design, and the sermon archive.',
  },
];
