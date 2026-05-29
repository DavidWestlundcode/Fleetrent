import Link from 'next/link';
import { Check, ArrowRight, Zap } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const BASIC_FEATURES = [
  'Hela plattformen inkluderad',
  'Obegränsat antal användare',
  'Upp till 20 maskiner',
  'Uthyrningsorder & hyresavtal',
  'Prismallar & artikelregister',
  'Fortnox-integration',
  'QR-koder för maskiner',
  'Statistik & rapporter',
  'AI-sökning i maskinflotta',
];

const PREMIUM_FEATURES = [
  'Allt i Basic',
  'Obegränsat antal användare',
  'Obegränsat antal maskiner',
  'Prioriterad support',
];

export default function PriserPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-bold text-slate-900 text-[15px] tracking-tight">FleetOS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Funktioner', href: '/#features' },
              { label: 'Hur det fungerar', href: '/#how-it-works' },
              { label: 'Priser', href: '/priser' },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Logga in
            </Link>
            <Link href="/kom-igang" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition-colors">
              Kom igång <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-[48px] font-bold text-slate-900 tracking-tight leading-tight mb-4">
              Enkla, transparenta priser
            </h1>
            <p className="text-[17px] text-slate-500 max-w-lg mx-auto leading-relaxed">
              Välj den plan som passar ditt företag. Ingen bindningstid, ingen installationsavgift.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">

            {/* Basic */}
            <div className="rounded-2xl border border-slate-200 p-8 flex flex-col">
              <div className="mb-6">
                <span className="inline-block text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-3">Basic</span>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-[44px] font-bold text-slate-900 leading-none">2 499</span>
                  <span className="text-slate-500 text-[15px] mb-1.5">kr/mån</span>
                </div>
                <p className="text-[13px] text-slate-400">Faktureras månadsvis. Ingen bindningstid.</p>
              </div>

              <Link
                href="/kom-igang"
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-semibold rounded-xl transition-all text-[14px] mb-8"
              >
                Kom igång med Basic
              </Link>

              <ul className="space-y-3 flex-1">
                {BASIC_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-[14px] text-slate-700">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

            </div>

            {/* Premium */}
            <div className="rounded-2xl border-2 border-blue-600 p-8 flex flex-col relative bg-gradient-to-b from-blue-50/50 to-white">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full tracking-wide">
                  POPULÄRAST
                </span>
              </div>

              <div className="mb-6">
                <span className="inline-block text-[11px] font-bold tracking-widest text-blue-600 uppercase mb-3">Premium</span>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-[44px] font-bold text-slate-900 leading-none">3 999</span>
                  <span className="text-slate-500 text-[15px] mb-1.5">kr/mån</span>
                </div>
                <p className="text-[13px] text-slate-400">Faktureras månadsvis. Ingen bindningstid.</p>
              </div>

              <Link
                href="/kom-igang"
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-[14px] mb-8 shadow-lg shadow-blue-600/25"
              >
                Kom igång med Premium
                <ArrowRight className="w-4 h-4" />
              </Link>

              <ul className="space-y-3 flex-1">
                {PREMIUM_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-[14px] text-slate-700">
                    <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    {f === 'Allt i Basic' ? <span className="font-semibold">{f}</span> : f}
                  </li>
                ))}
              </ul>

            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-2xl mx-auto">
            <h2 className="text-[24px] font-bold text-slate-900 text-center mb-10">Vanliga frågor</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Kan jag byta plan?',
                  a: 'Ja, kontakta oss så hjälper vi dig uppgradera eller nedgradera när som helst.',
                },
                {
                  q: 'Finns det en bindningstid?',
                  a: 'Nej. Du betalar månad för månad och kan avsluta när du vill.',
                },
                {
                  q: 'Ingår support?',
                  a: 'Ja, support via e-post ingår i båda planerna. Premium-kunder får prioriterad hantering.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-slate-100 pb-6">
                  <h3 className="font-semibold text-slate-900 mb-2">{q}</h3>
                  <p className="text-[14px] text-slate-500 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <p className="text-slate-500 text-[14px] mb-6">Osäker på vilken plan som passar? Kontakta oss så hjälper vi dig.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/kom-igang" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-[14px]">
                Starta gratis testperiod <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="mailto:info@fleetos.se" className="flex items-center gap-2 px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-colors text-[14px]">
                Kontakta oss
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
