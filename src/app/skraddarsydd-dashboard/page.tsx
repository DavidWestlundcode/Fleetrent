import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import JsonLd from '@/components/public/JsonLd';
import PageCta, { FaqList, LinkCards } from '@/components/public/PageCta';
import { faqJsonLd, pageMetadata } from '@/lib/seo';

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  path: '/skraddarsydd-dashboard',
  title: 'Skräddarsydd dashboard och system för er uthyrning',
  description: 'Hyr ni ut något annat än maskiner — personal, verktyg eller arbetsredskap? Vi bygger en anpassad dashboard och system på samma grund som FleetOS, efter er verksamhet.',
});

const faqs = [
  {
    q: 'Vad är skillnaden mot vanliga FleetOS?',
    a: 'FleetOS är färdigbyggt för maskinuthyrning. En skräddarsydd lösning utgår från samma grund — bokningar, avtal, utlämning, retur, roller och fakturaunderlag — men fälten, flödet och dashboarden byggs om efter vad just ni faktiskt hyr ut eller hanterar.',
  },
  {
    q: 'Passar det även om vi inte hyr ut fysiska maskiner?',
    a: 'Ja. Grunden fungerar lika bra för personal, arbetsredskap, verktyg eller annan utrustning som ska bokas, lämnas ut och komma tillbaka. Vi anpassar begrepp och fält efter er verksamhet istället för att pressa in den i maskinuthyrningens mall.',
  },
  {
    q: 'Hur går processen till?',
    a: 'Vi börjar med ett samtal om hur er verksamhet faktiskt fungerar idag — vad ni bokar, vem som gör vad, och vad ni behöver se i en dashboard. Utifrån det föreslår vi en lösning och vad den skulle innebära för er.',
  },
  {
    q: 'Får vi ett eget system?',
    a: 'Ja, lösningen byggs och driftas som en egen instans för er verksamhet — inte en delad konfiguration av FleetOS.',
  },
  {
    q: 'Kan det kopplas till Fortnox eller andra system vi redan använder?',
    a: 'Samma typ av integrationer som i FleetOS (t.ex. Fortnox för fakturaunderlag) går att bygga in, och vi tittar även på andra system ni redan använder i dialogen om era behov.',
  },
];

export default function SkraddarsyddDashboardPage() {
  return (
    <PublicLayout
      title="Skräddarsydd dashboard och system för er uthyrning"
      breadcrumbs={[{ name: 'Skräddarsydd dashboard', path: '/skraddarsydd-dashboard' }]}
    >
      <JsonLd data={faqJsonLd(faqs)} />

      <p className="text-lg text-slate-500 mb-4">
        FleetOS är byggt för företag som hyr ut maskiner. Men grunden — bokningar, avtal, utlämning, retur, roller för kontor och fält, och fakturaunderlag — fungerar lika bra för annat ni behöver hålla koll på och boka ut. Hyr ni ut personal, arbetsredskap, verktyg eller annan utrustning bygger vi en dashboard och ett system anpassat efter just er verksamhet.
      </p>
      <p className="mb-10 text-slate-500 text-sm">
        Det här är ett utvecklingsprojekt, inte en färdig produkt ni kan logga in i direkt — vi inleder alltid med ett samtal om era behov.
      </p>

      <h2>Exempel på vad vi byggt lösningar för</h2>
      <ul>
        <li><strong>Personaluthyrning och bemanning</strong> — boka ut personal till uppdrag, se vem som är ledig, och fakturera per uppdrag eller period.</li>
        <li><strong>Verktyg och arbetsredskap</strong> — samma utlämning/retur-flöde som för maskiner, men anpassat för mindre utrustning i större volym.</li>
        <li><strong>Övrig uthyrning och asset-tracking</strong> — allt som bokas, lämnas ut och ska komma tillbaka, med koll på vem som har vad och när.</li>
      </ul>
      <p className="mb-10">
        Känner ni igen er i något annat än de här exemplen? Beskriv er verksamhet så tittar vi på om grunden passar.
      </p>

      <h2>Vad som följer med från FleetOS-grunden</h2>
      <ul>
        <li><strong>Bokningar och avtal</strong> — med digital signering, precis som för en maskinhyra.</li>
        <li><strong>Utlämning och retur</strong> — med skick, anteckningar och foton, oavsett vad som lämnas ut.</li>
        <li><strong>Roller</strong> för admin, säljare och de som faktiskt hanterar utlämning/retur i fält.</li>
        <li><strong>Fakturaunderlag</strong>, till exempel mot <Link href="/integrationer/fortnox">Fortnox</Link>.</li>
        <li><strong>En dashboard</strong> byggd kring vad som faktiskt är relevant att se för er — inte maskinflottans nyckeltal om det inte är det ni hanterar.</li>
      </ul>

      <h2>Vanliga frågor om skräddarsydda lösningar</h2>
      <FaqList faqs={faqs} />

      <h2>Läs mer</h2>
      <LinkCards links={[
        { href: '/funktioner', title: 'Funktioner i FleetOS', desc: 'Så fungerar standardprodukten för maskinuthyrning' },
        { href: '/priser', title: 'Priser', desc: 'Vad FleetOS kostar som färdig produkt' },
        { href: '/integrationer/fortnox', title: 'Fortnox-integration', desc: 'Från avslutad order till order i Fortnox' },
        { href: '/kontakt', title: 'Kontakta oss', desc: 'Berätta om er verksamhet så hör vi av oss' },
      ]} />

      <PageCta
        heading="Berätta om er verksamhet"
        text="Boka ett samtal så går vi igenom vad ni behöver boka ut och hantera, och om en skräddarsydd lösning är rätt väg för er."
        secondary={{ label: 'Kontakta oss', href: '/kontakt' }}
      />
    </PublicLayout>
  );
}
