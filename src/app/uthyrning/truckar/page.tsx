import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import JsonLd from '@/components/public/JsonLd';
import PageCta, { FaqList, LinkCards } from '@/components/public/PageCta';
import { faqJsonLd, pageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  path: '/uthyrning/truckar',
  title: 'Uthyrningssystem för truckar och gaffeltruckar',
  description: 'Uthyrningssystem för truckuthyrare: tekniska data per truck, prismallar per kapacitet, avtalshyra med månadsvisa delfakturor, QR-retur och Fortnox.',
});

const steps = [
  { title: 'Hitta rätt truck', desc: 'Sök i flottan på det kunden frågar efter, till exempel en eldriven motviktstruck för 2,5 ton med en viss lyfthöjd. Kapacitet, lyfthöjd, bygghöjd, gaffellängd, frilyft, stativ och drivmedel finns på maskinkortet.' },
  { title: 'Pris från prismallen', desc: 'Prismallar per kategori och kapacitetsintervall fyller i dag-, vecko- och månadspris på ordern. Rabatter sätts per prisnivå.' },
  { title: 'Avtal och leveransställe', desc: 'Välj kundens anläggning och beställare. Hyresavtalet skapas från ordern och kan skickas för digital signering.' },
  { title: 'Utlämning med QR-kod', desc: 'Skanna truckens QR-kod och registrera utlämningen med drifttimmar. Ordern och maskinens status uppdateras direkt.' },
  { title: 'Retur och kontroll', desc: 'Vid retur registreras drifttimmar, skick, foton och vilka tillbehör som kom tillbaka. En skadad truck går direkt till service i stället för tillbaka i lager.' },
  { title: 'Fakturaunderlag', desc: 'Korttidshyran skickas till Fortnox när ordern är klar. Långtidshyror faktureras månadsvis via avtalshyra.' },
];

const faqs = [
  {
    q: 'Kan FleetOS hantera långtidshyra av truckar?',
    a: 'Ja. En order kan markeras som avtalshyra utan fast slutdatum. FleetOS skapar då en delfaktura för varje månad, som ni granskar och skickar till Fortnox. När trucken lämnas tillbaka räknar slutfakturan bort redan fakturerade dagar.',
  },
  {
    q: 'Vilka trucktyper finns som kategorier?',
    a: 'Motviktstruck, skjutstativtruck, ledstaplare och teleskoplastare finns som egna kategorier. Övriga typer, till exempel plocktruckar, kan läggas upp under övrigt med egen benämning.',
  },
  {
    q: 'Kan vi hyra ut med eller utan helgdebitering?',
    a: 'Ja. Per order väljer ni om helger ska debiteras. Är helgdebitering avstängd räknas bara vardagar, och svenska helgdagar räknas bort automatiskt. Vecko- och månadspriset tillämpas när hyresperioden når de nivåerna.',
  },
  {
    q: 'Hur håller vi koll på laddare och andra tillbehör?',
    a: 'Tillbehör läggs till som artiklar på ordern. Vid retur bockar ni av vilka som kom tillbaka och vilka som saknas, och det sparas på ordern.',
  },
  {
    q: 'Vi har maskinerna i Serviceprotokoll. Måste vi lägga in dem igen?',
    a: 'Nej. Med Serviceprotokoll-integrationen hämtas hyrestruckarna med tekniska data automatiskt, och de hålls uppdaterade var 30:e minut.',
  },
];

export default function TruckarPage() {
  return (
    <PublicLayout
      title="Uthyrningssystem för truckar och gaffeltruckar"
      breadcrumbs={[{ name: 'Truckar', path: '/uthyrning/truckar' }]}
    >
      <JsonLd data={faqJsonLd(faqs)} />

      <p className="text-lg text-slate-500 mb-4">
        FleetOS är ett uthyrningssystem för företag som hyr ut motviktstruckar, skjutstativtruckar, ledstaplare och annan truckmateriel. Systemet följer varje truck från förfrågan och avtal till utlämning, retur och fakturaunderlag.
      </p>
      <p className="mb-10 text-slate-500 text-sm">
        FleetOS är programvara för uthyrningsföretag. Vill du hyra en truck? Kontakta en truckuthyrare nära dig.
      </p>

      <h2>Det som gör truckuthyrning speciell</h2>
      <p className="mb-4">
        Truckar hyrs ofta ut på längre avtal, ibland i flera år, till kunder med flera anläggningar. Kunden frågar sällan efter en viss maskin utan efter en kapacitet, en lyfthöjd eller ett drivmedel. Och samma truck kan komma tillbaka med en laddare för lite eller med fler drifttimmar än avtalet räknade med.
      </p>
      <p className="mb-10">
        I ett kalkylblad blir det svårt att se vilka truckar som passar en förfrågan, vilka avtal som ska faktureras den här månaden och vad som faktiskt kom tillbaka. FleetOS samlar de uppgifterna på maskinkortet och ordern.
      </p>

      <h2>Från förfrågan till faktura</h2>
      <ol>
        {steps.map(({ title, desc }) => (
          <li key={title}><strong>{title}.</strong> {desc}</li>
        ))}
      </ol>

      <h2>Funktioner som truckuthyrare använder mest</h2>
      <ul>
        <li><strong>Tekniska data per truck</strong>, inklusive stativ, aggregat och hytt, så att säljaren kan svara kunden direkt.</li>
        <li><strong>Avtalshyra</strong> med automatiska månadsvisa delfakturor och tillägg som kan faktureras en gång eller varje månad.</li>
        <li><strong>Lönsamhet per truck</strong> utifrån intäkter och kostnader som inköp, leasing, finansiering, försäkring och service.</li>
        <li><strong>Servicehistorik</strong> med periodisk service, reparationer, besiktningar och kontroller på varje truck.</li>
        <li><strong>Användarroller</strong> för admin, säljare och verkstad, så att kontor, säljare och verkstad arbetar i samma system.</li>
      </ul>
      <p className="mb-10">
        Se hela listan på <Link href="/funktioner">funktionssidan</Link>.
      </p>

      <h2>Integrationer</h2>
      <p className="mb-10">
        Med <Link href="/integrationer/fortnox">Fortnox-integrationen</Link> blir ordrar och delfakturor ordrar i Fortnox med rätt kund, artikelnummer och kostnadsställe. Med <Link href="/integrationer/serviceprotokoll">Serviceprotokoll-integrationen</Link> hämtas hyrestruckar, kunder och anläggningar automatiskt.
      </p>

      <h2>Kundcase: WTS Machinery Solutions</h2>
      <p className="mb-10">
        WTS Machinery Solutions är en totalleverantör inom materialhantering och använder FleetOS för sin truckuthyrning, med avtalshyra, Fortnox och Serviceprotokoll. <Link href="/kunder/wts-machinery-solutions">Läs hur WTS använder FleetOS</Link>.
      </p>

      <h2>Vanliga frågor om uthyrningssystem för truckar</h2>
      <FaqList faqs={faqs} />

      <h2>FleetOS för andra maskintyper</h2>
      <LinkCards links={[
        { href: '/uthyrning/byggmaskiner', title: 'Byggmaskiner och grävmaskiner', desc: 'Korta hyror, transporter och skaderegistrering' },
        { href: '/uthyrning/liftar', title: 'Liftar och skylift', desc: 'Besiktning, kontroll vid retur och service' },
      ]} />

      <PageCta heading="Se hur FleetOS fungerar för er truckflotta" />
    </PublicLayout>
  );
}
