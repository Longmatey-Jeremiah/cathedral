import { MiniBarChart } from '@/shared/components/admin/MiniBarChart';
import { PanelCard } from '@/shared/components/admin/PanelCard';
import { attendanceWeeks } from '../mock-data';

export function AttendancePanel() {
  return (
    <PanelCard
      title="Attendance"
      subtitle="Last 7 services · main campus"
      action={{ label: 'View all', href: '/dashboard/attendance' }}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-display text-[42px] leading-none text-foreground">
            +18.4%
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">
            vs prior 7 weeks
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-muted-foreground">
            First-time visitors
          </div>
          <div className="font-display text-[20px] text-foreground">142</div>
        </div>
      </div>

      <div className="mt-6">
        <MiniBarChart bars={attendanceWeeks} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4">
        <Stat label="Children check-ins" value="312" />
        <Stat label="Volunteer slots" value="48 / 52" />
        <Stat label="Avg. duration" value="76 min" />
      </div>
    </PanelCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-display text-[18px] text-foreground">{value}</div>
    </div>
  );
}
