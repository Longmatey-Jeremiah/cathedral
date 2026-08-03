'use client';

import { PanelCard } from '@/components/admin/PanelCard';
import { ProgressBar } from '@/components/admin/ProgressBar';
import { useGivingSummary } from '@/hooks/giving';
import { formatMinor } from '@/shared/lib/money';

export function GivingPanel() {
  const { data, isLoading } = useGivingSummary();

  const monthLabel = data
    ? new Date(data.from).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <PanelCard
      title="Giving"
      subtitle={monthLabel ? `${monthLabel} · all funds` : 'This month'}
      action={{ label: 'Open', href: '/dashboard/giving' }}
    >
      {isLoading || !data ? (
        <p className="py-10 text-[13px] text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="flex items-end justify-between">
            <div>
              <div className="font-display text-[42px] leading-none text-foreground">
                {formatMinor(data.totalMinor, data.currency)}
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">
                {data.donationCount === 1
                  ? '1 gift recorded'
                  : `${data.donationCount.toLocaleString()} gifts recorded`}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {data.byFund.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                No giving recorded this month.
              </p>
            ) : (
              data.byFund.map((fund) => (
                <ProgressBar
                  key={fund.fundId}
                  label={fund.name}
                  trailing={formatMinor(fund.amountMinor, data.currency)}
                  value={fund.share}
                />
              ))
            )}
          </div>
        </>
      )}
    </PanelCard>
  );
}
