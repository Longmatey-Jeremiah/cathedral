import type { ReactNode } from 'react';

function Star() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-[14px] w-[14px] fill-tangerine-tag"
      aria-hidden
    >
      <path d="M10 1.5 12.6 7l6 .9-4.3 4.2 1 6L10 15.3l-5.3 2.8 1-6L1.4 7.9l6-.9L10 1.5Z" />
    </svg>
  );
}

interface Props {
  badge: ReactNode;
  label: string;
}

export function StarRow({ badge, label }: Props) {
  return (
    <div className="flex items-center gap-2">
      {badge}
      <div className="flex items-center gap-[2px]">
        <Star />
        <Star />
        <Star />
        <Star />
        <Star />
      </div>
      <span className="text-[12px] text-stone">{label}</span>
    </div>
  );
}
