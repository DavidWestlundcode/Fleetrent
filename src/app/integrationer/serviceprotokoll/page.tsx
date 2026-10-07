import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import JsonLd from '@/components/public/JsonLd';
import PageCta, { FaqList, LinkCards } from '@/components/public/PageCta';
import { faqJsonLd, pageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  path: '/integrationer/serviceprotokoll',
  title: 'Serviceprotokoll-integration för maskinuthyrning',
  description: 'Importera hyresmaskiner, tekniska data, kunder, anläggningar och kontakter från Serviceprotokoll till FleetOS. Automatisk synk var 30:e minut.',
});

// Mirrors src/app/api/serviceprotokoll/sync — keep in sync if the integration changes.
const faqs = [
  {
    q: 'Vilka maskiner importeras?',
    a: 'Serviceobjekt som är taggade som uthyrningsbara i Serviceprotokoll, samt de objekt som är kopplade till ert eget kundnummer där. Nya maskiner läggs in med status i lager.',
  },
  {
    q: 'Skriver FleetOS något tillbaka till Serviceprotokoll?',
    a: 'Nej. Synken hämtar data från Serviceprotokoll till FleetOS. Order, avtal, priser och returer finns bara i FleetOS.',
  },
  {
    q: 'Skrivs mina egna anteckningar över vid synken?',
    a: 'Nej. För kunder uppdateras bara de fält som kommer från Serviceprotokoll. Uppgifter ni lagt in i FleetOS, som anteckningar och kreditgräns, lämnas orörda.',
  },
  {
    q: 'Vad händer om en maskin tas bort i Serviceprotokoll?',
    a: 'En maskin som inte längre är kopplad till ert kundnummer tas bort från FleetOS endast om den saknar order. Maskiner med orderhistorik ligger kvar. Om svaret från Serviceprotokoll ser ofullständigt ut tas ingenting bort.',
  },
  {
    q: 'Hur kommer jag igång?',
    a: 'Ni behöver en integrationsnyckel från Serviceprotokoll. Vi hjälper er att lägga in den och köra den första synken.',
  },
];

export default function ServiceprotokollPage() {
  return (
    <PublicLayout
      title="Serviceprotokoll-integration för maskinuthyrning"
      breadcrumbs={[{ name: 'Integrationer', path: '/integrationer' }, { name: 'Serviceprotokoll', path: '/integrationer/serviceprotokoll' }]}
    >
      <JsonLd data={faqJsonLd(faqs)} />

      <p className="text-lg text-slate-500 mb-10">
        Använder ni Serviceprotokoll för service och kontroller av maskinerna? Då behöver ni inte bygga upp maskinregistret och kundregistret en gång till i FleetOS. Integrationen hämtar hyresmaskiner och kunder åt er och håller dem uppdaterade.
      </p>

      <h2>Vad som hämtas från Serviceprotokoll</h2>
      <h3>Maskiner</h3>
      <p className="mb-4">
        Namn, fabrikat, modell, serienummer och internt nummer, plus tekniska uppgifter från objektets egna fält: kategori, drivmedel, årsmodell, kapacitet, lyfthöjd, bygghöjd, gaffellängd, stativ, aggregat, hytt och vikt. Om en uppgift rättas i Serviceprotokoll följer rättelsen med vid nästa synk.
      </p>
      <h3>Kunder</h3>
      <p className="mb-10">
        Företagsnamn, organisationsnummer, fakturamejl, telefon och leveransadress, samt kundens anläggningar med tillhörande kontaktpersoner. Nya kunder läggs till och befintliga uppdateras stegvis sedan den senaste synken.
      </p>

      <h2>Riktning och schema</h2>
      <p className="mb-4">
        Integrationen går från Serviceprotokoll till FleetOS och körs automatiskt var 30:e minut. Ni kan också starta en synk manuellt när ni har lagt till en ny maskin och vill ha den direkt.
      </p>
      <p className="mb-10">
        FleetOS skriver inte tillbaka något till Serviceprotokoll. Serviceprotokoll är fortsatt källan för maskinernas identitet och tekniska data, och FleetOS ansvarar för uthyrningen: order, hyresavtal, utlämning, retur och fakturaunderlag.
      </p>

      <h2>Varför det spelar roll för en uthyrare</h2>
      <ul>
        <li>Maskinregistret behöver bara underhållas på ett ställe, och serienummer och tekniska data stämmer i båda systemen.</li>
        <li>Säljaren ser kapacitet, lyfthöjd och andra mått direkt i FleetOS när en kund frågar efter en maskin.</li>
        <li>Kundernas anläggningar och kontaktpersoner finns redan på plats när ordern skapas.</li>
        <li>Skyddsregler förhindrar att maskiner med orderhistorik försvinner om något ändras i Serviceprotokoll.</li>
      </ul>

      <h2>Vanliga frågor om Serviceprotokoll-integrationen</h2>
      <FaqList faqs={faqs} />

      <h2>Läs mer</h2>
      <LinkCards links={[
        { href: '/integrationer/fortnox', title: 'Fortnox-integration', desc: 'Från avslutad order till order i Fortnox' },
        { href: '/kunder/wts-machinery-solutions', title: 'Kundcase: WTS Machinery Solutions', desc: 'Serviceprotokoll och FleetOS i samma flöde' },
        { href: '/uthyrning/truckar', title: 'Uthyrningssystem för truckar', desc: 'Kapacitet, lyfthöjd och stativ på maskinkortet' },
        { href: '/uthyrning/liftar', title: 'Uthyrningssystem för liftar', desc: 'Besiktning, service och retur' },
      ]} />

      <PageCta heading="Har ni redan maskinerna i Serviceprotokoll?" text="Boka en genomgång så visar vi hur importen fungerar och vad som krävs för att komma igång." />
    </PublicLayout>
  );
}
