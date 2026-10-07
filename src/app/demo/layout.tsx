import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

// The interactive demo is the app UI filled with example data: useful for visitors who
// click through from the site, but not a page that should rank (its H1 is "Dashboard" and
// the numbers are fictional). noindex,follow — not blocked in robots.txt, so the tag is read.
export const metadata: Metadata = pageMetadata({
  path: '/demo',
  title: 'Interaktiv demo med exempeldata',
  description: 'Klicka runt i FleetOS med exempeldata – maskiner, kunder, order och statistik – utan att skapa konto.',
  noindex: true,
});

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
