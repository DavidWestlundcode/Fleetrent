import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Funktioner – affärssystem för maskinuthyrning',
  description: 'FleetOS är affärssystemet byggt specifikt för maskinuthyrning: maskinregister, AI-igenkänning, orderhantering, prismallar, servicehistorik och Fortnox-integration i en plattform.',
  keywords: ['affärssystem för maskinuthyrning', 'maskinuthyrningssystem funktioner', 'system maskinuthyrning', 'uthyrningsprogram maskiner'],
  alternates: { canonical: 'https://fleetos.se/funktioner' },
  openGraph: {
    title: 'Funktioner – affärssystem för maskinuthyrning | FleetOS',
    description: 'Maskinregister, AI-igenkänning, orderhantering, prismallar och Fortnox-integration i en plattform byggd för maskinuthyrning.',
    url: 'https://fleetos.se/funktioner',
  },
};

const features = [
  { title: 'AI-igenkänning', desc: 'Fotografera typskylten och låt AI fylla i maskinkortet automatiskt — fabrikat, modell, serienummer och kapacitet.' },
  { title: 'AI-sökning', desc: 'Sök i maskinflottan på naturligt språk — "diesel motviktstruck över 3 ton med lyfthöjd 5 m" — och få rätt maskin direkt.' },
  { title: 'Orderhantering', desc: 'Skapa, följ upp och avsluta uthyrningsordrar med automatisk prissättning baserat på hyresperiod.' },
  { title: 'Prismallar', desc: 'Definiera prismallar per kategori och kapacitetsintervall som appliceras automatiskt på nya ordrar.' },
  { title: 'Servicehistorik', desc: 'Registrera och följ upp service, reparationer och besiktningar per maskin, med automatiska påminnelser.' },
  { title: 'Lönsamhetsanalys', desc: 'Se ROI, återbetalningstakt och intäktsutveckling per maskin — fatta beslut baserade på data.' },
  { title: 'QR-koder', desc: 'Varje maskin får en unik QR-kod för snabb åtkomst till maskinkort, utlämning och retur i fält.' },
  { title: 'Fortnox-integration', desc: 'Fakturaunderlag förs automatiskt över till Fortnox när en order avslutas — ingen dubbelinmatning.' },
  { title: 'Mobilanpassat', desc: 'Fungerar i webbläsaren på alla enheter — ingen app att installera för dig eller dina kunder.' },
];

const faqs = [
  {
    q: 'Vad är ett affärssystem för maskinuthyrning?',
    a: 'Ett affärssystem för maskinuthyrning är en programvara byggd specifikt för att hantera hela flödet i ett uthyrningsföretag: maskinregister, bokningar, hyresavtal, prissättning per hyresperiod, service och fakturering. Till skillnad från ett generellt bokföringsprogram förstår det begrepp som beläggningsgrad, hyrestid och maskinstatus.',
  },
  {
    q: 'Vad är skillnaden mellan ett maskinuthyrningssystem och ett vanligt bokföringsprogram?',
    a: 'Ett bokföringsprogram hanterar fakturor och redovisning, men saknar stöd för att hantera en rörlig maskinpark — vilken maskin som är uthyrd, till vem, vilket skick den är i och när den ska returneras. FleetOS är byggt för just detta och synkroniserar sedan automatiskt med Fortnox för själva bokföringen.',
  },
  {
    q: 'Vilka typer av maskiner passar FleetOS för?',
    a: 'FleetOS används av företag som hyr ut truckar och gaffeltruckar, byggmaskiner och grävmaskiner samt liftar och skyliftar. Plattformen är kategori-agnostisk — du kan hantera flera maskintyper i samma system.',
  },
  {
    q: 'Kan jag testa FleetOS innan jag bestämmer mig?',
    a: 'Ja, kontakta oss via formuläret på kom igång-sidan så bokar vi en genomgång eller sätter upp ett konto åt dig.',
  },
  {
    q: 'Fungerar FleetOS ihop med Fortnox?',
    a: 'Ja. När en order avslutas och ett fakturaunderlag skapas förs det automatiskt över till Fortnox med rätt artikelnummer och kundnummer — ingen manuell inmatning.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Funktioner – affärssystem för maskinuthyrning',
  url: 'https://fleetos.se/funktioner',
  description: 'FleetOS är affärssystemet byggt specifikt för maskinuthyrning: maskinregister, orderhantering, prismallar och Fortnox-integration.',
  mainEntity: {
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
};

export default function FunktionerPage() {
  return (
    <PublicLayout title="Funktioner">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="text-lg text-slate-500 mb-10">
        FleetOS är ett komplett affärssystem för maskinuthyrning — från registrering av maskinen till att fakturaunderlaget landar i Fortnox. Byggt specifikt för uthyrningsföretag, inte anpassat i efterhand från ett generellt system.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-14">
        {features.map(({ title, desc }) => (
          <div key={title} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </div>

      <h2>Vad skiljer FleetOS från ett generellt affärssystem?</h2>
      <p className="mb-4">
        Traditionella affärssystem och bokföringsprogram är byggda för redovisning — inte för att hantera en rörlig maskinpark. De saknar begrepp som beläggningsgrad, hyresperiod, returstatus, serviceintervall och QR-koder i fält.
      </p>
      <p className="mb-10">
        FleetOS är byggt specifikt för maskinuthyrning. Istället för att du anpassar ett generellt system till din verksamhet är det tvärtom — FleetOS pratar samma språk som din verksamhet, och med Fortnox-integrationen synkroniseras bokföringen automatiskt i bakgrunden.
      </p>

      <h2>Byggt för hela uthyrningsflödet</h2>
      <p className="mb-4">
        Många maskinuthyrare hanterar idag flottan i en kombination av Excel, e-post och handskrivna lappar. Det fungerar när flottan är liten, men skalar inte — en maskin på fel plats, ett missat servicedatum eller en glömd faktura kostar snabbt mer än en systemkostnad.
      </p>
      <p className="mb-10">
        Med FleetOS har du hela flottan i realtid: vilka maskiner är uthyrda, till vem, vilket skick de är i och när de ska tillbaka. Nytt hyresavtal tar minuter, inte timmar.
      </p>

      <h2>Vanliga frågor om affärssystem för maskinuthyrning</h2>
      <div className="not-prose space-y-4 mb-14">
        {faqs.map(({ q, a }) => (
          <div key={q} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-900 mb-2">{q}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>

      <h2>Se FleetOS för din typ av flotta</h2>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link href="/uthyrning/truckar" className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/40 transition-colors group">
          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Truckar och gaffeltruckar →</p>
          <p className="text-xs text-slate-500 mt-1">Motviktstruckar, skjutstativtruckar, ledstaplare</p>
        </Link>
        <Link href="/uthyrning/byggmaskiner" className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/40 transition-colors group">
          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Byggmaskiner och grävmaskiner →</p>
          <p className="text-xs text-slate-500 mt-1">Grävmaskiner, hjullastare, kompaktlastare</p>
        </Link>
        <Link href="/uthyrning/liftar" className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/40 transition-colors group">
          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Liftar och skylift →</p>
          <p className="text-xs text-slate-500 mt-1">Skylift, saxlift, bomlift, teleskoplift</p>
        </Link>
      </div>

      <div className="not-prose flex flex-col sm:flex-row gap-3">
        <Link href="/kom-igang" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
          Boka demo
        </Link>
        <Link href="/priser" className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-colors text-sm">
          Se priser
        </Link>
      </div>
    </PublicLayout>
  );
}
