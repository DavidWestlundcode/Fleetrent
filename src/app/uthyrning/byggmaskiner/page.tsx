import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Uthyrningssystem för byggmaskiner och grävmaskiner | FleetOS',
  description: 'Digitalt uthyrningssystem för byggmaskiner. Hantera grävmaskiner, hjullastare och kompaktlastare med hyresavtal, servicehistorik och Fortnox-integration. Prova gratis.',
  keywords: ['uthyrningssystem byggmaskiner', 'system grävmaskinuthyrning', 'hjullastare uthyrning program', 'byggmaskiner hyra system', 'maskinuthyrning bygg mjukvara'],
  alternates: { canonical: 'https://fleetos.se/uthyrning/byggmaskiner' },
  openGraph: {
    title: 'Uthyrningssystem för byggmaskiner och grävmaskiner | FleetOS',
    description: 'Digitalt system för byggmaskinuthyrning — hyresavtal, servicehistorik och Fortnox-integration i ett.',
    url: 'https://fleetos.se/uthyrning/byggmaskiner',
  },
};

const features = [
  {
    title: 'Maskinöversikt i realtid',
    desc: 'Se hela flottan på ett ställe — vilka maskiner som är uthyrda, när de återlämnas och vilka som behöver service. Aldrig mer manuella listor i kalkylblad.',
  },
  {
    title: 'Servicehistorik och underhåll',
    desc: 'Koppla serviceprotokoll direkt till varje grävmaskin eller hjullastare. Håll koll på underhållsintervall och ha all dokumentation samlad och sökbar.',
  },
  {
    title: 'Hyresavtal på minuter',
    desc: 'Skapa ett komplett hyresavtal på under en minut. Kunden kan signera digitalt — inga utskrifter, ingen posthantering, allt lagras i systemet.',
  },
  {
    title: 'Flexibla hyreskonfigurationer',
    desc: 'Sätt dag-, vecko- och månadspriser per maskin eller kategori. Hantera depositioner, tillbehör och extra utrustning utan att hålla reda på det manuellt.',
  },
  {
    title: 'Automatisk fakturering till Fortnox',
    desc: 'Systemet räknar ut hyresbelopp baserat på faktisk hyresperiod och exporterar underlaget direkt till Fortnox med rätt artiklar och kostnadsställen.',
  },
  {
    title: 'QR-koder på byggarbetsplatsen',
    desc: 'Märk maskinerna med QR-koder. Skanna på byggarbetsplatsen för att se maskinens status, avtal och servicehistorik direkt i mobilen.',
  },
  {
    title: 'AI-igenkänning av maskindata',
    desc: 'Fotografera typskylten på en ny maskin och låt AI fylla i märke, modell och serienummer automatiskt. Spara tid vid registrering av nya maskiner i flottan.',
  },
  {
    title: 'Beläggningsstatistik',
    desc: 'Följ beläggningsgraden per maskin, se ROI och intäktsutveckling. Identifiera vilka maskiner som genererar mest och vilka som stands still för länge.',
  },
];

