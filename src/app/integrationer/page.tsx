import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import PageCta from '@/components/public/PageCta';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  path: '/integrationer',
  title: 'Integrationer – Fortnox, Serviceprotokoll och e-signering',
  description: 'Se vilka integrationer FleetOS har i dag: Fortnox, Serviceprotokoll och e-signering av hyresavtal. Visma är planerad och andra kopplingar kan specialanpassas.',
});

const AVAILABLE = [
  {
    name: 'Fortnox',
    href: '/integrationer/fortnox',
    direction: 'FleetOS → Fortnox',
    desc: 'Avslutade ordrar och delfakturor för avtalshyra skickas till Fortnox som ordrar med kund, hyresrader, artikelnummer och kostnadsställe.',
  },
  {
    name: 'Serviceprotokoll',
    href: '/integrationer/serviceprotokoll',
    direction: 'Serviceprotokoll → FleetOS',
    desc: 'Hyresmaskiner med tekniska data samt kunder, anläggningar och kontakter hämtas automatiskt var 30:e minut.',
  },
  {
    name: 'E-signering (Zigned)',
    href: null,
    direction: 'FleetOS → kund → FleetOS',
    desc: 'Hyresavtalet skickas från ordern till kunden för digital signering. Signeringsstatus följs upp i FleetOS och det signerade avtalet kan laddas ned från ordern. En rörlig kostnad tillkommer per skickat avtal.',
  },
];

export default function IntegrationerPage() {
  return (
    <PublicLayout title="Integrationer" breadcrumbs={[{ name: 'Integrationer', path: '/integrationer' }]}>
      <p className="text-lg text-slate-500 mb-10">
        FleetOS är byggt för att ta hand om uthyrningen, inte för att ersätta ert ekonomisystem eller ert serviceverktyg. Integrationerna gör att maskiner, kunder och fakturaunderlag inte behöver föras in på flera ställen.
      </p>

      <h2>Tillgängliga i dag</h2>
      <div className="not-prose space-y-4 mb-10">
        {AVAILABLE.map(({ name, href, direction, desc }) => (
          <div key={name} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="text-[15px] font-semibold text-slate-900">{name}</h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Tillgänglig</span>
              <span className="text-[12px] text-slate-400">{direction}</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            {href && (
              <Link href={href} className="inline-block mt-3 text-sm font-medium text-blue-600 hover:underline">
                Så fungerar {name}-integrationen →
              </Link>
            )}
          </div>
        ))}
      </div>

      <h2>Planerade</h2>
      <p className="mb-4">
        En integration mot <strong>Visma</strong> och ett öppet <strong>API</strong> för egna system finns på vår <Link href="/roadmap">roadmap</Link>. De är inte tillgängliga ännu, och vi lovar inga datum förrän de är klara att använda.
      </p>

      <h2>Specialanpassningar</h2>
      <p className="mb-10">
        Använder ni ett annat ekonomisystem, ett GPS-system eller något annat verktyg som ni vill koppla till FleetOS? Berätta vad ni behöver, så bedömer vi tillsammans om och hur det går att lösa.
      </p>

      <PageCta
        heading="Vill ni se integrationerna i praktiken?"
        text="Boka en demo så går vi igenom hur FleetOS passar ihop med de system ni redan använder."
        secondary={{ label: 'Se alla funktioner', href: '/funktioner' }}
      />
    </PublicLayout>
  );
}
