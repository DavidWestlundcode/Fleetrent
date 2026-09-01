import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import PublicMobileNav from '@/components/public/PublicMobileNav';
import CustomersNavDropdown from '@/components/public/CustomersNavDropdown';
import { CUSTOMER_CASES } from '@/lib/customer-cases';

const NAV_ITEMS = [
  { label: 'Funktioner', href: '/funktioner' },
  { label: 'Hur det fungerar', href: '/#how-it-works' },
  { label: 'Priser', href: '/priser' },
  { label: 'Kunder', href: '/kunder' },
];

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
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PublicMobileNav items={NAV_ITEMS} />
            <Link href="/" className="flex items-center gap-2">
              <Logo size={28} />
              <span className="font-bold text-slate-900 text-[15px] tracking-tight">FleetOS</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/funktioner" className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium">
              Funktioner
            </Link>
            <Link href="/#how-it-works" className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium">
              Hur det fungerar
            </Link>
            <Link href="/priser" className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium">
              Priser
            </Link>
            <CustomersNavDropdown />
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Logga in
            </Link>
            <Link href="/kom-igang" className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition-colors">
              Kom igång <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

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

          {/* Case grid */}
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
    </div>
  );
}
