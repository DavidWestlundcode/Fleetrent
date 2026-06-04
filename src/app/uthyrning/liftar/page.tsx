import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: 'Uthyrningssystem för liftar och skylift | FleetOS',
  description: 'Hantera uthyrning av skylift, saxlift och bomlift med digitala avtal, besiktningshistorik och automatisk fakturering. Prova FleetOS gratis.',
};

const features = [
  {
    title: 'Besiktning och certifikat per lift',
    desc: 'Registrera besiktningsdatum, certifikat och säkerhetsinspektioner direkt på varje lift. Systemet håller koll åt dig.',
  },
  {
    title: 'Snabba hyresavtal',
    desc: 'Skapa ett komplett hyresavtal på under en minut. Kunden signerar digitalt med BankID via Zigned — klart innan liften lämnar lagret.',
  },
  {
    title: 'Kort- och långtidsuthyrning',
    desc: 'Hantera allt från dagshyra till fleråriga leasingavtal med samma system. Sätt individuella priser per lift och hyresform.',
  },
  {
    title: 'Serviceprotokoll och underhåll',
    desc: 'Koppla serviceåtgärder direkt till respektive lift. All historik finns samlad och sökbar — inget mer letande i pärmar.',
  },
  {
    title: 'Skanna med QR i fält',
    desc: 'Märk liftarna med QR-koder. Personal och kunder kan skanna för att se aktuell status, avtal och instruktioner direkt i mobilen.',
  },
  {
    title: 'Fakturaunderlag till Fortnox',
    desc: 'Hyresperioder och belopp förs automatiskt till Fortnox. Ingen dubbelinmatning, inga manuella beräkningar.',
  },
];

export default function LiftarPage() {
  return (
    <PublicLayout title="Uthyrningssystem för liftar och skylift">
      <p className="text-lg text-slate-500 mb-4">
        Skyliftar, saxliftar och bomliftar kräver noggrann dokumentation — besiktningar, certifikat och servicehistorik. FleetOS hanterar det digitalt, tillsammans med hela uthyrningsflödet.
      </p>
      <p className="mb-10 text-slate-500">
        Passar för uthyrning av skylift, saxlift, bomlift, teleskoplift och annan höjdarbetsutrustning.
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
      <p className="mb-10">
        FleetOS samlar allt digitalt. Varje lift har sin egen sida med komplett historik, och systemet gör det enkelt att hålla koll på vad som behöver åtgärdas — innan det blir ett problem.
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
