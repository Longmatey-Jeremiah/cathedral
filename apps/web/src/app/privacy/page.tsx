import type { Metadata } from 'next';
import { Container } from '@/components/Container';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Privacy Policy · Cathedral',
  description: 'How Cathedral collects, uses, and protects your data.',
};

// ponytail: placeholder legal copy — swap real policy before launch.
const sections = [
  {
    heading: '1. Information we collect',
    body: 'We collect account details you provide, content you store in Cathedral, and usage data generated as you use the service.',
  },
  {
    heading: '2. How we use information',
    body: 'We use your information to operate, maintain, and improve Cathedral, to provide support, and to communicate with you about the service.',
  },
  {
    heading: '3. Sharing',
    body: 'We do not sell your data. We share it only with service providers who help us run Cathedral, and where required by law.',
  },
  {
    heading: '4. Data retention',
    body: 'We retain your data for as long as your account is active or as needed to provide the service and meet legal obligations.',
  },
  {
    heading: '5. Security',
    body: 'We apply administrative, technical, and physical safeguards to protect your information. No method of transmission is perfectly secure.',
  },
  {
    heading: '6. Your rights',
    body: 'Depending on your location, you may have rights to access, correct, or delete your personal data. Contact us to exercise them.',
  },
  {
    heading: '7. Changes',
    body: 'We may update this policy from time to time. We will note the effective date above when we do.',
  },
  {
    heading: '8. Contact',
    body: 'Questions about your privacy? Reach us at privacy@cathedral.app.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-fog">
      <Nav />
      <Container className="max-w-3xl py-20">
        <h1 className="text-display-lg">Privacy Policy</h1>
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
