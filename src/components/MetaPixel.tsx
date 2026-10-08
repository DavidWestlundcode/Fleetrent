'use client';
import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

const META_PIXEL_ID = '1762274715029175';

// The pixel only runs on the public marketing site. Inside the app (and on QR/return
// flows) URLs carry customer/order ids, which should not be sent to Meta.
const PRIVATE_PREFIXES = [
  '/dashboard', '/machines', '/orders', '/customers', '/templates', '/articles', '/service',
  '/settings', '/statistics', '/qr', '/return', '/pickup', '/admin', '/auth', '/login',
];

declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}

export function MetaPixel() {
  const pathname = usePathname();
  const isPublic = !PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const firstView = useRef(true);

  // The snippet's own fbq('track', 'PageView') covers the first load. Client-side
  // navigations don't reload the page, so later route changes are tracked here.
  useEffect(() => {
    if (!isPublic) return;
    if (firstView.current) { firstView.current = false; return; }
    window.fbq?.('track', 'PageView');
  }, [pathname, isPublic]);

  if (!isPublic) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- Meta's no-JS tracking pixel */}
        <img height="1" width="1" style={{ display: 'none' }} alt="" src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
      </noscript>
    </>
  );
}
