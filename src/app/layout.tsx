import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FleetRent – Maskinuthyrningssystem',
  description: 'Professionellt system för hantering av maskinuthyrning',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className="h-full">
      <body className="h-full bg-slate-50">{children}</body>
    </html>
  );
}
