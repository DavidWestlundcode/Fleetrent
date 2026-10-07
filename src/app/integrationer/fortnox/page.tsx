import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import JsonLd from '@/components/public/JsonLd';
import PageCta, { FaqList, LinkCards } from '@/components/public/PageCta';
import { faqJsonLd, pageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  path: '/integrationer/fortnox',
  title: 'Uthyrningssystem med Fortnox-integration',
  description: 'Skicka uthyrningsordrar och delfakturor från FleetOS till Fortnox med hyresrader, artikelnummer, kundnummer och kostnadsställe. Så fungerar integrationen.',
});

// Everything below mirrors src/app/api/fortnox/create-order and create-partial-invoice —
// keep it in sync if the integration changes.
const SENT_FIELDS = [
  { field: 'Kund', desc: 'Kundnumret i Fortnox. Finns kunden inte där skapas den automatiskt med namn, organisationsnummer, e-post, telefon och fakturaadress, och kundnumret sparas i FleetOS.' },
  { field: 'Hyresrader', desc: 'Hyresperioden prissatt enligt orderns dag-, vecko- eller månadspris, med eventuell rabatt och artikelnumret från ert artikelregister.' },
  { field: 'Tillägg', desc: 'Försäkring, transport och andra artiklar på ordern som egna rader med antal, enhet, pris och rabatt.' },
  { field: 'Referenser', desc: 'FleetOS-ordernumret som vår referens, kundens ordernummer och beställarens namn som er referens.' },
  { field: 'Kostnadsställe', desc: 'Kostnadsstället som är kopplat till användaren som skickar ordern.' },
];

const faqs = [
  {
    q: 'Skapar FleetOS fakturor direkt i Fortnox?',
    a: 'FleetOS skapar en order i Fortnox med alla rader ifyllda. Själva faktureringen görs sedan i Fortnox, så att ni behåller er vanliga rutin för granskning, utskick och bokföring.',
  },
  {
    q: 'Hämtar FleetOS kunder eller artiklar från Fortnox?',
    a: 'Nej. Integrationen går från FleetOS till Fortnox. Kunder som saknas i Fortnox skapas när den första ordern skickas, och artikelnumren anges i FleetOS artikelregister så att de matchar era artiklar i Fortnox.',
  },
  {
    q: 'Skickas ordern automatiskt när maskinen kommer tillbaka?',
    a: 'Nej, ni skickar ordern till Fortnox med en knapp på ordern när den är klar för fakturering. För avtalshyra skapas delfakturor automatiskt vid månadsskiftet, men de granskas och skickas manuellt.',
  },
  {
    q: 'Hur ansluter jag Fortnox?',
    a: 'Ni ansluter Fortnox under Inställningar i FleetOS och godkänner behörigheten i Fortnox. Kopplingen kan tas bort på samma ställe.',
  },
  {
    q: 'Vi använder ett annat ekonomisystem. Fungerar FleetOS ändå?',
    a: 'Fortnox är den ekonomiintegration som finns i dag. En Visma-integration är planerad men inte klar. Kontakta oss om ni använder ett annat system, så berättar vi vad som går att anpassa.',
  },
];

export default function FortnoxPage() {
  return (
    <PublicLayout
      title="Uthyrningssystem med Fortnox-integration"
      breadcrumbs={[{ name: 'Integrationer', path: '/integrationer' }, { name: 'Fortnox', path: '/integrationer/fortnox' }]}
    >
      <JsonLd data={faqJsonLd(faqs)} />

      <p className="text-lg text-slate-500 mb-10">
        Med Fortnox-integrationen blir en avslutad uthyrningsorder i FleetOS en färdig order i Fortnox, med rätt kund, hyresrader, artikelnummer och kostnadsställe. Ni slipper skriva av hyresperioder och tillägg för hand innan ni fakturerar.
      </p>

      <h2>Vad som skickas till Fortnox</h2>
      <div className="not-prose mb-10 border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
        {SENT_FIELDS.map(({ field, desc }) => (
          <div key={field} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-1 sm:gap-4 p-4">
            <p className="text-sm font-semibold text-slate-900">{field}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <h2>Riktning: från FleetOS till Fortnox</h2>
      <p className="mb-4">
        Integrationen är enkelriktad. FleetOS är platsen där maskiner, kunder, priser och hyresperioder hanteras, och Fortnox tar emot det som ska faktureras. FleetOS läser inte tillbaka betalstatus, kundregister eller artiklar från Fortnox.
      </p>
      <p className="mb-10">
        Det innebär att ekonomi kan fortsätta arbeta i Fortnox som vanligt, medan uthyrningen sköter avtal, utlämning och retur i FleetOS.
      </p>

      <h2>Så går det till</h2>
      <ol>
        <li><strong>Anslut Fortnox.</strong> Koppla kontot under Inställningar och godkänn behörigheten i Fortnox.</li>
        <li><strong>Koppla artiklar.</strong> Ange samma artikelnummer i FleetOS artikelregister som i Fortnox, till exempel för hyra, försäkring och transport.</li>
        <li><strong>Avsluta ordern.</strong> När maskinen är returnerad och ordern är klar för fakturering klickar ni på Skicka till Fortnox.</li>
        <li><strong>Fakturera i Fortnox.</strong> Ordern finns nu i Fortnox med alla rader och kan granskas och faktureras enligt er vanliga rutin.</li>
      </ol>

      <h2>Avtalshyra och delfakturor</h2>
      <p className="mb-4">
        För långtidsuthyrning med avtalshyra skapar FleetOS automatiskt en delfaktura för varje aktiv order den sista dagen i månaden. Delfakturorna samlas i en lista där ni granskar beloppen och skickar dem till Fortnox, en i taget eller flera samtidigt.
      </p>
      <p className="mb-10">
        Tillägg som transport och försäkring kan ställas in att faktureras på första fakturan, på varje faktura eller först på slutfakturan. När ordern avslutas räknar slutfakturan bort de dagar som redan har fakturerats.
      </p>

      <h2>Vanliga frågor om Fortnox-integrationen</h2>
      <FaqList faqs={faqs} />

      <h2>Läs mer</h2>
      <LinkCards links={[
        { href: '/integrationer/serviceprotokoll', title: 'Serviceprotokoll-integration', desc: 'Importera maskiner och kunder automatiskt' },
        { href: '/kunder/wts-machinery-solutions', title: 'Kundcase: WTS Machinery Solutions', desc: 'Så används Fortnox-flödet och avtalshyran' },
        { href: '/uthyrning/truckar', title: 'Uthyrningssystem för truckar', desc: 'Långtidshyra och avtalsfakturering' },
        { href: '/uthyrning/byggmaskiner', title: 'Uthyrningssystem för byggmaskiner', desc: 'Korta hyror, transport och tillbehör' },
      ]} />

      <PageCta heading="Se Fortnox-flödet i en demo" text="Vi visar hur en order går från bokning till retur och vidare till Fortnox, och hur avtalshyrans delfakturor fungerar." />
    </PublicLayout>
  );
}
