import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { CUSTOMER_CASES } from '@/lib/customer-cases';

export const metadata: Metadata = {
  title: 'Kunder – så använder företag FleetOS',
  description: 'Se hur maskinuthyrningsföretag som WTS Machinery Solutions använder FleetOS för att hantera flotta, order och fakturering.',
  keywords: ['FleetOS kunder', 'kundcase maskinuthyrning', 'referenser maskinuthyrningssystem'],
  alternates: { canonical: 'https://fleetos.se/kunder' },
  openGraph: {
    title: 'Kunder – så använder företag FleetOS',
    description: 'Se hur maskinuthyrningsföretag använder FleetOS för att hantera flotta, order och fakturering.',
    url: 'https://fleetos.se/kunder',
  },
};

export default function KunderPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Kunder</p>
            <h1 className="text-[48px] font-bold text-slate-900 tracking-tight leading-tight mb-4">
              Så använder företag FleetOS
            </h1>
            <p className="text-[17px] text-slate-500 max-w-lg mx-auto leading-relaxed">
              Maskinuthyrningsföretag som digitaliserat sin verksamhet med FleetOS — från flotta och order till fakturering.
            </p>
          </div>

          {/* Case grid — a single case gets a fuller spotlight treatment instead of
              looking like one card lost in an empty multi-column grid. */}
          {CUSTOMER_CASES.length === 1 ? (
            <AnimateIn direction="scale">
              {(() => {
                const c = CUSTOMER_CASES[0];
                return (
                  <Link
                    href={`/kunder/${c.slug}`}
                    className="group block bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300 max-w-2xl mx-auto"
                  >
                    <div className="flex items-center justify-center h-14 mb-6">
                      <img src={c.logo} alt={c.name} className="max-h-10 max-w-[200px] object-contain" />
                    </div>
                    <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1.5 text-center">{c.industry}</p>
                    <h2 className="text-[22px] font-bold text-slate-900 mb-3 text-center">{c.name}</h2>
                    <p className="text-[14px] text-slate-500 leading-relaxed mb-7 text-center max-w-lg mx-auto">{c.summary}</p>
                    <ul className="space-y-2.5 mb-7 max-w-sm mx-auto">
                      {c.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2.5 text-[13.5px] text-slate-700">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-center">
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 group-hover:gap-2.5 transition-all">
                        Läs kundcaset <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })()}
            </AnimateIn>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {CUSTOMER_CASES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/kunder/${c.slug}`}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-center h-12 mb-5">
                    <img src={c.logo} alt={c.name} className="max-h-8 max-w-[160px] object-contain" />
                  </div>
                  <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1.5">{c.industry}</p>
                  <h2 className="text-[16px] font-bold text-slate-900 mb-2">{c.name}</h2>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-4">{c.summary}</p>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 group-hover:gap-2.5 transition-all">
                    Läs mer <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-20 text-center">
            <p className="text-slate-500 text-[14px] mb-6">Vill ditt företag också effektivisera sin maskinuthyrning?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/kom-igang" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-[14px]">
                Boka demo <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="mailto:david@fleetos.se,elias@fleetos.se" className="flex items-center gap-2 px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-colors text-[14px]">
                Kontakta oss
              </a>
            </div>
          </div>

        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
