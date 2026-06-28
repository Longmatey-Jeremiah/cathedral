import type { Metadata } from 'next';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Terms of Service · Cathedral',
  description: 'The terms governing your use of Cathedral.',
};

// ponytail: placeholder legal copy — swap real terms before launch.
const sections = [
  {
    heading: '1. Acceptance of terms',
    body: 'By accessing or using Cathedral you agree to be bound by these Terms of Service. If you do not agree, do not use the service.',
  },
  {
    heading: '2. Accounts',
    body: 'You are responsible for safeguarding your account credentials and for all activity under your account. Notify us promptly of any unauthorized use.',
  },
  {
    heading: '3. Acceptable use',
    body: 'You agree not to misuse Cathedral, including attempting to access it by means other than the interfaces we provide, or interfering with its normal operation.',
  },
  {
    heading: '4. Payment',
    body: 'Paid plans are billed in advance and are non-refundable except where required by law. Fees may change with notice.',
  },
  {
    heading: '5. Termination',
    body: 'We may suspend or terminate access for violations of these terms. You may stop using Cathedral at any time.',
  },
  {
    heading: '6. Limitation of liability',
    body: 'Cathedral is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we are not liable for indirect or consequential damages.',
  },
  {
    heading: '7. Changes',
    body: 'We may update these terms from time to time. Continued use after changes take effect constitutes acceptance.',
  },
  {
    heading: '8. Contact',
    body: 'Questions about these terms? Reach us at legal@cathedral.app.',
  },
];

export default function TermsPage() {
  return (
    <main className="bg-fog">
      <Nav />
      <Container className="max-w-3xl py-20">
        <h1 className="text-display-lg">Terms of Service</h1>
        <p className="mt-3 text-[14px] text-stone">Last updated: 26 June 2026</p>
        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-heading">{s.heading}</h2>
              <p className="mt-3 text-body text-stone">{s.body}</p>
            </section>
          ))}
        </div>
      </Container>
      <Footer />
    </main>
  );
}
