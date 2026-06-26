export function GivingCard() {
  const items = [
    { label: 'Tithes', amount: '$28,410', share: '58%' },
    { label: 'Building fund', amount: '$11,200', share: '23%' },
    { label: 'Missions', amount: '$5,600', share: '12%' },
    { label: 'Other', amount: '$3,000', share: '7%' },
  ];

  return (
    <div className="rounded-[var(--radius-cards)] border border-black/[0.04] bg-snow p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-[18px] text-carbon">Giving</div>
          <div className="text-[12px] text-stone">November · all funds</div>
        </div>
        <div className="rounded-[var(--radius-badges)] bg-fog px-2.5 py-1 text-[11px] text-graphite">
          Reconciled
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <div className="font-display text-[42px] leading-none text-carbon">
            $48,210
          </div>
          <div className="mt-1 text-[12px] text-graphite">
            +8.6% vs October
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-stone">Recurring</div>
          <div className="font-display text-[20px] text-carbon">412</div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((it) => (
          <div key={it.label}>
            <div className="mb-1 flex items-center justify-between text-[12px]">
              <span className="text-graphite">{it.label}</span>
              <span className="text-stone">{it.amount}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-fog">
              <div
                className="h-full bg-carbon"
                style={{ width: it.share }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
