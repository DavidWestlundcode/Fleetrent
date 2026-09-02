import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

const GOOGLE_ADS_ID = 'AW-18424604044';

const BASE_URL = 'https://fleetos.se';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'FleetOS – Maskinuthyrningssystem för Sverige',
    template: '%s | FleetOS',
  },
  description: 'FleetOS är det moderna uthyrningssystemet för maskinföretag i Sverige. Hantera maskinflotta, uthyrningsordrar, kunder och fakturering – enkelt och effektivt. Integrerat med Fortnox.',
  keywords: [
    'maskinuthyrningssystem', 'affärssystem för maskinuthyrning', 'affärssystem maskinuthyrning',
    'uthyrningssystem maskiner', 'system maskinuthyrning',
    'hyresorderhantering', 'maskinflotta system', 'truckuthyrning system',
    'uthyrningshantering Sverige', 'maskinuthyrning mjukvara', 'uthyrningsprogram',
    'FleetOS', 'maskinregister', 'orderhantering maskiner',
  ],
  authors: [{ name: 'FleetOS', url: BASE_URL }],
  creator: 'FleetOS',
  publisher: 'FleetOS',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: BASE_URL,
    siteName: 'FleetOS',
    title: 'FleetOS – Maskinuthyrningssystem för Sverige',
    description: 'Det moderna uthyrningssystemet för maskinföretag. Hantera flotta, ordrar och fakturering – integrerat med Fortnox.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FleetOS – Maskinuthyrningssystem' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FleetOS – Maskinuthyrningssystem för Sverige',
    description: 'Det moderna uthyrningssystemet för maskinföretag. Hantera flotta, ordrar och fakturering – integrerat med Fortnox.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className="h-full">
      <body className="h-full bg-slate-50">
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
