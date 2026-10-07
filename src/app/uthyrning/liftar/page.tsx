import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import JsonLd from '@/components/public/JsonLd';
import PageCta, { FaqList, LinkCards } from '@/components/public/PageCta';
import { faqJsonLd, pageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  path: '/uthyrning/liftar',
  title: 'Uthyrningssystem för liftar och skylift',
  description: 'Uthyrningssystem för liftuthyrare: besiktningar och kontroller per lift, kontroll vid retur och avtal, service och fakturaunderlag i samma system.',
});

const faqs = [
  {
    q: 'Hur dokumenterar vi besiktningar och kontroller?',
    a: 'Varje besiktning eller kontroll läggs in som en servicepost på liften, med datum, tekniker, status, kostnad, anteckningar och bilder. Planerade poster syns på liften tills de är avslutade, och historiken finns kvar på maskinkortet.',
  },
  {
    q: 'Påminner FleetOS automatiskt när en besiktning närmar sig?',
    a: 'Inte i dag. Ni planerar besiktningen som en servicepost med datum och följer upp den i serviceöversikten. Automatiska påminnelser finns inte ännu.',
  },
  {
    q: 'Vad händer om en lift kommer tillbaka med ett fel?',
    a: 'Vid retur väljer ni skick. En lift som markeras som skadad eller i behov av service får status service och kan inte förväxlas med en lift som är redo att hyras ut. Kräver liften bara en kontroll registreras det på ordern.',
  },
  {
    q: 'Finns det en färdig kategori för liftar?',
    a: 'Liftar läggs i dag upp under kategorin övrigt, med egen benämning, fabrikat, modell, serienummer och internt nummer. Säg till om ni behöver fler liftspecifika fält, så tar vi med det i dialogen om era behov.',
  },
  {
    q: 'Kan vi hyra ut liften med förare eller transport?',
    a: 'Ja. Förare, transport och andra tjänster läggs till som artiklar på ordern med eget pris, och kommer med som egna rader i fakturaunderlaget.',
  },
];

export default function LiftarPage() {
  return (
    <PublicLayout
      title="Uthyrningssystem för liftar och skylift"
      breadcrumbs={[{ name: 'Liftar', path: '/uthyrning/liftar' }]}
    >
      <JsonLd data={faqJsonLd(faqs)} />

      <p className="text-lg text-slate-500 mb-4">
        FleetOS är ett uthyrningssystem för företag som hyr ut saxliftar, bomliftar, skyliftar och annan utrustning för arbete på höjd. Avtal, utlämning, retur, besiktningar och fakturaunderlag hanteras i samma system.
      </p>
      <p className="mb-10 text-slate-500 text-sm">
        FleetOS är programvara för uthyrningsföretag. Vill du hyra en lift? Kontakta en liftuthyrare nära dig.
      </p>

      <h2>Där liftuthyrning skiljer sig</h2>
      <p className="mb-4">
        En lift som hyrs ut ska vara besiktigad och kontrollerad. Samtidigt är många hyror korta, ofta över en helg eller några dagar, och liften kan vara tillbaka och ute igen samma vecka. Det ställer krav på att den som lämnar ut liften ser om den är godkänd för uthyrning.
      </p>
      <p className="mb-10">
        I FleetOS syns liftens status, servicehistorik och planerade besiktningar på maskinkortet, och returen avgör om liften går tillbaka i lager eller till service.
      </p>

      <h2>Så används FleetOS för liftar</h2>
      <ol>
        <li><strong>Planera besiktningar och kontroller</strong> som serviceposter på varje lift, med datum och ansvarig tekniker.</li>
        <li><strong>Skapa ordern</strong> med kund, anläggning, hyresperiod och tillägg som transport eller förare.</li>
        <li><strong>Skicka hyresavtalet</strong> för digital signering direkt från ordern.</li>
        <li><strong>Lämna ut liften</strong> genom att skanna QR-koden och registrera drifttimmar.</li>
        <li><strong>Ta emot returen</strong> och välj skick: bra, skadad, kräver service eller kräver kontroll. Lägg till foton och en kommentar.</li>
        <li><strong>Fakturera</strong> genom att skicka ordern till <Link href="/integrationer/fortnox">Fortnox</Link>.</li>
      </ol>

      <h2>Funktioner för liftuthyrare</h2>
      <ul>
        <li><strong>Servicehistorik per lift</strong> med typerna periodisk service, reparation, besiktning och kontroll.</li>
        <li><strong>Maskinstatus</strong> som visar om liften är i lager, uthyrd, reserverad, på service, skadad eller utfasad.</li>
        <li><strong>Användarroller</strong> för admin, säljare och verkstad, så att kontor och verkstad arbetar i samma system.</li>
        <li><strong>Korta hyror</strong> med dag-, vecko- och månadspris och valbar helgdebitering.</li>
        <li><strong>Beläggning och lönsamhet</strong> per lift, så att ni ser vilka liftar som hyrs ut mest.</li>
      </ul>
      <p className="mb-10">
        Se alla <Link href="/funktioner">funktioner i FleetOS</Link>.
      </p>

      <h2>Vanliga frågor om uthyrningssystem för liftar</h2>
      <FaqList faqs={faqs} />

      <h2>Läs mer</h2>
      <LinkCards links={[
        { href: '/integrationer/serviceprotokoll', title: 'Serviceprotokoll-integration', desc: 'Hämta maskiner och tekniska data automatiskt' },
        { href: '/integrationer/fortnox', title: 'Fortnox-integration', desc: 'Från avslutad order till order i Fortnox' },
        { href: '/uthyrning/truckar', title: 'Truckar och gaffeltruckar', desc: 'Långtidshyra och avtalsfakturering' },
        { href: '/uthyrning/byggmaskiner', title: 'Byggmaskiner och grävmaskiner', desc: 'Korta hyror, transporter och skaderegistrering' },
      ]} />

      <PageCta heading="Se hur FleetOS fungerar för er liftflotta" />
    </PublicLayout>
  );
}
