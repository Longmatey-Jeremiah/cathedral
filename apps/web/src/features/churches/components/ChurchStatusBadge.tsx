import { StatusBadge } from '@/shared/components/admin/StatusBadge';

interface Props {
  isActive: boolean;
  className?: string;
}

export function ChurchStatusBadge({ isActive, className }: Props) {
  return (
    <StatusBadge
      tone={isActive ? 'success' : 'warning'}
      dot
      className={className}
    >
      {isActive ? 'Active' : 'Inactive'}
    </StatusBadge>
  );
}
