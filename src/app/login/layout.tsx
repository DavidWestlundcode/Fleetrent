import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

// Login has no search value; noindex,follow (and not disallowed in robots.txt so the tag is read).
export const metadata: Metadata = pageMetadata({
  path: '/login',
  title: 'Logga in',
  description: 'Logga in på FleetOS.',
  noindex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
