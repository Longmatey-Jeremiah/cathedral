'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { attendanceKeys } from '@/hooks/attendance';
import { useAuth } from '@/hooks/auth-context';
import { churchKeys } from '@/hooks/churches';
import { givingKeys } from '@/hooks/giving';
import { inviteKeys } from '@/hooks/invites';
import { memberKeys } from '@/hooks/members';
import { userKeys } from '@/hooks/users';
import { attendanceService } from '@/services/attendance.service';
import { churchesService } from '@/services/churches.service';
import { givingService } from '@/services/giving.service';
import { invitesService } from '@/services/invites.service';
import { membersService } from '@/services/members.service';
import { usersService } from '@/services/users.service';
import type { KpiTone } from '@/components/admin/KpiCard';
import { formatMinor } from '@/shared/lib/money';
import { UserRole } from '@/shared/lib/types';
import { inviteStatus, type Invite } from '@/types/invites';
import type { SessionListItem } from '@/types/attendance';

/** Services drawn for the attendance trend. Shared with AttendancePanel's query. */
export const SESSION_WINDOW = { pageSize: 7 } as const;

// Module-level so the query keys stay referentially stable across renders.
const ACTIVE_MEMBERS = { status: 'ACTIVE', pageSize: 1 } as const;
const ONE_ROW = { pageSize: 1 } as const;
export const CHURCH_PREVIEW = { pageSize: 5 } as const;

const DAY = 24 * 60 * 60 * 1000;

export interface Kpi {
  key: string;
  label: string;
  value: string;
  delta?: string;
  tone: KpiTone;
}

export interface ActivityEntry {
  id: string;
  actor: string;
  verb: string;
  target: string;
  role: string;
  at: string;
}

/**
 * Everything the overview page shows, sourced from the live API.
 *
 * Queries are gated on role because the endpoints are too: a VIEWER hitting
 * /giving/summary gets a 403, and an unsent request beats a caught error.
 * Super admins are scoped out of the church-level lists entirely — their JWT
 * carries no churchId, so those endpoints have nothing to filter on.
 */
