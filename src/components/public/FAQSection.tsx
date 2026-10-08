import Link from 'next/link';
import JsonLd from '@/components/public/JsonLd';
import { faqJsonLd } from '@/lib/seo';

// Answers must match /priser and the product. Grouped and fully visible (no accordion),
// which also keeps this a server component.
const GROUPS: { title: string; faqs: { q: string; a: string }[] }[] = [
  {
    title: 'Komma igång',
    faqs: [
      { q: 'Hur lång tid tar det att komma igång?', a: 'Det beror på hur stor flottan är och var era maskiner finns i dag. Vi sätter upp kontot, hjälper er att lägga upp flottan och går igenom systemet med teamet. Finns maskinerna i Serviceprotokoll hämtas de automatiskt.' },
      { q: 'Vad händer med mina befintliga data i Excel?', a: 'Vi hjälper dig att flytta över befintliga uppgifter. Kontakta oss så sätter vi upp en import som passar er situation.' },
      { q: 'Fungerar det i mobilen?', a: 'Ja. FleetOS fungerar i webbläsaren på dator, surfplatta och mobil. QR-funktionen kräver bara en webbläsare.' },
    ],
  },
  {
    title: 'Teknik',
    faqs: [
      { q: 'Hur säker är datan?', a: 'All data lagras krypterad i EU-baserade datacenter (Supabase/AWS Irland). Vi följer GDPR.' },
      { q: 'Hur fungerar e-signeringen?', a: 'E-signering ingår i alla planer. Du skickar hyresavtalet direkt från FleetOS och kunden signerar digitalt via e-post. En rörlig kostnad tillkommer per skickat avtal. Kontakta oss för aktuell prislista.' },
    ],
  },
  {
    title: 'Avtal och priser',
    faqs: [
      { q: 'Kan jag bjuda in hela teamet?', a: 'Ja. Start har 2 användare, Basic 5 och Premium 10, och fler användare kan läggas till mot en månadskostnad per person. Varje användare får rollen admin, säljare eller verkstad.' },
      { q: 'Kan jag byta plan?', a: 'Ja, kontakta oss så hjälper vi dig att uppgradera eller nedgradera när som helst.' },
      { q: 'Finns det en bindningstid?', a: 'Nej. Du betalar månad för månad och kan avsluta när du vill.' },
      { q: 'Ingår support?', a: 'Ja, support via e-post ingår i alla planer. Premium-kunder får prioriterad hantering.' },
    ],
  },
];

export default function FAQSection() {
  return (
    <section aria-labelledby="faq-heading" className="py-24 sm:py-32 px-4 sm:px-6 bg-white">
      <JsonLd data={faqJsonLd(GROUPS.flatMap((g) => g.faqs))} />
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-12 lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="faq-heading" className="text-[32px] sm:text-[40px] font-semibold text-slate-950 tracking-[-0.025em] leading-[1.1] text-balance">
            Vanliga frågor
          </h2>
          <p className="mt-4 text-[15px] text-slate-500 leading-relaxed max-w-sm text-pretty">
            Hittar du inte svaret? <Link href="/kontakt" className="text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 transition-colors">Hör av dig</Link>, vi svarar normalt inom en arbetsdag.
          </p>
        </div>
        <div className="space-y-12">
          {GROUPS.map(({ title, faqs }) => (
            <div key={title}>
              <h3 className="text-[13px] font-semibold text-slate-500 mb-2">{title}</h3>
              <dl className="divide-y divide-slate-100">
                {faqs.map(({ q, a }) => (
                  <div key={q} className="py-5 grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-2 md:gap-8">
                    <dt className="text-[15px] font-semibold text-slate-900 text-pretty">{q}</dt>
                    <dd className="text-[14.5px] text-slate-600 leading-relaxed text-pretty">{a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
