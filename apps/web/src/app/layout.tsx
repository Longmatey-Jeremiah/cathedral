import type { Metadata, Viewport } from 'next';
import { Inter, Instrument_Serif, Space_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-loaded',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-display-loaded',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif-loaded',
});

export const metadata: Metadata = {
  title: 'Cathedral — Calm software for the church.',
  description:
    'A modern church management platform: members, departments, giving, and attendance — all in one calm dashboard.',
  metadataBase: new URL('https://cathedral.app'),
  openGraph: {
    title: 'Cathedral',
    description:
      'Calm, modern church management. Built so ministry can move at the speed of grace, not paperwork.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f7f7' },
    { media: '(prefers-color-scheme: dark)', color: '#101014' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
