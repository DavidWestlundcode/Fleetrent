import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/machines', '/orders', '/customers', '/settings', '/statistics', '/service', '/articles', '/templates', '/admin'],
      },
    ],
    sitemap: 'https://fleetos.se/sitemap.xml',
  };
}
