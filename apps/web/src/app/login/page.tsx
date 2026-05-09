import type { Metadata } from 'next';
import { LoginView } from './LoginView';

export const metadata: Metadata = {
  title: 'Sign in · Cathedral',
  description: 'Sign in to your Cathedral church management dashboard.',
};

export default function LoginPage() {
  return <LoginView />;
}
