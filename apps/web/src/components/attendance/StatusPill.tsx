import { StatusBadge, type BadgeTone } from '@/components/admin/StatusBadge';
import type { AttendanceStatus } from '@/types/attendance';

const MAP: Record<AttendanceStatus, { tone: BadgeTone; label: string }> = {
  DRAFT: { tone: 'neutral', label: 'Draft' },
  SUBMITTED: { tone: 'info', label: 'In review' },
  REVIEWED: { tone: 'success', label: 'Reviewed' },
};

export function StatusPill({ status }: { status: AttendanceStatus }) {
  const { tone, label } = MAP[status];
  return (
    <StatusBadge tone={tone} dot>
      {label}
    </StatusBadge>
  );
}
