import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScoutOS VC – Intelligence Interface',
  description: 'Discover, enrich, and manage high-signal companies in one workflow.'
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VC Intelligence Interface',
  description: 'Precision AI scout for venture teams'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}
