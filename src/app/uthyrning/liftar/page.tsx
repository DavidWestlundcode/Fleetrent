import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Uthyrningssystem för liftar och skylift | FleetOS',
  description: 'Digitalt uthyrningssystem för liftuthyrning. Hantera skylift, saxlift och bomlift med besiktningshistorik, hyresavtal och Fortnox-integration. Prova gratis.',
  keywords: ['uthyrningssystem skylift', 'system liftuthyrning', 'saxlift uthyrning program', 'bomlift uthyrning system', 'skylift uthyrning mjukvara'],
  alternates: { canonical: 'https://fleetos.se/uthyrning/liftar' },
  openGraph: {
    title: 'Uthyrningssystem för liftar och skylift | FleetOS',
    description: 'Digitalt system för liftuthyrning — besiktningshistorik, hyresavtal och Fortnox-integration i ett.',
    url: 'https://fleetos.se/uthyrning/liftar',
  },
};

const features = [
  {
    title: 'Besiktning och certifikat per lift',
    desc: 'Registrera besiktningsdatum, certifikat och säkerhetsinspektioner direkt på varje lift. Systemet visar vad som behöver förnyas och när — innan giltigheten löper ut.',
  },
  {
    title: 'Snabba hyresavtal',
    desc: 'Skapa ett komplett hyresavtal på några minuter. Kunden kan signera digitalt — klart innan liften lämnar lagret. Inga utskrifter och ingen posthantering.',
  },
  {
    title: 'Kort- och långtidsuthyrning',
    desc: 'Hantera allt från dagshyra till fleråriga löpande avtal med samma system. Sätt individuella priser per lift, kategori och hyresform.',
  },
  {
    title: 'Serviceprotokoll och underhåll',
    desc: 'Koppla serviceåtgärder direkt till respektive lift. All historik finns samlad och sökbar — inget mer letande i pärmar eller e-postkorgar.',
  },
  {
    title: 'QR-koder i fält',
    desc: 'Märk liftarna med QR-koder. Personal och kunder kan skanna för att se aktuell status, avtal och säkerhetsinstruktioner direkt i mobilens webbläsare.',
  },
  {
    title: 'Fakturaunderlag till Fortnox',
    desc: 'Hyresperioder och belopp förs automatiskt till Fortnox. Inga manuella beräkningar, ingen dubbelinmatning — fakturaunderlaget är klart direkt.',
  },
  {
    title: 'Skaderegistrering vid retur',
    desc: 'Registrera skick, drifttimmar och eventuella skador direkt vid återlämning. Ta bilder och lägg till noteringar som sparas på ordern.',
  },
  {
    title: 'Beläggning och lönsamhet',
    desc: 'Se beläggningsgrad per lift, vilka kategorier som hyr mest och intäkter per period. Fatta rätt beslut om flottans sammansättning.',
  },
];

const faqs = [
  {
    q: 'Vilka typer av liftar hanterar FleetOS?',
    a: 'FleetOS hanterar skylift, saxlift, bomlift, teleskoplift, mastvagnslift och annan höjdarbetsutrustning. Varje lifttyp kan konfigureras med egna prismallar och besiktningskrav.',
  },
  {
    q: 'Hur håller systemet koll på besiktningsdatum?',
    a: 'Du registrerar besiktningsdatum och certifikat på varje lift. Systemet visar när nästa besiktning förfaller direkt på maskinkortet. Vi arbetar på automatiska påminnelser.',
  },
  {
    q: 'Kan jag hantera uthyrning med och utan förare?',
    a: 'Ja. Du kan konfigurera ordrar med eller utan förare, lägga till tillbehör och specificera villkor per uthyrning. Allt sparas på ordern.',
  },
  {
    q: 'Fungerar FleetOS med Fortnox?',
    a: 'Ja. Fakturaunderlag med rätt artiklar, kundnummer och kostnadsställen förs automatiskt över till Fortnox när en order avslutas.',
  },
  {
    q: 'Kan jag prova systemet utan att binda upp mig?',
    a: 'Ja, du kan komma igång och testa FleetOS. Kontakta oss för att diskutera era behov och sätta upp ett konto.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Uthyrningssystem för liftar och skylift',
  url: 'https://fleetos.se/uthyrning/liftar',
  description: 'Digitalt uthyrningssystem för liftuthyrning i Sverige. Hantera skylift, saxlift och bomlift med besiktningshistorik och Fortnox-integration.',
  mainEntity: {
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
};

export default function LiftarPage() {
  return (
    <PublicLayout title="Uthyrningssystem för liftar och skylift">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="text-lg text-slate-500 mb-4">
        Skyliftar, saxliftar och bomliftar kräver noggrann dokumentation — besiktningar, certifikat och servicehistorik. FleetOS hanterar det digitalt, tillsammans med hela uthyrningsflödet från bokning till faktura.
      </p>
      <p className="mb-10 text-slate-500">
        Passar för uthyrning av skylift, saxlift, bomlift, teleskoplift, mastvagnslift och annan höjdarbetsutrustning.
      </p>

      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
        {features.map(({ title, desc }) => (
          <div key={title} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-900 mb-1.5">{title}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <h2>Säkerhet och dokumentation på samma ställe</h2>
      <p className="mb-4">
        Liftuthyrning ställer höga krav på dokumentation. Besiktningar måste vara aktuella, certifikat tillgängliga och servicehistorik spårbar. Idag hanteras det på många uthyrningsföretag med en blandning av Excel, e-post och papperspärmar.
      </p>
      <p className="mb-4">
        FleetOS samlar allt digitalt. Varje lift har sin egen sida med komplett historik — besiktningar, serviceåtgärder, hyresperioder och skadenoteringar. Det gör det enkelt att hålla koll på vad som behöver åtgärdas, och att visa dokumentationen om det efterfrågas.
      </p>
      <p className="mb-10">
        Med QR-koder kan dessutom personal och kunder skanna liften på plats och se aktuell status, säkerhetsinstruktioner och vem som har uthyrningsansvaret — direkt i mobilens webbläsare utan att installera någon app.
      </p>

      <h2>Smidig fakturering med Fortnox</h2>
      <p className="mb-4">
        Varje avslutad uthyrning genererar automatiskt ett fakturaunderlag som förs över till Fortnox. Hyresperiod, pris, artikelnummer och kunduppgifter är redan ifyllda — du behöver bara granska och skicka.
      </p>
      <p className="mb-10">
        För löpande hyresavtal stöder FleetOS delfakturering — du kan fakturera var 30:e dag utan att avsluta ordern. Systemet håller koll på vad som redan fakturerats och vad som återstår.
      </p>

      <h2>Vanliga frågor om uthyrningssystem för liftar</h2>
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
        <Link href="/uthyrning/byggmaskiner" className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/40 transition-colors group">
          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">Byggmaskiner och grävmaskiner →</p>
          <p className="text-xs text-slate-500 mt-1">Grävmaskiner, hjullastare, kompaktlastare</p>
        </Link>
      </div>

      <div className="not-prose flex flex-col sm:flex-row gap-3">
        <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
          Boka demo
        </Link>
        <Link href="/funktioner" className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-colors text-sm">
          Se alla funktioner
        </Link>
      </div>
    </PublicLayout>
  );
}
