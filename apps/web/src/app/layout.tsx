import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Instrument_Serif } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const sans = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-sans-loaded',
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
  manifest: '/logo/site.webmanifest',
  icons: {
    icon: [
      { url: '/logo/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/logo/favicon.ico',
    apple: '/logo/apple-touch-icon.png',
  },
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
      className={`${sans.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
