interface Bar {
  label: string;
  value: number;
}

interface Props {
  bars: Bar[];
  /** Highlight the last bar in tangerine (latest data point). Defaults to true. */
  highlightLast?: boolean;
  /** Height of the chart in pixels. */
  height?: number;
}

/**
 * Small column chart used inside panels. Heights are scaled to the largest
 * value in the set so any range works without tuning.
 */
export function MiniBarChart({ bars, highlightLast = true, height = 128 }: Props) {
  if (bars.length === 0) return null;
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {bars.map((b, i) => {
        const isLast = highlightLast && i === bars.length - 1;
        return (
          <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-[6px] transition-colors"
              style={{
                height: `${(b.value / max) * 100}%`,
                background: isLast
                  ? 'var(--color-tangerine-tag)'
                  : 'var(--color-fog)',
                border: isLast ? 'none' : '1px solid rgba(0,0,0,0.04)',
              }}
              aria-label={`${b.label}: ${b.value}`}
            />
            <span className="text-[10px] text-pebble">{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}