export function useOverview() {
  const { user } = useAuth();
  const role = user?.role;
  const isSuper = role === UserRole.SUPER_ADMIN;
  const inChurch = Boolean(role) && !isSuper;
  const has = (...roles: UserRole[]) => Boolean(role) && roles.includes(role!);

  // Recomputed once per mount: a fresh object each render would rotate the
  // query key and refetch forever.
  const priorMonth = useMemo(lastCalendarMonth, []);

  const members = useQuery({
    queryKey: memberKeys.list(ACTIVE_MEMBERS),
    queryFn: () => membersService.list(ACTIVE_MEMBERS),
    enabled: inChurch && has(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER),
  });

  const sessions = useQuery({
    queryKey: attendanceKeys.list(SESSION_WINDOW),
    queryFn: () => attendanceService.list(SESSION_WINDOW),
    enabled:
      inChurch &&
      has(UserRole.ADMIN, UserRole.DEPARTMENT_LEADER, UserRole.VIEWER),
  });

  const invites = useQuery({
    queryKey: inviteKeys.list(),
    queryFn: invitesService.list,
    enabled: inChurch && has(UserRole.ADMIN),
  });

  const giving = useQuery({
    queryKey: givingKeys.summary(),
    queryFn: () => givingService.summary(),
    enabled: isSuper || has(UserRole.ADMIN, UserRole.FINANCE),
  });

  const givingPrior = useQuery({
    queryKey: givingKeys.summary(priorMonth),
    queryFn: () => givingService.summary(priorMonth),
    enabled: isSuper || has(UserRole.ADMIN, UserRole.FINANCE),
  });

  const churches = useQuery({
    queryKey: churchKeys.list(CHURCH_PREVIEW),
    queryFn: () => churchesService.list(CHURCH_PREVIEW),
    enabled: isSuper,
  });

  const platformUsers = useQuery({
    queryKey: userKeys.list(ONE_ROW),
    queryFn: () => usersService.list(ONE_ROW),
    enabled: isSuper,
  });

  const church = useQuery({
    queryKey: churchKeys.detail(user?.churchId ?? ''),
    queryFn: () => churchesService.get(user!.churchId!),
    enabled: Boolean(user?.churchId),
  });

  const kpis = useMemo<Kpi[]>(() => {
    const givingValue = giving.data
      ? formatMinor(giving.data.totalMinor, giving.data.currency)
      : '—';
    const givingDelta = percentDelta(
      giving.data?.totalMinor,
      givingPrior.data?.totalMinor,
    );

    if (isSuper) {
      return [
        {
          key: 'churches',
          label: 'Churches',
          value: count(churches.data?.total),
          delta: churches.data
            ? `${churches.data.total === 1 ? 'tenant' : 'tenants'} on the platform`
            : undefined,
          tone: 'neutral',
        },
        {
          key: 'users',
          label: 'Platform users',
          value: count(platformUsers.data?.total),
          tone: 'neutral',
        },
        {
          key: 'giving',
          label: 'Giving · MTD',
          value: givingValue,
          delta: givingDelta?.label ?? 'all churches',
          tone: givingDelta?.tone ?? 'neutral',
        },
      ];
    }

    const rows = sessions.data?.data ?? [];
    const [latest, previous] = rows; // list comes back newest-first
    const attendanceDelta = percentDelta(
      latest?.presentCount,
      previous?.presentCount,
    );
    const pending = (invites.data ?? []).filter(
      (i) => inviteStatus(i) === 'pending',
    );
    const expiringSoon = pending.filter(
      (i) => new Date(i.expiresAt).getTime() - Date.now() < 7 * DAY,
    ).length;

    return [
      {
        key: 'members',
        label: 'Active members',
        value: count(members.data?.total),
        tone: 'neutral',
      },
      {
        key: 'attendance',
        label: 'Last service',
        value: latest ? count(latest.presentCount) : '—',
        delta: attendanceDelta?.label ?? latest?.title,
        tone: attendanceDelta?.tone ?? 'neutral',
      },
      {
        key: 'giving',
        label: 'Giving · MTD',
        value: givingValue,
        delta: givingDelta?.label ?? 'vs last month',
        tone: givingDelta?.tone ?? 'neutral',
      },
      {
        key: 'invites',
        label: 'Pending invites',
        value: invites.data ? count(pending.length) : '—',
        delta: expiringSoon > 0 ? `${expiringSoon} expire this week` : undefined,
        tone: expiringSoon > 0 ? 'warn' : 'neutral',
      },
    ];
  }, [
    isSuper,
    churches.data,
    platformUsers.data,
    giving.data,
    givingPrior.data,
    sessions.data,
    members.data,
    invites.data,
  ]);

  const activity = useMemo(
    () => buildActivity(sessions.data?.data ?? [], invites.data ?? []),
    [sessions.data, invites.data],
  );

  return {
    kpis,
    activity,
    churchName: church.data?.name,
    isLoading:
      members.isLoading ||
      sessions.isLoading ||
      giving.isLoading ||
      churches.isLoading,
  };
}

/**
 * There is no audit table yet, so "recent activity" is assembled from the two
 * timestamped things we already fetch. Swap this for the audit feed when the
 * API grows one.
 */
function buildActivity(
  sessions: SessionListItem[],
  invites: Invite[],
): ActivityEntry[] {
  const fromSessions = sessions.map((s) => ({
    id: `session-${s.id}`,
    actor: s.recordedBy,
    verb: 'recorded',
    target: `${s.title} · ${s.presentCount} present`,
    role: 'Attendance',
    at: new Date(s.date).getTime(),
  }));

  const fromInvites = invites.map((i) => ({
    id: `invite-${i.id}`,
    actor: 'Invite',
    verb: i.used ? 'accepted by' : 'sent to',
    target: i.email,
    role: roleLabel(i.role),
    at: new Date(i.createdAt).getTime(),
  }));

  return [...fromSessions, ...fromInvites]
    .sort((a, b) => b.at - a.at)
    .slice(0, 6)
    .map(({ at, ...rest }) => ({ ...rest, at: relativeTime(at) }));
}

const count = (n: number | undefined) =>
  n === undefined ? '—' : n.toLocaleString();

/** Percentage change, or null when there is no comparable prior figure. */
function percentDelta(
  current: number | undefined,
  prior: number | undefined,
): { label: string; tone: KpiTone } | null {
  if (current === undefined || prior === undefined || prior === 0) return null;
  const pct = ((current - prior) / prior) * 100;
  const rounded = Math.round(pct * 10) / 10;
  if (rounded === 0) return { label: 'level with prior', tone: 'neutral' };
  return {
    label: `${rounded > 0 ? '+' : ''}${rounded}% vs prior`,
    tone: rounded > 0 ? 'positive' : 'warn',
  };
}

function lastCalendarMonth(): { from: string; to: string } {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
    // Day 0 of this month is the last day of the previous one.
    to: new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    ).toISOString(),
  };
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function roleLabel(role: UserRole): string {
  return role
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}
