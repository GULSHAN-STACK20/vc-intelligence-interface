import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VC Intelligence Interface',
  description: 'Precision AI scout for venture teams'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>

        <footer className="text-center text-xs text-gray-400 py-4 border-t">
          Built by Gulshan Kotiya — Full Stack Developer
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
