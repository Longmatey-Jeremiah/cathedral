import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // Off for now — anchor hrefs (#book-demo, #product) and not-yet-implemented
  // routes (/dashboard, /forgot-password) trip the typed Link constraint.
  // Turn back on once the route surface settles.
  typedRoutes: false,
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  },
};

export default config;
