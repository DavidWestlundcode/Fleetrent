import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ChunkErrorReload } from '@/components/ChunkErrorReload';
import { MetaPixel } from '@/components/MetaPixel';
import { SITE_URL } from '@/lib/seo';
import './globals.css';

const GOOGLE_ADS_ID = 'AW-18424604044';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-jakarta',
});


// No `alternates.canonical` here on purpose: a canonical in the root layout is inherited by
// every page that doesn't set its own, which pointed /demo, /press etc. at the home page.
// Public pages set a self-referencing canonical via pageMetadata() in src/lib/seo.ts.
// The social image comes from the opengraph-image.tsx file convention.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FleetOS – uthyrningssystem för maskiner, truckar och liftar',
    template: '%s | FleetOS',
  },
  description: 'FleetOS är ett svenskt uthyrningssystem för företag som hyr ut maskiner, truckar och liftar. Order, hyresavtal, QR-returer och fakturaunderlag till Fortnox.',
  applicationName: 'FleetOS',
  authors: [{ name: 'FleetOS', url: SITE_URL }],
  creator: 'FleetOS',
  publisher: 'DSE ENTERPRISE AB',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    siteName: 'FleetOS',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`h-full ${jakarta.variable}`}>
      <body className="h-full bg-slate-50">
        <ChunkErrorReload />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
