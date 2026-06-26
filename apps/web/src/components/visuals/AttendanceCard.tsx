export function AttendanceCard() {
  const weeks = [
    { label: 'Wk 1', value: 62 },
    { label: 'Wk 2', value: 78 },
    { label: 'Wk 3', value: 71 },
    { label: 'Wk 4', value: 88 },
    { label: 'Wk 5', value: 92 },
    { label: 'Wk 6', value: 84 },
    { label: 'Wk 7', value: 96 },
  ];

  return (
    <div className="rounded-[var(--radius-cards)] border border-black/[0.04] bg-snow p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-[18px] text-carbon">Attendance</div>
          <div className="text-[12px] text-stone">Last 7 services · main campus</div>
        </div>
        <div className="text-right">
          <div className="font-display text-[24px] text-carbon">+18.4%</div>
          <div className="text-[11px] text-graphite">vs prior 7 weeks</div>
        </div>
      </div>

      <div className="mt-6 flex h-40 items-end gap-3">
        {weeks.map((w, i) => (
          <div key={w.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-[6px]"
              style={{
                height: `${w.value}%`,
                background:
                  i === weeks.length - 1
                    ? 'var(--color-tangerine-tag)'
                    : 'var(--color-fog)',
                border: i === weeks.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.04)',
              }}
            />
            <span className="text-[10px] text-pebble">{w.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-black/[0.05] pt-4">
        <div>
          <div className="text-[11px] text-stone">First-time visitors</div>
          <div className="font-display text-[20px] text-carbon">142</div>
        </div>
        <div>
          <div className="text-[11px] text-stone">Children check-ins</div>
          <div className="font-display text-[20px] text-carbon">312</div>
        </div>
        <div>
          <div className="text-[11px] text-stone">Volunteer slots</div>
          <div className="font-display text-[20px] text-carbon">48 / 52</div>
        </div>
      </div>
    </div>
  );
}
