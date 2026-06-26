import type { Metadata } from 'next';
import { AcceptInviteView } from '@/components/auth/AcceptInviteView';

export const metadata: Metadata = {
  title: 'Accept your invite · Cathedral',
  description: 'Set up your Cathedral account from an invite link.',
};

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <AcceptInviteView token={token ?? ''} />;
}
