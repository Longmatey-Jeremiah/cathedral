import Link from 'next/link';
import { Container } from './Container';
import { Logo } from './Logo';

const groups = [
  {
    title: 'Product',
    links: [
      { label: 'Members', href: '#' },
      { label: 'Departments', href: '#' },
      { label: 'Giving', href: '#' },
      { label: 'Attendance', href: '#' },
      { label: 'Audit log', href: '#' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'API', href: '#' },
      { label: 'Integrations', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Customers', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Migration guide', href: '#' },
      { label: 'Pastoral playbooks', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-snow pb-12 pt-16 dark:border-white/[0.1]">
      <Container>
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(4,_1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-[14px] leading-[1.55] text-stone">
              Calm, modern church management. Built so ministry can move at the
              speed of grace, not paperwork.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <div className="text-[12px] font-medium uppercase tracking-[0.12em] text-pebble">
                {g.title}
              </div>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[14px] text-graphite transition hover:text-carbon"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-black/[0.06] pt-6 md:flex-row md:items-center">
          <span className="text-[12px] text-stone">
            © {new Date().getFullYear()} Cathedral. Built for the church, with care.
          </span>
          <div className="flex items-center gap-4 text-[12px] text-stone">
            <span>SOC 2 in progress</span>
            <span aria-hidden>·</span>
            <span>GDPR-aligned</span>
            <span aria-hidden>·</span>
            <span>Hosted in the US & EU</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
