import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { cn } from '../../lib/cn';

interface Props {
  href: string;
  label: string;
  className?: string;
}

export function BackLink({ href, label, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 text-[12px] text-stone transition hover:text-carbon',
        className,
      )}
    >
      <FiArrowLeft size={14} aria-hidden />
      {label}
    </Link>
  );
}
