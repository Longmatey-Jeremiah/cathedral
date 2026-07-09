'use client';

import { FiMonitor } from 'react-icons/fi';
import { useLoginSessions, useRevokeSession } from '@/hooks/auth';
import type { LoginSession } from '@/services/auth.service';
import { cn } from '@/shared/lib/cn';

export function SessionsList() {
  const { data, isLoading, error } = useLoginSessions();
  const revoke = useRevokeSession();

  if (isLoading) {
    return <p className="mt-5 text-[13px] text-muted-foreground">Loading…</p>;
  }
  if (error) {
    return <p className="mt-5 text-[13px] text-destructive">{error.message}</p>;
  }

  const sessions = data ?? [];

  return (
    <ul className="mt-5 space-y-2 text-[13px] text-foreground">
      {sessions.map((s) => (
        <li
          key={s.id}
          className="flex items-center justify-between gap-3 rounded-[var(--radius-cardinner)] bg-muted px-3 py-2"
        >
          <div className="flex items-center gap-2.5">
            <FiMonitor size={15} className="text-muted-foreground" aria-hidden />
            <div>
              <div>{deviceLabel(s.userAgent)}</div>
              <div className="text-[11px] text-muted-foreground">
                {s.ip ?? 'Unknown IP'} · {lastSeen(s)}
              </div>
            </div>
          </div>
          {s.current ? (
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              This device
            </span>
          ) : (
            <button
              type="button"
              disabled={revoke.isPending}
              onClick={() => revoke.mutate(s.id)}
              className={cn(
                'text-[11px] text-muted-foreground underline-offset-4 hover:text-destructive hover:underline',
                'disabled:opacity-50',
              )}
            >
              Sign out
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function lastSeen(s: LoginSession): string {
  if (s.current) return 'Active now';
  return relativeTime(s.lastSeenAt);
}

// ponytail: native Intl relative time — no date lib for one label.
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const mins = Math.round(diffMs / 60_000);
  if (Math.abs(mins) < 60) return rtf.format(-mins, 'minute');
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour');
  return rtf.format(-Math.round(hours / 24), 'day');
}

// ponytail: naive UA sniff — good enough for a device label, not analytics.
function deviceLabel(ua: string | null): string {
  if (!ua) return 'Unknown device';
  const os =
    /iPhone|iPad/.test(ua) ? 'iOS'
    : /Android/.test(ua) ? 'Android'
    : /Mac OS X/.test(ua) ? 'Mac'
    : /Windows/.test(ua) ? 'Windows'
    : /Linux/.test(ua) ? 'Linux'
    : 'Device';
  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari'
    : 'Browser';
  return `${os} · ${browser}`;
}
