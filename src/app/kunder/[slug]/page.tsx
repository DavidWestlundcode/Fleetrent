import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
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

export function generateStaticParams() {
  return CUSTOMER_CASES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = CUSTOMER_CASES.find((c) => c.slug === slug);
  if (!c) return {};
  const title = `${c.name} – kundcase | FleetOS`;
  return {
    title,
    description: c.summary,
    alternates: { canonical: `https://fleetos.se/kunder/${c.slug}` },
    openGraph: { title, description: c.summary, url: `https://fleetos.se/kunder/${c.slug}` },
  };
}

export default async function KundCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CUSTOMER_CASES.find((c) => c.slug === slug);
  if (!c) notFound();

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
        <div className="max-w-3xl mx-auto">
          <Link href="/kunder" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-8">
            <ArrowLeft className="w-3.5 h-3.5" /> Alla kunder
          </Link>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-center h-14 mb-6">
              <img src={c.logo} alt={c.name} className="max-h-10 max-w-[220px] object-contain" />
            </div>
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-widest text-center mb-3">{c.industry}</p>
            <h1 className="text-[36px] font-bold text-slate-900 tracking-tight leading-tight text-center mb-4">
              {c.name}
            </h1>
            <p className="text-[17px] text-slate-500 max-w-xl mx-auto leading-relaxed text-center">
              {c.summary}
            </p>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {c.highlights.map((h) => (
              <div key={h} className="flex items-start gap-2.5 bg-slate-50 rounded-xl p-4">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-[13px] text-slate-700 leading-relaxed">{h}</span>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="prose prose-slate max-w-none space-y-5">
            {c.body.map((p, i) => (
              <p key={i} className="text-[15px] text-slate-600 leading-relaxed">{p}</p>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-20 text-center border-t border-slate-100 pt-12">
            <p className="text-slate-500 text-[14px] mb-6">Vill ditt företag också effektivisera sin maskinuthyrning?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/kom-igang" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-[14px]">
                Starta gratis testperiod <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="mailto:info@dseenterprise.se" className="flex items-center gap-2 px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-colors text-[14px]">
                Kontakta oss
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