const faqs = [
  {
    q: 'Vilka typer av byggmaskiner hanterar FleetOS?',
    a: 'FleetOS hanterar alla typer av byggmaskiner — grävmaskiner, hjullastare, kompaktlastare, dumprar, teleskoplastare, minilastare och annan tung entreprenadmaskiner. Varje maskintyp kan ha egna prismallar och tekniska specifikationer.',
  },
  {
    q: 'Kan jag hålla koll på var maskinerna befinner sig?',
    a: 'Systemet registrerar vilket kundställe eller anläggning varje maskin är på via ordersystemet. Vi arbetar på GPS-integration för realtidspositionering — kontakta oss om det är viktigt för dig.',
  },
  {
    q: 'Hur hanteras skador vid återlämning?',
    a: 'När en maskin återlämnas kan du registrera skicket, notera eventuella skador, ta bilder och logga drifttimmar. Allt sparas på ordern och maskinkortet.',
  },
  {
    q: 'Fungerar systemet med Fortnox?',
    a: 'Ja, vi har en direkt Fortnox-integration. Fakturaunderlag förs automatiskt över till Fortnox med rätt artikelnummer, kundnummer och kostnadsställe.',
  },
  {
    q: 'Kan jag ha löpande hyresavtal utan slutdatum?',
    a: 'Ja. FleetOS stöder öppna avtal där hyresperioden beräknas vid retur. Perfekt för långtidsuthyrning och abonnemang.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Uthyrningssystem för byggmaskiner och grävmaskiner',
  url: 'https://fleetos.se/uthyrning/byggmaskiner',
  description: 'Digitalt uthyrningssystem för byggmaskiner i Sverige. Hantera grävmaskiner, hjullastare och kompaktlastare.',
  mainEntity: {
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
};

export default function ByggnadsmaskinPage() {
  return (
    <PublicLayout title="Uthyrningssystem för byggmaskiner och grävmaskiner">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="text-lg text-slate-500 mb-4">
        Grävmaskiner, hjullastare, kompaktlastare — byggmaskiner kräver mer än ett kalkylblad. FleetOS är byggt för uthyrningsföretag som vill ha full kontroll, från bokning och avtal till service och fakturering.
      </p>
      <p className="mb-10 text-slate-500">
        Passar för uthyrning av grävmaskiner, hjullastare, dumprar, kompaktlastare, teleskoplastare och annan tung entreprenadmaskiner.
      </p>

      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
        {features.map(({ title, desc }) => (
          <div key={title} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-900 mb-1.5">{title}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <h2>Varför maskinuthyrare väljer FleetOS</h2>
      <p className="mb-4">
        De flesta uthyrningsföretag inom bygg hanterar idag bokningar via telefon, avtal via e-post och service via separata anteckningar. Det fungerar — tills flottan växer, personalen byts ut eller kunden ringer och frågar om en maskin som ingen vet var den är.
      </p>
      <p className="mb-4">
        FleetOS samlar allt i ett system som är tillgängligt var du än befinner dig. Ny order på fem minuter. Avtal klart innan maskinen lämnar depån. Servicehistorik direkt i mobilen på arbetsplatsen.
      </p>
      <p className="mb-10">
        Med AI-igenkänning av maskindata kan du också fotografera typskylten på en ny maskin och få märke, modell och serienummer ifyllda automatiskt — istället för att skriva in allt för hand.
      </p>

      <h2>Integration med dina befintliga system</h2>
      <p className="mb-4">
        FleetOS ersätter inte din bokföring — det kompletterar den. Med Fortnox-integrationen förs fakturaunderlag automatiskt över när en uthyrning avslutas. Rätt artiklar, rätt kund, rätt belopp — utan att du behöver göra något manuellt.
      </p>
      <p className="mb-10">
        Använder du Serviceprotokoll för servicehistorik? Maskindata och kunduppgifter importeras automatiskt och hålls synkroniserade. Slipp dubbel registrering i två system.
      </p>

      <h2>Vanliga frågor om uthyrningssystem för byggmaskiner</h2>
      <div className="not-prose space-y-4 mb-14">
        {faqs.map(({ q, a }) => (
          <div key={q} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-900 mb-2">{q}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>

      <h2>Läs mer om FleetOS för andra maskintyper</h2>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link href="/uthyrning/truckar" className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/40 transition-colors group">
          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Truckar och gaffeltruckar →</p>
          <p className="text-xs text-slate-500 mt-1">Motviktstruckar, skjutstativtruckar, ledstaplare</p>
        </Link>
        <Link href="/uthyrning/liftar" className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/40 transition-colors group">
          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Liftar och skylift →</p>
          <p className="text-xs text-slate-500 mt-1">Skylift, saxlift, bomlift, teleskoplift</p>
        </Link>
      </div>

      <div className="not-prose flex flex-col sm:flex-row gap-3">
        <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
          Kom igång gratis
        </Link>
        <Link href="/funktioner" className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-colors text-sm">
          Se alla funktioner
        </Link>
      </div>
    </PublicLayout>
  );
}
