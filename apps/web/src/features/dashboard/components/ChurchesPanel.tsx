import { Avatar } from '@/shared/components/admin/Avatar';
import { PanelCard } from '@/shared/components/admin/PanelCard';
import { StatusBadge } from '@/shared/components/admin/StatusBadge';
import { churchesList } from '../mock-data';

export function ChurchesPanel() {
  return (
    <PanelCard
      title="Churches"
      subtitle="Tenants you administer"
      action={{ label: 'Manage all', href: '/dashboard/churches' }}
    >
      <ul className="divide-y divide-border">
        {churchesList.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
          >
            <Avatar name={c.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-foreground">
                {c.name}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {c.city} · {c.members.toLocaleString()} members
              </div>
            </div>
            <StatusBadge
              tone={c.status === 'active' ? 'success' : 'warning'}
              dot
            >
              {c.status}
            </StatusBadge>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
