'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';

type Category = 'Allmänt' | 'Teknik' | 'Affär';

const FAQS: Record<Category, { q: string; a: string }[]> = {
  Allmänt: [
    { q: 'Hur lång tid tar det att komma igång?', a: 'De flesta kunder är igång med full drift inom en arbetsdag. Vi hjälper dig att lägga upp flottan och onboarda teamet.' },
    { q: 'Vad händer med mina befintliga data i Excel?', a: 'Vi hjälper dig migrera din befintliga data. Kontakta oss så sätter vi upp en import anpassad för din situation.' },
    { q: 'Fungerar det i mobilen?', a: 'Ja, FleetOS är fullt responsivt och optimerat för mobila enheter. QR-funktionen kräver bara en webbläsare.' },
  ],
  Teknik: [
    { q: 'Hur säker är datan?', a: 'All data lagras krypterad i EU-baserade datacenter (Supabase/AWS Irland). Vi följer GDPR fullt ut.' },
    { q: 'Hur fungerar e-signeringen?', a: 'E-signering ingår i båda planerna. Du skickar hyresavtalet direkt från FleetOS och kunden signerar digitalt via e-post. En rörlig kostnad tillkommer per skickat avtal — kontakta oss för aktuell prislista.' },
  ],
  Affär: [
    { q: 'Kan jag bjuda in hela teamet?', a: 'Ja, alla planer inkluderar obegränsat antal användare. Du styr vilka roller och behörigheter varje person har.' },
    { q: 'Kan jag byta plan?', a: 'Ja, kontakta oss så hjälper vi dig uppgradera eller nedgradera när som helst.' },
    { q: 'Finns det en bindningstid?', a: 'Nej. Du betalar månad för månad och kan avsluta när du vill.' },
    { q: 'Ingår support?', a: 'Ja, support via e-post ingår i båda planerna. Premium-kunder får prioriterad hantering.' },
  ],
};

const CATEGORIES = Object.keys(FAQS) as Category[];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: CATEGORIES.flatMap((c) => FAQS[c]).map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function FAQSection() {
  const [tab, setTab] = useState<Category>('Allmänt');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function selectTab(c: Category) {
    setTab(c);
    setOpenIndex(null);
  }

  return (
    <section className="py-14 sm:py-24 px-4 sm:px-6 border-t border-slate-100 bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <AnimateIn className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-12">
          {/* Tabs */}
          <div className="flex mb-10 sm:mb-14 -mx-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => selectTab(c)}
                className="flex-1 mx-1 pb-3 text-[13px] sm:text-[14px] font-semibold border-b-2 transition-colors cursor-pointer text-center"
                style={{
                  color: tab === c ? '#0f172a' : '#94a3b8',
                  borderColor: tab === c ? '#2563eb' : '#e2e8f0',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_1fr] gap-10 lg:gap-16">
            {/* Left: intro */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Vanliga frågor</p>
              <h2 className="text-[36px] sm:text-[44px] font-bold text-slate-900 tracking-tight leading-none mb-4">FAQ</h2>
              <p className="text-[14px] text-slate-500 leading-relaxed">
                Allt du behöver veta om FleetOS. Hittar du inte svaret du söker? Kontakta oss så hjälper vi dig.
              </p>
            </div>

            {/* Right: accordion */}
            <div className="divide-y divide-slate-100">
              {FAQS[tab].map(({ q, a }, i) => {
                const open = openIndex === i;
                return (
                  <div key={q} className="py-4 sm:py-5 first:pt-0 last:pb-0">
                    <button
                      onClick={() => setOpenIndex(open ? null : i)}
                      className="w-full flex items-center justify-between gap-6 text-left cursor-pointer group"
                    >
                      <span className="text-[14px] sm:text-[15px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {q}
                      </span>
                      <span
                        className={`shrink-0 w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 transition-transform duration-200 ${open ? 'rotate-45 border-blue-200 text-blue-600' : ''}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </button>
                    <div
                      className="grid transition-[grid-template-rows] duration-300 ease-out"
                      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <p className="text-[13px] sm:text-[14px] text-slate-500 leading-relaxed pt-3 pr-10">{a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}
