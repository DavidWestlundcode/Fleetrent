import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import FAQSection from '@/components/public/FAQSection';
import LatestEventsSection from '@/components/public/LatestEventsSection';
import JsonLd from '@/components/public/JsonLd';
import { SITE_URL, organizationJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: '/',
  absoluteTitle: true,
  title: 'Uthyrningssystem för maskiner, truckar och liftar | FleetOS',
  description: 'Samla bokningar, hyresavtal, QR-returer och fakturaunderlag till Fortnox i FleetOS. Uthyrningssystem för maskiner, truckar och liftar. Boka en demo.',
});

// Statically cached; the only dynamic content (LatestEventsSection) is revalidated on
// admin writes and at most every 5 minutes.
export const revalidate = 300;

// Prices mirror the plans on /priser (visible on the site) — keep them in sync.
const jsonLd = [
  organizationJsonLd(),
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'FleetOS',
    url: SITE_URL,
    inLanguage: 'sv-SE',
    publisher: { '@id': `${SITE_URL}/#organization` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FleetOS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: SITE_URL,
    inLanguage: 'sv-SE',
    description: 'Uthyrningssystem för företag som hyr ut maskiner, truckar och liftar: order, hyresavtal, utlämning och retur med QR-kod, service och fakturaunderlag till Fortnox.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'SEK',
      lowPrice: '1495',
      highPrice: '3999',
      offerCount: '3',
      url: `${SITE_URL}/priser`,
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
  },
];


/*
 * Design rules for this page (from the taste/redesign skills in .agents/skills):
 * - One light theme, cool slate neutrals, FleetOS blue as the only accent.
 * - Radius scale: containers 20px (rounded-[1.25rem]), inner frames 14px, buttons 12px.
 * - Product visuals are real screenshots of /demo (example data), never div mockups.
 * - No em dashes, no eyebrow labels, no decorative glows or gradients.
 */

const SCREEN = { width: 2880, height: 1740 };

/** Nested "double bezel" frame for product screenshots. */
function Screenshot({
  src, alt, priority = false, sizes, className = '', imgClassName = '',
}: {
  src: string; alt: string; priority?: boolean; sizes: string; className?: string; imgClassName?: string;
}) {
  return (
    <div className={`rounded-[1.25rem] bg-slate-900/[0.04] ring-1 ring-slate-900/[0.06] p-1.5 ${className}`}>
      <div className="h-full rounded-[14px] overflow-hidden bg-white ring-1 ring-slate-900/[0.08] shadow-[0_24px_48px_-28px_rgba(15,23,42,0.35)]">
        <Image
          src={src}
          alt={alt}
          width={SCREEN.width}
          height={SCREEN.height}
          sizes={sizes}
          priority={priority}
          className={`w-full h-full object-cover object-left-top ${imgClassName}`}
        />
      </div>
    </div>
  );
}

