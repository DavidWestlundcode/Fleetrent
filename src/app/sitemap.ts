import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { CUSTOMER_CASES } from '@/lib/customer-cases';
import { createPublicClient } from '@/lib/supabase/public';

// Only public, indexable, canonical URLs that return 200. `lastModified` is the date the
// page's content last changed in a meaningful way — update it by hand when you edit a page,
// never `new Date()` (a lastmod that changes on every build is ignored by Google).
// Excluded on purpose: /login and /demo (noindex), app routes (behind auth).
const PAGES: { path: string; lastModified: string }[] = [
  { path: '/', lastModified: '2026-10-07' },
  { path: '/funktioner', lastModified: '2026-10-07' },
  { path: '/uthyrning/truckar', lastModified: '2026-10-07' },
  { path: '/uthyrning/byggmaskiner', lastModified: '2026-10-07' },
  { path: '/uthyrning/liftar', lastModified: '2026-10-07' },
  { path: '/integrationer', lastModified: '2026-10-07' },
  { path: '/integrationer/fortnox', lastModified: '2026-10-07' },
  { path: '/integrationer/serviceprotokoll', lastModified: '2026-10-07' },
  { path: '/priser', lastModified: '2026-09-18' },
  { path: '/kunder', lastModified: '2026-10-07' },
  { path: '/kom-igang', lastModified: '2026-09-01' },
  { path: '/om-oss', lastModified: '2026-10-07' },
  { path: '/kontakt', lastModified: '2026-10-07' },
  { path: '/sakerhet', lastModified: '2026-09-08' },
  { path: '/handelser', lastModified: '2026-09-12' },
  { path: '/changelog', lastModified: '2026-05-20' },
  { path: '/roadmap', lastModified: '2026-10-07' },
  { path: '/press', lastModified: '2026-08-15' },
  { path: '/karriar', lastModified: '2026-08-15' },
  { path: '/villkor', lastModified: '2026-09-15' },
  { path: '/integritetspolicy', lastModified: '2026-09-08' },
  { path: '/gdpr', lastModified: '2026-09-08' },
];

export const revalidate = 3600;

async function publishedEvents(): Promise<{ path: string; lastModified: string }[]> {
  try {
    const { data } = await createPublicClient()
      .from('landing_events')
      .select('id, event_date')
      .eq('is_published', true);
    return (data ?? []).map((e) => ({ path: `/handelser/${e.id}`, lastModified: e.event_date as string }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    ...PAGES,
    ...CUSTOMER_CASES.map((c) => ({ path: `/kunder/${c.slug}`, lastModified: c.lastModified })),
    ...(await publishedEvents()),
  ].map(({ path, lastModified }) => ({ url: absoluteUrl(path), lastModified }));
}
