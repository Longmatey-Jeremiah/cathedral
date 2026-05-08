import { CtaBand } from '@/shared/components/CtaBand';
import { Emph } from '@/shared/components/Emph';
import { Faq } from '@/shared/components/Faq';
import { FeatureRow } from '@/shared/components/FeatureRow';
import { Footer } from '@/shared/components/Footer';
import { Hero } from '@/shared/components/Hero';
import { LogosStrip } from '@/shared/components/LogosStrip';
import { Nav } from '@/shared/components/Nav';
import { Pricing } from '@/shared/components/Pricing';
import { StatBand } from '@/shared/components/StatBand';
import { Testimonials } from '@/shared/components/Testimonials';
import { AttendanceCard } from '@/shared/components/visuals/AttendanceCard';
import { GivingCard } from '@/shared/components/visuals/GivingCard';
import { InviteFlowCard } from '@/shared/components/visuals/InviteFlowCard';

/*
  Section rhythm: even indices are gradient (warm/cool radials), odd
  indices are flat snow ribbons. Keeps the page reading as a clear
  "event / rest / event / rest" sequence.

    0  Hero          gradient   (bg-hero-canopy on the Hero component)
    1  LogosStrip    flat       (bg-snow)
    2  Feature 1     gradient   (bg-fog-cool)
    3  Feature 2     flat       (bg-snow)
    4  Feature 3     gradient   (bg-fog-warm)
    5  StatBand      flat       (bg-snow)
    6  Testimonials  gradient   (bg-fog-warm)
    7  Pricing       flat       (bg-snow)
    8  FAQ           gradient   (bg-fog-cool)
    9  CtaBand       flat       (bg-snow)
*/

export default function HomePage() {
  return (
    <main className="bg-fog">
      <Nav />

      {/* 0 — Hero */}
      <Hero />

      {/* 1 — Logos */}
      <div className="bg-snow">
        <LogosStrip />
      </div>

      {/* 2 — Onboarding */}
      <div id="product" className="bg-fog-cool">
        <FeatureRow
          label="Onboarding · RBAC"
          heading={
            <>
              <Emph>Onboard</Emph> staff and volunteers without spreadsheets.
            </>
          }
          body="Create accounts manually with secure temporary passwords, or send invite links scoped to a specific role. Every joiner lands on the right dashboard from minute one."
          bullets={[
            'Four roles out of the box: Admin, Finance, Department leader, Viewer',
            'Single-use, expiring invite tokens — never stored in plaintext',
            'Forced password change on first login for manual accounts',
          ]}
          visual={<InviteFlowCard />}
        />
      </div>

      {/* 3 — Attendance */}
      <div id="flows" className="bg-snow">
        <FeatureRow
          reverse
          label="Attendance"
          heading={
            <>
              See the room <Emph>before</Emph> you walk into it.
            </>
          }
          body="Service-level attendance, first-time visitors, children check-ins, and volunteer coverage in one quiet view. Export anything; explain everything to your board."
          bullets={[
            'Per-service rolls and trend lines without a spreadsheet',
            'Volunteer rota sync — see what is unfilled before Sunday',
            'CSV export for every chart, every time',
          ]}
          visual={<AttendanceCard />}
        />
      </div>

      {/* 4 — Giving */}
      <div className="bg-fog-warm">
        <FeatureRow
          label="Giving"
          heading={
            <>
              Tithes that <Emph>reconcile</Emph> themselves.
            </>
          }
          body="Track giving by fund, by member, and by service. Recurring contributions are tracked, refunds are auditable, and your finance team stops dreading month-end."
          bullets={[
            'Funds, recurring schedules, and reconciliation in one place',
            'Immutable audit log — every edit, every actor, every timestamp',
            'Role-scoped visibility so leaders see only what they should',
          ]}
          visual={<GivingCard />}
        />
      </div>

      {/* 5 — Stats */}
      <div className="bg-snow">
        <StatBand />
      </div>

      {/* 6 — Testimonials */}
      <div className="bg-fog-warm">
        <Testimonials />
      </div>

      {/* 7 — Pricing */}
      <div className="bg-snow">
        <Pricing />
      </div>

      {/* 8 — FAQ */}
      <div className="bg-fog-cool">
        <Faq />
      </div>

      {/* 9 — CTA */}
      <div className="bg-snow">
        <CtaBand />
      </div>

      <Footer />
    </main>
  );
}
