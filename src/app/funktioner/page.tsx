import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import JsonLd from '@/components/public/JsonLd';
import PageCta, { FaqList, LinkCards } from '@/components/public/PageCta';
import { faqJsonLd, pageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  path: '/funktioner',
  title: 'Funktioner – affärssystem för maskinuthyrning',
  description: 'Maskinregister, prismallar, hyresavtal med e-signering, QR-utlämning och retur, avtalshyra, service och lönsamhet per maskin – Fortnox och Serviceprotokoll.',
});

const groups = [
  {
    heading: 'Maskiner och flotta',
    items: [
      { title: 'Maskinregister', desc: 'Varje maskin har ett maskinkort med status, tekniska data, bilder, anteckningar, hyreshistorik och servicehistorik.' },
      { title: 'AI-registrering från foto', desc: 'Fotografera typskylten så fyller AI i fabrikat, modell, serienummer och kapacitet. Uppgifterna kan alltid ändras innan de sparas.' },
      { title: 'AI-sökning', desc: 'Sök i flottan med vanlig text, till exempel "eldriven motviktstruck 2,5 ton", och få matchande maskiner.' },
      { title: 'QR-kod per maskin', desc: 'Skanna maskinens QR-kod för att se aktiv uthyrning och registrera utlämning eller retur direkt i mobilen. Kräver inloggning.' },
    ],
  },
  {
    heading: 'Order, avtal och retur',
    items: [
      { title: 'Uthyrningsordrar', desc: 'Kund, anläggning, beställare, maskin, period och tillägg på samma order. Ordrar kan reserveras i förväg eller vara öppna utan fast returdatum.' },
      { title: 'Prismallar och artiklar', desc: 'Dag-, vecko- och månadspris per kategori och kapacitetsintervall. Transport, försäkring, deposition och andra tillägg hanteras som artiklar.' },
      { title: 'Hyresavtal med e-signering', desc: 'Hyresavtalet skapas från ordern och kan skickas till kunden för digital signering. Det signerade avtalet sparas på ordern.' },
      { title: 'Retur med kontroll', desc: 'Registrera skick, drifttimmar, foton, kommentar och vilka tillbehör som kom tillbaka. Skadade maskiner går direkt till service.' },
    ],
  },
  {
    heading: 'Fakturering och uppföljning',
    items: [
      { title: 'Fakturaunderlag till Fortnox', desc: 'Skicka en klar order till Fortnox med ett klick, med kund, hyresrader, artikelnummer och kostnadsställe.' },
      { title: 'Avtalshyra', desc: 'Långtidshyror får automatiskt en delfaktura i slutet av varje månad, som ni granskar och skickar till Fortnox.' },
      { title: 'Lönsamhet per maskin', desc: 'Intäkter, beläggning och avkastning per maskin, beräknat mot inköp, leasing, finansiering, försäkring och service.' },
      { title: 'Service och besiktning', desc: 'Planera och följ upp periodisk service, reparationer, besiktningar och kontroller per maskin.' },
    ],
  },
];

const faqs = [
  {
    q: 'Vad är ett affärssystem för maskinuthyrning?',
    a: 'Ett system som är byggt för hela flödet i ett uthyrningsföretag: maskinregister, bokningar, hyresavtal, prissättning per hyresperiod, utlämning och retur, service och fakturaunderlag. Till skillnad från ett bokföringsprogram håller det reda på vilken maskin som är uthyrd, till vem och när den ska tillbaka.',
  },
  {
    q: 'Ersätter FleetOS vårt ekonomisystem?',
    a: 'Nej. FleetOS hanterar uthyrningen och skickar fakturaunderlaget till Fortnox, där fakturering och bokföring sker som vanligt.',
  },
  {
    q: 'Vilka maskintyper passar FleetOS för?',
    a: 'FleetOS används för truckar, byggmaskiner och liftar. Truckar och byggmaskiner har egna kategorier med tekniska fält. Övrig utrustning läggs upp under övrigt med egen benämning.',
  },
  {
    q: 'Behöver vi installera något?',
    a: 'Nej. FleetOS körs i webbläsaren på dator, surfplatta och mobil.',
  },
  {
    q: 'Kan vi testa FleetOS innan vi bestämmer oss?',
    a: 'Ja. Boka en demo via formuläret, så går vi igenom systemet med er och berättar hur ni kommer igång. Ni kan också klicka runt i den interaktiva demon med exempeldata.',
  },
];

export default function FunktionerPage() {
  return (
    <PublicLayout
      title="Funktioner i affärssystemet för maskinuthyrning"
      breadcrumbs={[{ name: 'Funktioner', path: '/funktioner' }]}
    >
      <JsonLd data={faqJsonLd(faqs)} />

      <p className="text-lg text-slate-500 mb-10">
        FleetOS följer en maskin från registrering till uthyrning, retur och fakturaunderlag. Här är funktionerna, grupperade efter var i flödet de används.
      </p>

      {groups.map(({ heading, items }) => (
        <section key={heading}>
          <h2>{heading}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-10">
            {items.map(({ title, desc }) => (
              <div key={title} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <h2>Integrationer</h2>
      <p className="mb-10">
        FleetOS skickar ordrar och delfakturor till <Link href="/integrationer/fortnox">Fortnox</Link> och hämtar maskiner och kunder från <Link href="/integrationer/serviceprotokoll">Serviceprotokoll</Link>. Se <Link href="/integrationer">alla integrationer</Link>, inklusive det som är planerat.
      </p>

      <h2>Vanliga frågor om affärssystem för maskinuthyrning</h2>
      <FaqList faqs={faqs} />

      <h2>FleetOS för din typ av flotta</h2>
      <LinkCards links={[
        { href: '/uthyrning/truckar', title: 'Truckar och gaffeltruckar', desc: 'Tekniska data, avtalshyra och tillbehörskontroll' },
        { href: '/uthyrning/byggmaskiner', title: 'Byggmaskiner och grävmaskiner', desc: 'Reservationer, transport och skaderegistrering' },
        { href: '/uthyrning/liftar', title: 'Liftar och skylift', desc: 'Besiktning, kontroll vid retur och service' },
        { href: '/kunder/wts-machinery-solutions', title: 'Kundcase: WTS Machinery Solutions', desc: 'Så används FleetOS i praktiken' },
      ]} />

      <PageCta />
    </PublicLayout>
  );
}
