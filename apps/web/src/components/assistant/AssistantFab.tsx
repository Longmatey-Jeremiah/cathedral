'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMessageSquare } from 'react-icons/fi';

/**
 * Floating shortcut to the assistant, sitting above every dashboard route.
 *
 * ponytail: a link, not a popover chat. One conversation surface is enough
 * until someone needs to keep a page in view while asking about it.
 */
export function AssistantFab() {
  const pathname = usePathname();
  if (pathname?.startsWith('/dashboard/assistant')) return null;

  return (
    <Link
      href="/dashboard/assistant"
      aria-label="Open the assistant"
      className="fixed bottom-6 right-6 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-5 text-[13px] font-medium text-background shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <FiMessageSquare size={16} aria-hidden />
      Ask Dean
    </Link>
  );
}
