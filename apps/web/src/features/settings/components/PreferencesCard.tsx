'use client';

import { useState } from 'react';
import { PanelCard } from '@/shared/components/admin/PanelCard';
import { Switch } from '@/shared/components/ui/switch';

interface Pref {
  key: string;
  label: string;
  description: string;
  defaultEnabled?: boolean;
}

const prefs: Pref[] = [
  {
    key: 'weekly-digest',
    label: 'Weekly digest',
    description: 'A Monday-morning summary of attendance, giving, and pending invites.',
    defaultEnabled: true,
  },
  {
    key: 'low-coverage',
    label: 'Volunteer coverage alerts',
    description: 'Email when a service has more than 4 unfilled volunteer slots.',
    defaultEnabled: true,
  },
  {
    key: 'reconciliation',
    label: 'Reconciliation reminders',
    description: 'Nudge the finance team if month-end reconciliation is open past the 5th.',
    defaultEnabled: false,
  },
];

export function PreferencesCard() {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(prefs.map((p) => [p.key, Boolean(p.defaultEnabled)])),
  );

  return (
    <PanelCard
      title="Notifications"
      subtitle="What lands in your inbox. You can change these any time."
    >
      <ul className="divide-y divide-border">
        {prefs.map((p) => (
          <li
            key={p.key}
            className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div>
              <div className="text-[14px] font-medium text-foreground">
                {p.label}
              </div>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {p.description}
              </p>
            </div>
            <Switch
              checked={state[p.key]}
              onCheckedChange={(v) =>
                setState((s) => ({ ...s, [p.key]: v }))
              }
            />
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
