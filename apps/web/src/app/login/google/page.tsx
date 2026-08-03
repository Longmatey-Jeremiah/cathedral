import type { Metadata } from 'next';
import { GoogleCallbackView } from './GoogleCallbackView';

export const metadata: Metadata = {
  title: 'Signing in · Cathedral',
  robots: { index: false, follow: false },
};

export default function GoogleCallbackPage() {
  return <GoogleCallbackView />;
}
