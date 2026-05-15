import { PanelCard } from '@/shared/components/admin/PanelCard';
import { ProgressBar } from '@/shared/components/admin/ProgressBar';
import { givingByFund } from '../mock-data';

export function GivingPanel() {
  return (
    <PanelCard
      title="Giving"
      subtitle="November · all funds"
      action={{ label: 'Open', href: '/dashboard/giving' }}
    >
      <div className="flex items-end justify-between">
        <div>
          <div className="font-display text-[42px] leading-none text-foreground">
            $48,210
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">
            +8.6% vs October
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-muted-foreground">Recurring</div>
          <div className="font-display text-[20px] text-foreground">412</div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {givingByFund.map((it) => (
          <ProgressBar
            key={it.label}
            label={it.label}
            trailing={it.amount}
            value={it.share}
          />
        ))}
      </div>
    </PanelCard>
  );
}
