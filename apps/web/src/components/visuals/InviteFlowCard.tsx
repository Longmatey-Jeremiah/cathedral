export function InviteFlowCard() {
  const rows = [
    { name: 'Pastor Daniel', role: 'ADMIN', state: 'Active' },
    { name: 'Sarah Mensah', role: 'FINANCE', state: 'Pending invite' },
    { name: 'Joshua Okai', role: 'DEPARTMENT_LEADER', state: 'Active' },
    { name: 'Esi Boateng', role: 'VIEWER', state: 'Pending invite' },
  ];
  return (
    <div className="rounded-[var(--radius-cards)] border border-black/[0.04] bg-snow p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-[18px] text-carbon">Invite a teammate</div>
        <span className="rounded-[var(--radius-badges)] bg-fog px-2 py-1 text-[11px] text-graphite">
          RBAC
        </span>
      </div>
      <div className="space-y-3">
        <label className="block">
          <span className="block text-[11px] uppercase tracking-[0.12em] text-pebble">
            Email
          </span>
          <div className="mt-1 border-b border-carbon/80 py-2 text-[15px] text-carbon">
            sarah@gracecentral.app
          </div>
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-[0.12em] text-pebble">
            Role
          </span>
          <div className="mt-1 flex items-center justify-between border-b border-carbon/80 py-2 text-[15px] text-carbon">
            <span>Finance</span>
            <span className="text-pebble">▾</span>
          </div>
        </label>
        <div className="grid h-11 place-items-center rounded-[var(--radius-buttons)] bg-tangerine-tag text-[14px] font-medium text-carbon shadow-button">
          Send invite
        </div>
      </div>

      <div className="mt-6 border-t border-black/[0.05] pt-4">
        <div className="mb-3 flex items-center justify-between text-[12px] text-stone">
          <span>Team</span>
          <span>{rows.length} members</span>
        </div>
        <div className="rounded-[var(--radius-cardinner)] border border-black/[0.04] bg-fog/40">
          {rows.map((r, i) => (
            <div
              key={r.name}
              className={`flex items-center justify-between px-3 py-2.5 ${i !== 0 ? 'border-t border-black/[0.04]' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-deep-slate text-[10px] text-white">
                  {r.name
                    .split(' ')
                    .map((p) => p[0])
                    .join('')}
                </div>
                <span className="text-[13px] font-medium text-carbon">
                  {r.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-[var(--radius-badges)] bg-snow px-2 py-1 text-[10px] tracking-[0.04em] text-graphite">
                  {r.role}
                </span>
                <span
                  className={`text-[11px] ${
                    r.state === 'Active' ? 'text-graphite' : 'text-pebble'
                  }`}
                >
                  {r.state}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
