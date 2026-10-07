import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import JsonLd from '@/components/public/JsonLd';
import PageCta, { FaqList, LinkCards } from '@/components/public/PageCta';
import { faqJsonLd, pageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  path: '/uthyrning/byggmaskiner',
  title: 'Uthyrningssystem för byggmaskiner och grävmaskiner',
  description: 'Uthyrningssystem för byggmaskiner: reservationer, transport och deposition på ordern, drifttimmar och skador med foto vid retur och underlag till Fortnox.',
});

const faqs = [
  {
    q: 'Vilka byggmaskiner finns som kategorier?',
    a: 'Grävmaskin, hjullastare, kompaktlastare och teleskoplastare finns som egna kategorier, med fält för bland annat grävdjup, skopvolym, tjänstevikt och motoreffekt. Dumprar och annan utrustning läggs upp under övrigt med egen benämning.',
  },
  {
    q: 'Kan vi reservera en maskin inför ett kommande jobb?',
    a: 'Ja. En order kan skapas som reserverad, så att maskinen är bokad för kunden innan hyran startar.',
  },
  {
    q: 'Hur debiterar vi transport och deposition?',
    a: 'Transport, deposition, försäkring och andra tillägg läggs till som artiklar på ordern med eget pris och eventuell rabatt. De följer med som egna rader i fakturaunderlaget.',
  },
  {
    q: 'Hur hanteras skador vid återlämning?',
    a: 'Vid retur väljer ni skick: bra, skadad, kräver service eller kräver kontroll. Ni tar foton, skriver en kommentar och registrerar drifttimmar. En skadad maskin skickas till service i stället för tillbaka i lager.',
  },
  {
    q: 'Kan vi se var maskinerna står?',
    a: 'På ordern anges kundens anläggning, så ni ser vid vilket kundställe varje uthyrd maskin finns. FleetOS har i dag ingen GPS-positionering. Hör av er om det är viktigt för er.',
  },
];

export default function ByggmaskinerPage() {
  return (
    <PublicLayout
      title="Uthyrningssystem för byggmaskiner och grävmaskiner"
      breadcrumbs={[{ name: 'Byggmaskiner', path: '/uthyrning/byggmaskiner' }]}
    >
      <JsonLd data={faqJsonLd(faqs)} />

      <p className="text-lg text-slate-500 mb-4">
        FleetOS är ett uthyrningssystem för företag som hyr ut grävmaskiner, hjullastare, kompaktlastare och annan entreprenadutrustning. Systemet håller ordning på bokningar, tillägg, returer och fakturaunderlag när maskinerna rör sig mellan depå och byggarbetsplatser.
      </p>
      <p className="mb-10 text-slate-500 text-sm">
        FleetOS är programvara för uthyrningsföretag. Vill du hyra en byggmaskin? Kontakta en maskinuthyrare nära dig.
      </p>

      <h2>Vardagen i byggmaskinuthyrning</h2>
      <p className="mb-4">
        Byggmaskiner hyrs ofta ut i några dagar eller veckor, med transport till och från arbetsplatsen. Kunden ringer med kort varsel, maskinen ska vara bokad till rätt dag, och när den kommer tillbaka behöver ni veta om den är hel, hur många timmar den har gått och om skopan eller andra tillbehör kom med.
      </p>
      <p className="mb-10">
        Missas en transport, en skada eller en extra dag på fakturan går pengarna förlorade. FleetOS samlar bokningen, tilläggen och returen på samma order, så att fakturaunderlaget blir komplett.
      </p>

      <h2>Så används FleetOS från bokning till faktura</h2>
      <ol>
        <li><strong>Reservera maskinen</strong> för kunden och arbetsplatsen så att den syns som reserverad i flottan.</li>
        <li><strong>Lägg till transport, deposition och försäkring</strong> som artiklar på ordern.</li>
        <li><strong>Skicka hyresavtalet</strong> från ordern för digital signering innan maskinen lämnar depån.</li>
        <li><strong>Registrera utlämningen</strong> genom att skanna maskinens QR-kod och ange drifttimmarna.</li>
        <li><strong>Ta emot returen</strong> med skick, foton, kommentar, drifttimmar och kontroll av tillbehör.</li>
        <li><strong>Skicka underlaget</strong> till <Link href="/integrationer/fortnox">Fortnox</Link> med hyresdagar och tillägg som egna rader.</li>
      </ol>

      <h2>Funktioner för byggmaskiner</h2>
      <ul>
        <li><strong>Dag-, vecko- och månadspris</strong> med valbar helgdebitering, där svenska helgdagar räknas bort när helger inte debiteras.</li>
        <li><strong>Öppna hyror</strong> utan fast returdatum, där hyresperioden räknas fram vid retur.</li>
        <li><strong>AI-registrering</strong>: fotografera typskylten så fylls fabrikat, modell och serienummer i.</li>
        <li><strong>Notiser om försenade returer</strong>, så att ni kan ringa kunden innan nästa bokning påverkas.</li>
        <li><strong>Lönsamhet per maskin</strong>, så att ni ser vilka maskiner som tjänar pengar och vilka som står still.</li>
      </ul>
      <p className="mb-10">
        Se alla <Link href="/funktioner">funktioner i FleetOS</Link>.
      </p>

      <h2>Vanliga frågor om uthyrningssystem för byggmaskiner</h2>
      <FaqList faqs={faqs} />

      <h2>Läs mer</h2>
      <LinkCards links={[
        { href: '/integrationer/fortnox', title: 'Fortnox-integration', desc: 'Hyresrader och tillägg direkt till Fortnox' },
        { href: '/kunder/wts-machinery-solutions', title: 'Kundcase: WTS Machinery Solutions', desc: 'Så används FleetOS i en uthyrningsverksamhet' },
        { href: '/uthyrning/truckar', title: 'Truckar och gaffeltruckar', desc: 'Långtidshyra och avtalsfakturering' },
        { href: '/uthyrning/liftar', title: 'Liftar och skylift', desc: 'Besiktning, kontroll vid retur och service' },
      ]} />

      <PageCta heading="Se hur FleetOS fungerar för era byggmaskiner" />
    </PublicLayout>
  );
}
