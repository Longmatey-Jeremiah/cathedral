import { Container } from './Container';
import { Emph } from './Emph';
import { Pill } from './Pill';

interface Quote {
  quote: string;
  name: string;
  role: string;
  initials: string;
  tone: 'a' | 'b' | 'c';
}

const quotes: Quote[] = [
  {
    quote:
      'We replaced three spreadsheets and a WhatsApp group with one calm dashboard. Our finance team got a Sunday afternoon back.',
    name: 'Pastor Daniel Aboagye',
    role: 'Lead Pastor · Grace Central',
    initials: 'DA',
    tone: 'a',
  },
  {
    quote:
      'Onboarding 40 department leaders used to take weeks. With invite links and roles, we did it in one staff meeting.',
    name: 'Sarah Mensah',
    role: 'Operations · The Bridge',
    initials: 'SM',
    tone: 'b',
  },
  {
    quote:
      'The audit log alone justified switching. Every change is traceable, and our auditors stopped emailing me.',
    name: 'Joshua Okai',
    role: 'Finance Director · Riverside',
    initials: 'JO',
    tone: 'c',
  },
  {
    quote:
      'Beautiful enough that volunteers actually want to log in. That is genuinely rare in church software.',
    name: 'Esi Boateng',
    role: 'Worship Pastor · Living Stones',
    initials: 'EB',
    tone: 'a',
  },
  {
    quote:
      'We moved from a 12-year-old desktop tool to Cathedral in a weekend. The team learned it without a single training call.',
    name: 'Michael Tetteh',
    role: 'Executive Pastor · House of Light',
    initials: 'MT',
    tone: 'b',
  },
  {
    quote:
      'Role-based access stopped a half-dozen quiet near-misses on our giving records. That is a real number to me.',
    name: 'Ama Owusu',
    role: 'Board Treasurer · Hope Centre',
    initials: 'AO',
    tone: 'c',
  },
];

function avatarTone(tone: Quote['tone']) {
  return tone === 'a'
    ? 'bg-deep-slate text-white'
    : tone === 'b'
      ? 'bg-tangerine-tag text-carbon'
      : 'bg-fog text-graphite';
}

function Card({ q }: { q: Quote }) {
  return (
    <article
      className="
        flex w-[340px] shrink-0 flex-col gap-5
        rounded-[var(--radius-cards)] border border-black/[0.04] bg-snow p-6 shadow-card
        dark:border-white/[0.1]
      "
    >
      <p className="text-[15px] leading-[1.55] text-midnight-ink dark:text-carbon">
        “{q.quote}”
      </p>
      <div className="mt-auto flex items-center gap-3">
        <div
          className={`grid h-9 w-9 place-items-center rounded-full text-[12px] font-medium ${avatarTone(q.tone)}`}
        >
          {q.initials}
        </div>
        <div>
          <div className="text-[14px] font-medium text-carbon">{q.name}</div>
          <div className="text-[12px] text-stone">{q.role}</div>
        </div>
      </div>
    </article>
  );
}

export function Testimonials() {
  // Duplicate the list so the marquee can wrap seamlessly
  const loop = [...quotes, ...quotes];

  return (
    <section id="testimonials" className="py-20 md:py-28">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Pill className="mb-5">Stories from the field</Pill>
          <h2 className="text-display-lg heading-fade">
            <Emph>Loved</Emph> by ministry teams who used to dread Mondays.
          </h2>
          <p className="mt-4 text-[16px] text-stone">
            Calm software does not need a hype reel. Real teams, real Sundays.
          </p>
        </div>
      </Container>

      <div className="relative">
        <div className="mask-fade-x overflow-hidden">
          <div className="animate-marquee animate-marquee-pause flex w-max gap-5 px-6">
            {loop.map((q, i) => (
              <Card key={`${q.name}-${i}`} q={q} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
