import { recentActivity } from '../mock-data';

export function ActivityList() {
  return (
    <ul className="divide-y divide-border">
      {recentActivity.map((entry) => (
        <li
          key={entry.id}
          className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
        >
          <span
            aria-hidden
            className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-tangerine-tag"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-foreground">
              <span className="font-medium">{entry.actor}</span>{' '}
              <span className="text-muted-foreground">{entry.verb}</span>{' '}
              <span>{entry.target}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {entry.role} · {entry.at}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
