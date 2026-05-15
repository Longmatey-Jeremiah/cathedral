export interface AuditEntry {
  id: string;
  actor: string;
  actorRole: string;
  verb: string;
  target: string;
  ip: string;
  at: string;
}

const hour = 60 * 60 * 1000;

export const auditLog: AuditEntry[] = [
  {
    id: 'a-1',
    actor: 'Pastor Daniel',
    actorRole: 'Admin',
    verb: 'invited',
    target: 'Naana Mensah · Department leader',
    ip: '197.255.x.x',
    at: new Date(Date.now() - 0.2 * hour).toISOString(),
  },
  {
    id: 'a-2',
    actor: 'Ama Boateng',
    actorRole: 'Finance',
    verb: 'reconciled',
    target: 'Building fund · week 45',
    ip: '197.255.x.x',
    at: new Date(Date.now() - 2 * hour).toISOString(),
  },
  {
    id: 'a-3',
    actor: 'Kojo Asante',
    actorRole: 'Department leader',
    verb: 'checked in',
    target: '312 children · 9am service',
    ip: '197.255.x.x',
    at: new Date(Date.now() - 5 * hour).toISOString(),
  },
  {
    id: 'a-4',
    actor: 'System',
    actorRole: 'Audit',
    verb: 'archived',
    target: '2 expired invites',
    ip: 'internal',
    at: new Date(Date.now() - 26 * hour).toISOString(),
  },
  {
    id: 'a-5',
    actor: 'Pastor Daniel',
    actorRole: 'Admin',
    verb: 'updated role',
    target: 'Yaw Owusu · Viewer → Department leader',
    ip: '197.255.x.x',
    at: new Date(Date.now() - 30 * hour).toISOString(),
  },
];

export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / (60 * 1000));
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(ms / (60 * 60 * 1000));
  if (hr < 24) return `${hr} h ago`;
  const day = Math.round(ms / (24 * 60 * 60 * 1000));
  return `${day}d ago`;
}
