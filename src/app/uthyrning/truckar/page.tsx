import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: 'Uthyrningssystem för truckar och gaffeltruckar | FleetOS',
  description: 'Administrera uthyrning av truckar och gaffeltruckar effektivt. Hyresavtal, serviceprotokoll, certifikathantering och automatisk fakturering i ett system.',
};

const features = [
  {
    title: 'Fordonsregister med fullständig historik',
    desc: 'Varje truck har sin egen sida med hyreshistorik, serviceprotokoll och aktuell status. Allt tillgängligt direkt — utan att gräva i pärmar.',
  },
  {
    title: 'Certifikat och besiktningsdatum',
    desc: 'Håll koll på nästa besiktning, säkerhetsinspektioner och förardokumentation per fordon. Missa aldrig ett datum.',
  },
  {
    title: 'Hyresavtal på minuter',
    desc: 'Välj truck, välj kund, välj period — avtalet är klart. Kunden signerar digitalt och får en kopia direkt till sin e-post.',
  },
  {
    title: 'Kort- och långtidsuthyrning',
    desc: 'Konfigurera dag-, vecko- och månadsavgifter. Faktureringsunderlaget genereras automatiskt baserat på faktisk hyresperiod.',
  },
  {
    title: 'Integrerat med Fortnox',
    desc: 'Order och belopp förs automatiskt över till Fortnox. Slipp dubbelinmatning och manuell fakturahantering.',
  },
  {
    title: 'Tillgängligt i mobilen',
    desc: 'Starta och avsluta uthyrningar direkt från lagret eller kundstället. Inget behov av att gå tillbaka till kontoret.',
  },
];

export default function TruckarPage() {
  return (
    <PublicLayout title="Uthyrningssystem för truckar">
      <p className="text-lg text-slate-500 mb-4">
        Gaffeltruckar, motviktstruck, skjutstativtruck — oavsett typ av truck hanterar FleetOS uthyrningen från start till faktura, utan manuellt arbete.
      </p>
      <p className="mb-10 text-slate-500">
        Passar för uthyrning av motviktstruckar, skjutstativtruckar, ledstaplare, reachtruckar och annan truckmateriel.
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
        Truckuthyrning innebär ofta löpande avtal, återkommande kunder och maskiner som rör sig mellan flera ställen. Utan ett system tappar man lätt kontrollen över vad som är uthyrt, till vem och till vilket pris.
      </p>
      <p className="mb-10">
        FleetOS ger dig en komplett bild av flottan i realtid och automatiserar det administrativa arbetet — från avtal och signering till fakturering och serviceuppföljning.
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
