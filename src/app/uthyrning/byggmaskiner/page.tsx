import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: 'Uthyrningssystem för byggmaskiner och grävmaskiner | FleetOS',
  description: 'Hantera hela flottan av byggmaskiner och grävmaskiner i ett system. Hyresavtal, servicehistorik, digital signering och fakturering — utan papper.',
};

const features = [
  {
    title: 'Maskinöversikt i realtid',
    desc: 'Se hela flottan på ett ställe — vilka maskiner som är uthyrda, när de återlämnas och vilka som behöver service. Aldrig mer manuella listor i kalkylblad.',
  },
  {
    title: 'Servicehistorik per maskin',
    desc: 'Koppla serviceprotokoll direkt till varje grävmaskin eller hjullastare. Håll koll på underhållsintervall och ha all dokumentation samlad.',
  },
  {
    title: 'Digitala hyresavtal med e-signering',
    desc: 'Skapa och skicka hyresavtal direkt från systemet. Kunden signerar digitalt — inga utskrifter, ingen posthantering.',
  },
  {
    title: 'Flexibla hyreskonfigurationer',
    desc: 'Sätt dag-, vecko- och månadspriser per maskin. Hantera depositioner, tillbehör och extra utrustning utan att behöva hålla reda på det manuellt.',
  },
  {
    title: 'Fakturaunderlag automatiskt',
    desc: 'Systemet räknar ut hyresbelopp baserat på faktisk hyresperiod och exporterar underlaget direkt till Fortnox.',
  },
  {
    title: 'QR-koder för snabb identifiering',
    desc: 'Märk maskinerna med QR-koder. Skanna på byggarbetsplatsen för att se maskinens status, avtal och servicehistorik direkt i mobilen.',
  },
];

export default function ByggnadsmaskinPage() {
  return (
    <PublicLayout title="Uthyrningssystem för byggmaskiner">
      <p className="text-lg text-slate-500 mb-4">
        Byggmaskiner och grävmaskiner kräver mer än ett kalkylblad. FleetOS är byggt för uthyrningsföretag som vill ha full kontroll — från bokning och avtal till service och fakturering.
      </p>
      <p className="mb-10 text-slate-500">
        Passar för uthyrning av grävmaskiner, hjullastare, dumprar, kompaktlastare och annan tung entreprenadmaskiner.
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
      <p className="mb-10">
        FleetOS samlar allt i ett system som är tillgängligt var du än befinner dig. Ny order på 5 minuter. Avtal signerat innan maskinen lämnar depån. Servicehistorik direkt i mobilen på arbetsplatsen.
      </p>

      <div className="not-prose flex flex-col sm:flex-row gap-3">
        <Link
          href="/kom-igang"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Starta gratis testperiod
        </Link>
        <Link
          href="/funktioner"
          className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-colors text-sm"
        >
          Se alla funktioner
        </Link>
      </div>
    </PublicLayout>
  );
}
