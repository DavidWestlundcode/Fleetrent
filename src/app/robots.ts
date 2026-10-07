import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// robots.txt only steers crawling — the app routes below are protected by auth in middleware.
// /login, /demo and /auth/* are deliberately NOT disallowed: they carry a noindex meta tag,
// and a crawler has to be able to fetch the page to see it.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard', '/machines', '/orders', '/customers', '/settings', '/statistics',
          '/service', '/articles', '/templates', '/admin', '/qr/', '/return/', '/pickup/', '/api/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
