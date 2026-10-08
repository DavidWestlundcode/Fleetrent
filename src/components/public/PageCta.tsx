import Link from 'next/link';

// Shared end-of-page CTA for marketing content pages. "Boka demo" always goes to the
// /kom-igang form (some pages used to link it to /login by mistake).
export default function PageCta({
  heading = 'Se hur FleetOS fungerar för er flotta',
  text = 'Boka en genomgång så visar vi flödet från order till retur och fakturaunderlag med era egna maskintyper. Ingen bindningstid.',
  secondary = { label: 'Se priser', href: '/priser' },
}: {
  heading?: string;
  text?: string;
  secondary?: { label: string; href: string };
}) {
  return (
    <div className="not-prose mt-14 p-7 sm:p-10 bg-slate-950 rounded-[1.25rem]">
      <p className="text-[20px] font-bold text-white mb-2">{heading}</p>
      <p className="text-[14px] text-slate-400 leading-relaxed mb-6 max-w-xl">{text}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/kom-igang" className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-semibold rounded-xl transition-[background-color,transform] duration-150 ease-out-strong active:scale-[0.97] text-sm">
          Boka demo
        </Link>
        <Link href={secondary.href} className="inline-flex items-center justify-center px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-medium rounded-xl transition-colors text-sm">
          {secondary.label}
        </Link>
      </div>
    </div>
  );
}

export function LinkCards({ links }: { links: { href: string; title: string; desc: string }[] }) {
  return (
    <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
      {links.map(({ href, title, desc }) => (
        <Link key={href} href={href} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/40 transition-colors group">
          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">{title} →</p>
          <p className="text-xs text-slate-500 mt-1">{desc}</p>
        </Link>
      ))}
    </div>
  );
}

export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="not-prose space-y-4 mb-10">
      {faqs.map(({ q, a }) => (
        <div key={q} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">{q}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
        </div>
      ))}
    </div>
  );
}
