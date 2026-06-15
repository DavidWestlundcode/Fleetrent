import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Uthyrningssystem för truckar och gaffeltruckar | FleetOS',
  description: 'Digitalt uthyrningssystem för truckuthyrning. Hantera motviktstruckar, skjutstativtruckar och ledstaplare med hyresavtal, fakturering och Fortnox-integration. Prova gratis.',
  keywords: ['uthyrningssystem truckar', 'system gaffeltruckuthyrning', 'truckuthyrning program', 'motviktstruck uthyrning system', 'gaffeltrucks uthyrning mjukvara'],
  alternates: { canonical: 'https://fleetos.se/uthyrning/truckar' },
  openGraph: {
    title: 'Uthyrningssystem för truckar och gaffeltruckar | FleetOS',
    description: 'Digitalt system för truckuthyrning — hyresavtal, fakturering och Fortnox-integration i ett.',
    url: 'https://fleetos.se/uthyrning/truckar',
  },
};

const features = [
  {
    title: 'Maskinregister med fullständig historik',
    desc: 'Varje truck har sin egen sida med hyreshistorik, serviceprotokoll, aktuell status och tekniska specifikationer. Kapacitet, lyfthöjd och bygghöjd lagras och visas direkt på maskinkortet.',
  },
  {
    title: 'Besiktning och servicedatum',
    desc: 'Håll koll på nästa besiktning, säkerhetsinspektioner och underhållsintervall per fordon. Systemet visar när service behövs — innan det bli ett akut problem.',
  },
  {
    title: 'Hyresavtal på minuter',
    desc: 'Välj truck, välj kund, välj period — avtalet är klart. Kunden kan signera digitalt och får en kopia direkt. Inga utskrifter, ingen posthantering.',
  },
  {
    title: 'Kort- och långtidsuthyrning',
    desc: 'Konfigurera dag-, vecko- och månadsavgifter per maskin eller kategori. Faktureringsunderlaget beräknas automatiskt baserat på faktisk hyresperiod.',
  },
  {
    title: 'Integrerat med Fortnox',
    desc: 'Order och belopp förs automatiskt över till Fortnox. Inga manuella beräkningar, ingen dubbelinmatning — fakturaunderlaget är klart direkt.',
  },
  {
    title: 'Synkronisering med Serviceprotokoll',
    desc: 'Importerar maskindata direkt från Serviceprotokoll. Flottans status, serienummer och tekniska data hålls uppdaterade automatiskt.',
  },
  {
    title: 'QR-koder i fält',
    desc: 'Märk truckarna med QR-koder. Starta och avsluta uthyrningar direkt från lagret eller kundstället — utan att behöva gå tillbaka till kontoret.',
  },
  {
    title: 'Beläggningsstatistik och lönsamhet',
    desc: 'Se vilka truckar som genererar mest intäkter, beläggningsgrad per maskin och kommande returer. Fatta beslut baserade på data, inte magkänsla.',
  },
];

const faqs = [
  {
    q: 'Passar FleetOS för alla typer av truckar?',
    a: 'Ja. Systemet hanterar motviktstruckar, skjutstativtruckar, ledstaplare, reachtruckar, åktruckar och plocktruckar. Varje maskintyp kan konfigureras med egna prismallar och tekniska specifikationer som kapacitet, lyfthöjd och bygghöjd.',
  },
  {
    q: 'Kan jag importera mina befintliga maskiner?',
    a: 'Om du använder Serviceprotokoll kan maskinerna importeras automatiskt via vår integration. Annars läggs maskiner till manuellt — det tar några minuter per maskin.',
  },
  {
    q: 'Fungerar systemet med Fortnox?',
    a: 'Ja, vi har en direkt Fortnox-integration. När du avslutar en order och skapar ett fakturaunderlag förs det automatiskt över till Fortnox med rätt artikelnummer, kostnadsställe och kundnummer.',
  },
  {
    q: 'Vad kostar det?',
    a: 'FleetOS prissätts per organisation. Kontakta oss för en offert anpassad efter din flotta och dina behov.',
  },
  {
    q: 'Kan flera användare jobba i systemet samtidigt?',
    a: 'Ja, FleetOS är byggt för team. Du kan bjuda in kollegor med olika roller — administratör eller säljare.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Uthyrningssystem för truckar och gaffeltruckar',
  url: 'https://fleetos.se/uthyrning/truckar',
  description: 'Digitalt uthyrningssystem för truckuthyrning i Sverige. Hantera motviktstruckar, skjutstativtruckar och ledstaplare.',
  mainEntity: {
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
};

export default function TruckarPage() {
  return (
    <PublicLayout title="Uthyrningssystem för truckar och gaffeltruckar">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="text-lg text-slate-500 mb-4">
        Gaffeltruckar, motviktstruckar, skjutstativtruckar — oavsett typ av truck hanterar FleetOS uthyrningen från bokning och avtal till service och fakturering, utan manuellt arbete.
      </p>
      <p className="mb-10 text-slate-500">
        Passar för uthyrningsföretag som hyr ut motviktstruckar, skjutstativtruckar, ledstaplare, reachtruckar, plocktruckar och annan truckmateriel.
      </p>

      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
        {features.map(({ title, desc }) => (
          <div key={title} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-900 mb-1.5">{title}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <h2>Från manuell administration till digitalt flöde</h2>
      <p className="mb-4">
        Truckuthyrning innebär ofta löpande avtal, återkommande kunder och maskiner som rör sig mellan flera kundställen. Utan ett system tappar man lätt kontrollen — vad är uthyrt, till vem, till vilket pris och när ska det tillbaka?
      </p>
      <p className="mb-4">
        Många truckuthyrare arbetar idag med en kombination av Excel-listor, e-post och handskrivna lappar. Det fungerar när flottan är liten, men skalar inte. En maskin på fel ställe, ett glömt servicedatum eller en missad faktura kan kosta mer än ett helt år av systemkostnad.
      </p>
      <p className="mb-10">
        FleetOS ger dig en komplett bild av hela truckflottan i realtid. Ny order tar fem minuter. Fakturaunderlaget är klart automatiskt. Och servicehistoriken finns alltid tillgänglig — oavsett om du är på kontoret eller ute hos kund.
      </p>

      <h2>Vad skiljer FleetOS från ett generellt affärssystem?</h2>
      <p className="mb-4">
        Generella affärssystem som Fortnox och Visma är byggda för bokföring — inte för att hantera en rörlig maskinpark. De saknar begrepp som beläggningsgrad, hyresperiod, returnstatus, serviceintervall och QR-koder.
      </p>
      <p className="mb-10">
        FleetOS är byggt specifikt för maskinuthyrning. Istället för att du anpassar ett generellt system till din verksamhet är det tvärtom — FleetOS pratar samma språk som din verksamhet. Och med Fortnox-integrationen behöver du inte välja: du får specialiserad uthyrningshantering <em>och</em> din bokföring synkroniseras automatiskt.
      </p>

      <h2>Vanliga frågor om uthyrningssystem för truckar</h2>
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