function PrimaryCta({ href = '/kom-igang', children, inverted = false }: { href?: string; children: React.ReactNode; inverted?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 pl-5 pr-2 py-2 rounded-xl text-[15px] font-semibold transition-[background-color,transform] duration-150 ease-out-strong active:scale-[0.97] ${
        inverted ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {children}
      <span className={`flex items-center justify-center w-8 h-8 rounded-lg transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5 ${inverted ? 'bg-slate-950/[0.06]' : 'bg-white/15'}`}>
        <ArrowRight className="w-4 h-4" strokeWidth={2} />
      </span>
    </Link>
  );
}

function TextLink({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-slate-900 ${className}`}>
      {children}
      <ArrowRight className="w-4 h-4 text-slate-400 transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5 group-hover:text-slate-900" strokeWidth={1.75} />
    </Link>
  );
}

const WITHOUT = [
  'Kalkylblad och mejlkedjor som enda verktyg',
  'Telefonsamtal för varje fråga om vad som är ledigt',
  'Returdatum som missas och dagar som aldrig faktureras',
  'Ingen överblick över vilka maskiner som lönar sig',
  'Returer och skador som dokumenteras på papper',
];

const WITH = [
  'Flottans status samlad på ett ställe och uppdaterad direkt',
  'Notiser när en retur är försenad',
  'Maskinuppgifter ifyllda från ett foto av typskylten',
  'Intäkter och kostnader per maskin',
  'Utlämning och retur via maskinens QR-kod',
];

const FORTNOX_FIELDS = [
  ['Kund', 'skapas i Fortnox om den saknas'],
  ['Hyresrader', 'dag-, vecko- eller månadspris med rabatt'],
  ['Tillägg', 'försäkring, transport och andra artiklar'],
  ['Referenser', 'ordernummer och beställare'],
  ['Kostnadsställe', 'kopplat till användaren'],
];

const INDUSTRIES = [
  { href: '/uthyrning/truckar', title: 'Uthyrningssystem för truckar', desc: 'Kapacitet och lyfthöjd på maskinkortet, långtidshyra med månadsvisa delfakturor och kontroll av laddare och tillbehör vid retur.' },
  { href: '/uthyrning/byggmaskiner', title: 'Uthyrningssystem för byggmaskiner', desc: 'Reservationer, transport och deposition på ordern, och drifttimmar och skador med foto när maskinen kommer tillbaka.' },
  { href: '/uthyrning/liftar', title: 'Uthyrningssystem för liftar', desc: 'Besiktningar och kontroller per lift, korta hyror och returer som avgör om liften går till lager eller service.' },
];

const STEPS = [
  { title: 'Boka demo', desc: 'Vi går igenom era behov, sätter upp kontot och ni bjuder in kollegorna.' },
  { title: 'Lägg upp flottan', desc: 'Fotografera typskylten så fylls uppgifterna i, eller hämta maskinerna från Serviceprotokoll.' },
  { title: 'Skapa order', desc: 'Välj kund, maskin och prismall. Systemet räknar fram priset och skapar avtalet.' },
  { title: 'Följ upp', desc: 'Se beläggning, försenade returer och lönsamhet per maskin.' },
];

const sectionHeading = 'text-[32px] sm:text-[42px] font-semibold text-slate-950 tracking-[-0.03em] leading-[1.08] text-balance';
const sectionLead = 'mt-5 text-[16.5px] text-slate-500 leading-relaxed max-w-[60ch] text-pretty';

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <JsonLd data={jsonLd} />
      <PublicHeader />

      <main>
        {/* Hero: left-aligned copy, real product screenshot bleeding off the right edge */}
        <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-14 items-center">
            <div className="animate-fade-up">
              <h1 className="text-[38px] sm:text-[50px] lg:text-[54px] font-semibold text-slate-950 tracking-[-0.035em] leading-[1.04] text-balance">
                Uthyrningssystem för maskiner, truckar och liftar
              </h1>
              <p className="mt-6 text-[17px] sm:text-[18px] text-slate-500 leading-relaxed max-w-[44ch] text-pretty">
                Bokningar, hyresavtal, utlämning, retur och fakturaunderlag till Fortnox i ett system. Byggt för företag som hyr ut maskiner.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <PrimaryCta>Boka demo</PrimaryCta>
                <TextLink href="/demo">Prova demon</TextLink>
              </div>
            </div>

            <div className="animate-fade-up-delayed lg:-mr-40 xl:-mr-56">
              <Screenshot
                src="/screens/dashboard.png"
                alt="FleetOS dashboard med flottans status, intäkter per månad och varningar för försenade returer"
                priority
                sizes="(min-width: 1024px) 860px, 100vw"
              />
              <p className="mt-3 text-[12px] text-slate-500">Skärmbild från den interaktiva demon med exempeldata.</p>
            </div>
          </div>
        </section>

        {/* Customer logo */}
        <section aria-label="Kunder" className="px-4 sm:px-6">
          <div className="max-w-6xl mx-auto py-9 border-y border-slate-100 flex flex-col sm:flex-row items-center gap-5 sm:gap-10">
            <p className="text-[14px] text-slate-500">Används av uthyrare som</p>
            <Link href="/kunder/wts-machinery-solutions" className="group">
              {/* eslint-disable-next-line @next/next/no-img-element -- 4 KB PNG, not worth the optimizer */}
              <img
                src="/wts-logo.png"
                alt="WTS Machinery Solutions"
                width={200}
                height={56}
                loading="lazy"
                decoding="async"
                className="h-7 w-auto grayscale opacity-60 transition-[filter,opacity] duration-200 group-hover:grayscale-0 group-hover:opacity-100"
              />
            </Link>
          </div>
        </section>

        {/* Before / after */}
        <section className="py-24 sm:py-32 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <AnimateIn className="max-w-3xl">
              <h2 className={sectionHeading}>Ett system i stället för Excel, mejl och pärmar</h2>
              <p className={sectionLead}>
                Kalkylblad fungerar när flottan är liten. När den växer behöver alla se samma sak: vad som är uthyrt, till vem och när det ska tillbaka.
              </p>
            </AnimateIn>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimateIn className="h-full">
                <div className="h-full rounded-[1.25rem] bg-slate-50 p-7 sm:p-9">
                  <h3 className="text-[17px] font-semibold text-slate-500">Utan ett uthyrningssystem</h3>
                  <ul className="mt-6 space-y-4">
                    {WITHOUT.map((t) => (
                      <li key={t} className="flex gap-3 text-[15px] text-slate-500 leading-snug">
                        <Minus className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" strokeWidth={2} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateIn>
              <AnimateIn delay={80} className="h-full">
                <div className="h-full rounded-[1.25rem] bg-white ring-1 ring-slate-900/[0.07] shadow-[0_24px_48px_-32px_rgba(15,23,42,0.3)] p-7 sm:p-9">
                  <h3 className="text-[17px] font-semibold text-slate-950">Med FleetOS</h3>
                  <ul className="mt-6 space-y-4">
                    {WITH.map((t) => (
                      <li key={t} className="flex gap-3 text-[15px] text-slate-800 leading-snug">
                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" strokeWidth={2.25} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* Workflow bento: five steps, five cells */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <AnimateIn className="max-w-3xl">
              <h2 className={sectionHeading}>Från bokning till faktura</h2>
              <p className={sectionLead}>
                Order, avtal, utlämning, retur och fakturaunderlag hänger ihop på samma order, så att inget behöver föras över för hand.
              </p>
            </AnimateIn>

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Orders */}
              <AnimateIn className="lg:col-span-7">
                <article className="h-full rounded-[1.25rem] bg-white ring-1 ring-slate-900/[0.06] p-7 sm:p-9 flex flex-col">
                  <h3 className="text-[20px] font-semibold text-slate-950 tracking-tight">Order och bokning</h3>
                  <p className="mt-3 text-[15px] text-slate-500 leading-relaxed max-w-[52ch]">
                    Välj kund, anläggning och maskin. Priset räknas fram från prismallen för dag, vecka eller månad, och maskinen kan reserveras i förväg.
                  </p>
                  <Screenshot
                    src="/screens/order.png"
                    alt="Lista över uthyrningsorder med kund, maskin, period, belopp och status"
                    sizes="(min-width: 1024px) 620px, 100vw"
                    className="mt-8 aspect-[16/10]"
                  />
                </article>
              </AnimateIn>

              {/* Pickup and return */}
              <AnimateIn delay={60} className="lg:col-span-5">
                <article className="relative h-full min-h-[420px] rounded-[1.25rem] overflow-hidden flex flex-col justify-end p-7 sm:p-9 text-white">
                  <Image
                    src="/Rental-truck-demo-picture.png"
                    alt="Motviktstruck med pall i ett lager"
                    fill
                    sizes="(min-width: 1024px) 440px, 100vw"
                    className="object-cover object-[20%_center]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/0" />
                  <div className="relative">
                    <h3 className="text-[20px] font-semibold tracking-tight">Utlämning och retur med QR-kod</h3>
                    <p className="mt-3 text-[15px] text-slate-200 leading-relaxed">
                      Skanna maskinens QR-kod och registrera drifttimmar, skick, foton och tillbehör. En skadad maskin går direkt till service.
                    </p>
                  </div>
                </article>
              </AnimateIn>

              {/* Agreements */}
              <AnimateIn className="lg:col-span-5">
                <article className="h-full rounded-[1.25rem] bg-blue-50 ring-1 ring-blue-100 p-7 sm:p-9 flex flex-col">
                  <h3 className="text-[20px] font-semibold text-slate-950 tracking-tight">Hyresavtal med e-signering</h3>
                  <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">
                    Avtalet skapas från ordern och skickas till kunden för digital signering via e-post.
                  </p>
                  <p className="mt-3 text-[15px] text-slate-600 leading-relaxed">
                    Det går till beställarens e-post, eller kundens om ingen beställare är angiven. Kunden behöver inget konto i FleetOS. En rörlig kostnad tillkommer per skickat avtal.
                  </p>
                  <ul className="mt-auto pt-10 space-y-3.5">
                    {['Skapas direkt från ordern', 'Signeringsstatus följs upp i FleetOS', 'Det signerade avtalet sparas på ordern'].map((t) => (
                      <li key={t} className="flex gap-3 text-[15px] text-slate-800 leading-snug">
                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" strokeWidth={2.25} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </article>
              </AnimateIn>

              {/* Fortnox */}
              <AnimateIn delay={60} className="lg:col-span-7">
                <article className="h-full rounded-[1.25rem] bg-white ring-1 ring-slate-900/[0.06] p-7 sm:p-9 flex flex-col">
                  <h3 className="text-[20px] font-semibold text-slate-950 tracking-tight">Fakturaunderlag till Fortnox</h3>
                  <p className="mt-3 text-[15px] text-slate-500 leading-relaxed max-w-[52ch]">
                    En klar order blir en order i Fortnox med ett klick. Långtidshyror får en delfaktura i slutet av varje månad som ni granskar innan den skickas.
                  </p>
                  <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {FORTNOX_FIELDS.map(([k, v]) => (
                      <div key={k} className="border-t border-slate-100 pt-3">
                        <dt className="text-[14px] font-semibold text-slate-900">{k}</dt>
                        <dd className="text-[14px] text-slate-500">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <TextLink href="/integrationer/fortnox" className="mt-auto pt-8">Så fungerar Fortnox-integrationen</TextLink>
                </article>
              </AnimateIn>

              {/* Profitability */}
              <AnimateIn className="lg:col-span-12">
                <article className="rounded-[1.25rem] bg-white ring-1 ring-slate-900/[0.06] p-7 sm:p-9 grid grid-cols-1 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-8 lg:gap-12 items-center">
                  <div>
                    <h3 className="text-[20px] font-semibold text-slate-950 tracking-tight">Lönsamhet per maskin</h3>
                    <p className="mt-3 text-[15px] text-slate-500 leading-relaxed">
                      Intäkter, beläggning och resultat per maskin och kund, räknat mot inköp, leasing, försäkring och service. Ni ser vilka maskiner som tjänar pengar och vilka som står still.
                    </p>
                    <TextLink href="/funktioner" className="mt-8">Se alla funktioner</TextLink>
                  </div>
                  <Screenshot
                    src="/screens/statistik.png"
                    alt="Statistik med intäkter per månad, intäkt per kategori och lönsamhet per maskin"
                    sizes="(min-width: 1024px) 700px, 100vw"
                    className="aspect-[16/9]"
                  />
                </article>
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* Industries */}
        <section id="branscher" className="py-24 sm:py-32 px-4 sm:px-6 scroll-mt-24">
          <div className="max-w-6xl mx-auto">
            <AnimateIn className="max-w-3xl">
              <h2 className={sectionHeading}>Byggt för er typ av flotta</h2>
              <p className={sectionLead}>Samma system, men olika vardag. Så används FleetOS av uthyrare med olika maskinparker.</p>
            </AnimateIn>

            <ul className="mt-14 border-t border-slate-200">
              {INDUSTRIES.map(({ href, title, desc }, i) => (
                <li key={href} className="border-b border-slate-200">
                  <AnimateIn delay={i * 50}>
                    <Link href={href} className="group grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_auto] gap-3 md:gap-10 items-center py-8">
                      <h3 className="text-[20px] sm:text-[22px] font-semibold text-slate-950 tracking-tight transition-colors group-hover:text-blue-700">{title}</h3>
                      <p className="text-[15px] text-slate-500 leading-relaxed text-pretty">{desc}</p>
                      <span className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl ring-1 ring-slate-200 text-slate-400 transition-[background-color,color,transform] duration-200 ease-out-strong group-hover:bg-slate-950 group-hover:text-white group-hover:ring-slate-950 group-hover:translate-x-0.5">
                        <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                      </span>
                    </Link>
                  </AnimateIn>
                </li>
              ))}
            </ul>

            <AnimateIn>
              <Link href="/kunder/wts-machinery-solutions" className="group mt-10 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 rounded-[1.25rem] bg-slate-50 p-6 sm:p-7">
                <span className="flex items-center justify-center w-28 h-14 rounded-[14px] bg-white ring-1 ring-slate-900/[0.06] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- small local logo */}
                  <img src="/wts-logo.png" alt="" width={200} height={56} loading="lazy" className="h-6 w-auto" />
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] text-slate-500">Kundcase</span>
                  <span className="block text-[16px] font-semibold text-slate-950 text-pretty">Så använder WTS Machinery Solutions FleetOS med Fortnox och Serviceprotokoll</span>
                </span>
                <ArrowRight className="w-5 h-5 text-slate-400 transition-transform duration-200 ease-out-strong group-hover:translate-x-1 group-hover:text-slate-900" strokeWidth={1.75} />
              </Link>
            </AnimateIn>
          </div>
        </section>

        {/* Integrations */}
        <section id="integrations" className="py-24 sm:py-32 px-4 sm:px-6 bg-slate-50 scroll-mt-24">
          <div className="max-w-6xl mx-auto">
            <AnimateIn className="max-w-3xl">
              <h2 className={sectionHeading}>Fungerar med Fortnox och Serviceprotokoll</h2>
              <p className={sectionLead}>
                Fortnox och Serviceprotokoll är tillgängliga i dag. Visma är planerad men inte klar.
              </p>
            </AnimateIn>

            <AnimateIn>
              <div className="mt-14 rounded-[1.25rem] bg-white ring-1 ring-slate-900/[0.06] grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {[
                  { name: 'Fortnox', href: '/integrationer/fortnox', direction: 'Från FleetOS till Fortnox', desc: 'Klara ordrar och delfakturor skickas som ordrar i Fortnox med kund, hyresrader, artikelnummer och kostnadsställe. Kunder som saknas skapas automatiskt.' },
                  { name: 'Serviceprotokoll', href: '/integrationer/serviceprotokoll', direction: 'Från Serviceprotokoll till FleetOS', desc: 'Hyresmaskiner med tekniska data samt kunder, anläggningar och kontakter hämtas automatiskt var 30:e minut.' },
                ].map(({ name, href, direction, desc }) => (
                  <div key={name} className="p-7 sm:p-10 flex flex-col">
                    <p className="text-[13px] text-slate-500">{direction}</p>
                    <h3 className="mt-1 text-[24px] font-semibold text-slate-950 tracking-tight">{name}</h3>
                    <p className="mt-4 text-[15px] text-slate-500 leading-relaxed text-pretty">{desc}</p>
                    <TextLink href={href} className="mt-8">Läs om {name}-integrationen</TextLink>
                  </div>
                ))}
              </div>
            </AnimateIn>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[14.5px] text-slate-500">
              <p className="max-w-[60ch] text-pretty">Använder ni ett annat system, till exempel för GPS eller ekonomi? Berätta vad ni behöver så bedömer vi om det går att anpassa.</p>
              <TextLink href="/integrationer">Alla integrationer</TextLink>
            </div>
          </div>
        </section>

        {/* Getting started */}
        <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 scroll-mt-24">
          <div className="max-w-6xl mx-auto">
            <AnimateIn className="max-w-3xl">
              <h2 className={sectionHeading}>Så kommer ni igång</h2>
              <p className={sectionLead}>Från första genomgången till full koll på flottan.</p>
            </AnimateIn>
            <ol className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
              {STEPS.map(({ title, desc }, i) => (
                <li key={title} className={`border-t-2 pt-6 ${i === 0 ? 'border-blue-600' : 'border-slate-200'}`}>
                  <AnimateIn delay={i * 60}>
                    <h3 className="text-[17px] font-semibold text-slate-950">{title}</h3>
                    <p className="mt-2 text-[15px] text-slate-500 leading-relaxed text-pretty">{desc}</p>
                  </AnimateIn>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <LatestEventsSection />

        <FAQSection />

        {/* Closing CTA */}
        <section className="pb-24 sm:pb-32 px-4 sm:px-6">
          <AnimateIn className="max-w-6xl mx-auto">
            <div className="rounded-[1.5rem] bg-slate-950 px-7 py-14 sm:px-14 sm:py-20 grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_auto] gap-10 items-end">
              <div>
                <h2 className="text-[32px] sm:text-[42px] font-semibold text-white tracking-[-0.03em] leading-[1.08] text-balance">
                  Se FleetOS med era egna maskiner
                </h2>
                <p className="mt-5 text-[16.5px] text-slate-400 leading-relaxed max-w-[52ch] text-pretty">
                  Vi visar flödet från order till retur och fakturaunderlag. Ingen bindningstid, och ni betalar månad för månad.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
                <PrimaryCta inverted>Boka demo</PrimaryCta>
                <Link href="/kontakt" className="text-[14.5px] font-semibold text-slate-300 hover:text-white transition-colors">Kontakta oss</Link>
              </div>
            </div>
          </AnimateIn>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
