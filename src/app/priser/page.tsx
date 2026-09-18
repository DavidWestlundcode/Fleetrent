import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ArrowRight, PenLine } from 'lucide-react';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export const metadata: Metadata = {
  title: 'Priser – maskinuthyrningssystem från 1 495 kr/mån',
  description: 'Se priser för FleetOS, affärssystemet för maskinuthyrning. Start från 1 495 kr/mån, Basic från 2 499 kr/mån och Premium från 3 999 kr/mån, exkl. moms. Ingen bindningstid, hela plattformen inkluderad.',
  keywords: ['pris maskinuthyrningssystem', 'kostnad affärssystem maskinuthyrning', 'FleetOS pris', 'uthyrningssystem pris'],
  alternates: { canonical: 'https://fleetos.se/priser' },
  openGraph: {
    title: 'Priser – maskinuthyrningssystem från 1 495 kr/mån',
    description: 'Enkla, transparenta priser för FleetOS. Ingen bindningstid, hela plattformen inkluderad.',
    url: 'https://fleetos.se/priser',
  },
};

const FAQS = [
  {
    q: 'Kan jag byta plan?',
    a: 'Ja, kontakta oss så hjälper vi dig uppgradera eller nedgradera när som helst.',
  },
  {
    q: 'Vad händer om jag behöver fler användare än vad som ingår?',
    a: 'Du kan lägga till fler användare utöver de som ingår i din plan — extra användare kostar en fast summa per person och månad, som är lägre ju högre plan du har.',
  },
  {
    q: 'Finns det en bindningstid?',
    a: 'Nej. Du betalar månad för månad och kan avsluta när du vill.',
  },
  {
    q: 'Ingår support?',
    a: 'Ja, support via e-post ingår i alla planer. Premium-kunder får prioriterad hantering.',
  },
  {
    q: 'Hur fungerar e-signeringen?',
    a: 'E-signering ingår i alla planer. Du skickar hyresavtalet direkt från FleetOS och kunden signerar digitalt via e-post. En rörlig kostnad tillkommer per skickat avtal — kontakta oss för aktuell prislista.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'FleetOS',
  description: 'Maskinuthyrningssystem för uthyrningsföretag i Sverige.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Start',
      priceCurrency: 'SEK',
      price: '1495',
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      availability: 'https://schema.org/InStock',
      url: 'https://fleetos.se/priser',
    },
    {
      '@type': 'Offer',
      name: 'Basic',
      priceCurrency: 'SEK',
      price: '2499',
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      availability: 'https://schema.org/InStock',
      url: 'https://fleetos.se/priser',
    },
    {
      '@type': 'Offer',
      name: 'Premium',
      priceCurrency: 'SEK',
      price: '3999',
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      availability: 'https://schema.org/InStock',
      url: 'https://fleetos.se/priser',
    },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const STANDARD_FEATURES = [
  'Hela plattformen inkluderad',
  'Uthyrningsorder & hyresavtal',
  'Prismallar & artikelregister',
  'Fortnox-integration',
  'QR-koder för maskiner',
  'Statistik & rapporter',
  'AI-sökning i maskinflotta',
  'E-signering av hyresavtal*',
];

const PLANS = [
  {
    name: 'Start',
    price: 1495,
    usersIncluded: 2,
    extraUserPrice: 349,
    machines: 'Upp till 100',
    support: 'Standard',
    highlighted: false,
  },
  {
    name: 'Basic',
    price: 2499,
    usersIncluded: 5,
    extraUserPrice: 305,
    machines: 'Upp till 100',
    support: 'Standard',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: 3999,
    usersIncluded: 10,
    extraUserPrice: 99,
    machines: 'Obegränsat',
    support: 'Prioriterad',
    highlighted: false,
  },
];

export default function PriserPage() {
  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <PublicHeader />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-[48px] font-bold text-slate-900 tracking-tight leading-tight mb-4">
              Enkla, transparenta priser
            </h1>
            <p className="text-[17px] text-slate-500 max-w-lg mx-auto leading-relaxed">
              FleetOS är affärssystemet byggt specifikt för maskinuthyrning. Välj den plan som passar ditt företag — ingen bindningstid, ingen installationsavgift.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const card = (
                <div className={`rounded-[calc(1.75rem-0.375rem)] p-8 flex flex-col h-full relative ${
                  plan.highlighted
                    ? 'border-2 border-blue-600 bg-gradient-to-b from-blue-50/50 to-white'
                    : 'border border-slate-200 bg-white'
                }`}>
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full tracking-wide">
                        POPULÄRAST
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <span className={`inline-block text-[11px] font-bold tracking-widest uppercase mb-3 ${plan.highlighted ? 'text-blue-600' : 'text-slate-500'}`}>
                      {plan.name}
                    </span>
                    <div className="flex items-end gap-1.5 mb-1">
                      <span className="text-[44px] font-bold text-slate-900 leading-none">{plan.price.toLocaleString('sv-SE')}</span>
                      <span className="text-slate-500 text-[15px] mb-1.5">kr/mån</span>
                    </div>
                    <p className="text-[13px] text-slate-400">Exkl. moms. Faktureras månadsvis. Ingen bindningstid.</p>
                  </div>

                  <Link
                    href="/kom-igang"
                    className={`w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-xl transition-all text-[14px] mb-8 ${
                      plan.highlighted
                        ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-lg shadow-blue-600/25'
                        : 'border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    Kom igång med {plan.name}
                    {plan.highlighted && <ArrowRight className="w-4 h-4" />}
                  </Link>

                  <dl className="space-y-3 text-[14px]">
                    <div className="flex items-center justify-between">
                      <dt className="text-slate-500">Användare som ingår</dt>
                      <dd className="font-semibold text-slate-900">{plan.usersIncluded}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-slate-500">Extra användare</dt>
                      <dd className="font-semibold text-slate-900">{plan.extraUserPrice} kr/st och mån</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-slate-500">Antal maskiner</dt>
                      <dd className="font-semibold text-slate-900">{plan.machines}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-slate-500">Support</dt>
                      <dd className="font-semibold text-slate-900">{plan.support}</dd>
                    </div>
                  </dl>
                </div>
              );

              return plan.highlighted ? (
                <div key={plan.name} className="rounded-[1.75rem] bg-gradient-to-br from-blue-100 to-blue-50 ring-1 ring-blue-200/60 p-1.5 shadow-md shadow-blue-900/5">
                  {card}
                </div>
              ) : (
                <div key={plan.name}>{card}</div>
              );
            })}
          </div>

          {/* Shared standard features */}
          <div className="mt-10 max-w-3xl mx-auto p-8 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-[13px] font-semibold text-slate-900 mb-4">Ingår i alla planer:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {STANDARD_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3 text-[14px] text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* E-signing note */}
          <div className="mt-8 max-w-3xl mx-auto flex items-start gap-3 px-5 py-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <PenLine className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-blue-700 leading-relaxed">
              <span className="font-semibold">* E-signering ingår i alla planer</span> — kunden signerar hyresavtalet digitalt direkt från FleetOS. En rörlig kostnad tillkommer per skickat avtal. Kontakta oss för aktuell prislista.
            </p>
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-2xl mx-auto">
            <h2 className="text-[24px] font-bold text-slate-900 text-center mb-10">Vanliga frågor</h2>
            <div className="space-y-6">
              {FAQS.map(({ q, a }) => (
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
