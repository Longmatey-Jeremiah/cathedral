import { cn } from '../lib/cn';

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[6px] bg-fog', className)} aria-hidden />
  );
}

function Avatar({ initials, tone }: { initials: string; tone: 'a' | 'b' | 'c' }) {
  const tones = {
    a: 'bg-deep-slate text-white',
    b: 'bg-tangerine-tag text-carbon',
    c: 'bg-fog text-graphite',
  };
  return (
    <div
      className={cn(
        'grid h-8 w-8 place-items-center rounded-full text-[11px] font-medium',
        tones[tone],
      )}
    >
      {initials}
    </div>
  );
}

export function BrowserMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-[var(--radius-cards)] bg-snow',
        'border border-black/[0.04] shadow-card',
        'dark:border-white/[0.1] dark:bg-[var(--color-snow)] dark:shadow-[0_24px_60px_-35px_rgba(0,0,0,0.7)]',
        className,
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3 dark:border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-dusty-rose" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-tangerine-tag" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-ash" aria-hidden />
        </div>
        <div className="flex h-6 w-1/2 items-center justify-center rounded-[6px] bg-fog text-[10px] tracking-[0.02em] text-stone dark:bg-white/[0.06] dark:text-stone">
          cathedral.app/dashboard
        </div>
        <div className="w-12" aria-hidden />
      </div>

      {/* Body — Dashboard mock */}
      <div className="grid grid-cols-[180px_1fr] gap-0">
        {/* Sidebar */}
        <aside className="border-r border-black/[0.05] p-4 dark:border-white/[0.08] dark:bg-[var(--color-fog)]/40">
          <SkeletonBlock className="mb-4 h-5 w-24" />
          <div className="space-y-2">
            <SkeletonBlock className="h-7 w-full" />
            <div className="h-7 w-full rounded-[6px] bg-carbon/[0.06] dark:bg-white/[0.1]" />
            <SkeletonBlock className="h-7 w-3/4" />
            <SkeletonBlock className="h-7 w-5/6" />
            <SkeletonBlock className="h-7 w-2/3" />
            <SkeletonBlock className="h-7 w-3/4" />
          </div>
          <div className="mt-6 border-t border-black/[0.05] pt-4 dark:border-white/[0.08]">
            <SkeletonBlock className="mb-2 h-3 w-16" />
            <SkeletonBlock className="h-7 w-5/6" />
            <SkeletonBlock className="mt-2 h-7 w-3/4" />
          </div>
        </aside>

        {/* Main */}
        <main className="bg-page-canvas p-5 dark:bg-[var(--color-page-canvas)]">
          {/* Topline */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-display text-[20px] text-carbon">
                Members
              </div>
              <div className="text-[12px] text-stone">
                3,418 active · 27 pending invites
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-32 rounded-[6px] border border-black/[0.06] bg-snow dark:border-white/[0.1] dark:bg-[var(--color-snow)]" />
              <div className="grid h-8 w-8 place-items-center rounded-[6px] bg-fog dark:bg-white/[0.08]">
                <span className="text-[14px] text-graphite">+</span>
              </div>
              <div className="grid h-8 place-items-center rounded-[var(--radius-buttons)] bg-tangerine-tag px-3 text-[12px] font-medium text-carbon">
                Invite
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Active members', value: '3,418', delta: '+12.4%' },
              { label: 'Avg attendance', value: '1,206', delta: '+3.1%' },
              { label: 'Giving (30d)', value: '$48,210', delta: '+8.6%' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-[var(--radius-cardinner)] border border-black/[0.05] bg-snow p-3 dark:border-white/[0.08] dark:bg-[var(--color-snow)]"
              >
                <div className="text-[11px] text-stone">{s.label}</div>
                <div className="mt-1 font-display text-[22px] text-carbon">
                  {s.value}
                </div>
                <div className="text-[11px] text-graphite">{s.delta}</div>
              </div>
            ))}
          </div>

          {/* Member rows */}
          <div className="rounded-[var(--radius-cardinner)] border border-black/[0.05] bg-snow dark:border-white/[0.08] dark:bg-[var(--color-snow)]">
            {[
              { name: 'Ama Owusu', role: 'Department leader · Worship', tone: 'a' as const },
              { name: 'Kwame Boateng', role: 'Finance', tone: 'b' as const },
              { name: 'Lily Adjei', role: 'Viewer', tone: 'c' as const },
              { name: 'David Mensah', role: 'Department leader · Youth', tone: 'a' as const },
            ].map((m, i) => (
              <div
                key={m.name}
                className={cn(
                  'flex items-center justify-between px-4 py-3',
                  i !== 0 && 'border-t border-black/[0.04] dark:border-white/[0.06]',
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar initials={m.name.split(' ').map((p) => p[0]).join('')} tone={m.tone} />
                  <div>
                    <div className="text-[13px] font-medium text-carbon">
                      {m.name}
                    </div>
                    <div className="text-[11px] text-stone">{m.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-[var(--radius-badges)] bg-fog px-2 py-1 text-[10px] text-graphite">
                    Active
                  </span>
                  <span className="text-[12px] text-pebble">›</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Fade-into-page vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{ boxShadow: 'var(--shadow-xl)' }}
      />
    </div>
  );
}
