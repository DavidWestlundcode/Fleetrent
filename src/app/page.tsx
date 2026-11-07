import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, BatteryFull, Check, Clock, FileText, Minus, QrCode, Signal, Wifi } from 'lucide-react';
import { AnimateIn, CountUp } from '@/components/ui/AnimateIn';
import { Logo } from '@/components/ui/Logo';
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
 * - Light page with a dark #141414 hero stage and deep navy (ink) bands. FleetOS blue for actions,
 *   ice blue for text on navy, neon jade only for "done" states (checks, sync, progress, events).
 * - Radius scale: containers 20px (rounded-[1.25rem]), inner frames 14px, buttons 12px.
 * - Product visuals are real screenshots of /demo (example data), never div mockups. The hero's
 *   devices are a generated laptop/iPhone shell with those real screenshots composited onto the
 *   screens by code (hero-devices.webp), never AI-drawn UI.
 * - No em dashes, no eyebrow labels, no gradient text; glows only as soft light on dark bands.
 */

// Captured from /demo at 3x pixel density with a narrower viewport than a full desktop, so
// the UI stays legible when it is scaled down into the landing page frames. Order and
// statistik are cropped to the content area (no app sidebar) for the smaller bento cards.
const SCREENS: Record<string, { width: number; height: number }> = {
  '/screens/order-v2.png': { width: 3024, height: 2280 },
  '/screens/statistik-v2.png': { width: 2904, height: 2340 },
};

/** Nested "double bezel" frame for product screenshots. */
function Screenshot({
  src, alt, priority = false, sizes, className = '', imgClassName = '',
}: {
  src: string; alt: string; priority?: boolean; sizes: string; className?: string; imgClassName?: string;
}) {
  return (
    // w-full + min-h-0: inside a flex column, an aspect-ratio box otherwise takes its height
    // from the image and widens past the card to keep the ratio.
    <div className={`w-full min-h-0 rounded-[1.25rem] bg-slate-900/[0.04] ring-1 ring-slate-900/[0.06] p-1.5 ${className}`}>
      <div className="h-full rounded-[14px] overflow-hidden bg-white ring-1 ring-slate-900/[0.08] shadow-[0_24px_48px_-28px_rgba(15,23,42,0.35)]">
        <Image
          src={src}
          alt={alt}
          width={SCREENS[src].width}
          height={SCREENS[src].height}
          sizes={sizes}
          priority={priority}
          quality={90}
          className={`w-full h-full object-cover object-left-top ${imgClassName}`}
        />
      </div>
    </div>
  );
}

function PrimaryCta({ href = '/kom-igang', children }: { href?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-3 pl-5 pr-2 py-2 rounded-xl text-[15px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-[background-color,transform] duration-150 ease-out-strong active:scale-[0.97]"
    >
      {children}
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5">
        <ArrowRight className="w-4 h-4" strokeWidth={2} />
      </span>
    </Link>
  );
}

function TextLink({ href, children, className = '', dark = false }: { href: string; children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-1.5 text-[14.5px] font-semibold ${dark ? 'text-white' : 'text-slate-900'} ${className}`}>
      {children}
      <ArrowRight className={`w-4 h-4 transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5 ${dark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'}`} strokeWidth={1.75} />
    </Link>
  );
}

const FACTS = [
  { end: 1495, suffix: ' kr', label: 'per månad för Start, exkl. moms' },
  { end: 0, suffix: ' kr', label: 'i installationsavgift och ingen bindningstid' },
  { end: 30, suffix: ' min', label: 'mellan varje synk med Serviceprotokoll' },
  { end: 3, suffix: ' roller', label: 'admin, säljare och verkstad' },
];

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

const cardLink = 'group h-full rounded-[1.25rem] flex flex-col transition-[transform,box-shadow] duration-300 ease-out-strong hover:-translate-y-1 active:scale-[0.995]';
const zoomImg = 'transition-transform duration-700 ease-out-strong group-hover:scale-[1.025]';

/** Arrow label inside a card that is itself a link (a nested <a> would be invalid). */
function CardArrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-slate-900 ${className}`}>
      {children}
      <ArrowRight className="w-4 h-4 text-slate-400 transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5 group-hover:text-slate-900" strokeWidth={1.75} />
    </span>
  );
}

/** Two systems and the direction data moves between them (decorative; text says the same). */
function FlowDiagram({ from, to }: { from: string; to: string }) {
  const node = (label: string) => (
    <span className="inline-flex items-center gap-1.5 shrink-0 rounded-[10px] bg-white ring-1 ring-slate-900/[0.08] px-3 py-1.5 text-[13px] font-semibold text-slate-900">
      {label === 'FleetOS' && <Logo size={14} decorative />}
      {label}
    </span>
  );
  return (
    <div aria-hidden="true" className="flex items-center gap-3">
      {node(from)}
      <span className="relative flex-1 h-[2px] rounded-full bg-slate-200 overflow-hidden">
        <span className="flow-pulse absolute inset-y-0 left-0 w-[30%] rounded-full bg-gradient-to-r from-jade/0 via-jade to-jade/0" />
      </span>
      <ArrowRight className="w-4 h-4 -ml-2 text-slate-300 shrink-0" strokeWidth={2} />
      {node(to)}
    </div>
  );
}

const sectionHeadingBase = 'text-[32px] sm:text-[42px] font-semibold tracking-[-0.03em] leading-[1.08] text-balance';
const sectionHeading = `${sectionHeadingBase} text-slate-950`;
const sectionHeadingDark = `${sectionHeadingBase} text-white`;
const sectionLead = 'mt-5 text-[16.5px] text-slate-500 leading-relaxed max-w-[60ch] text-pretty';
const sectionLeadDark = 'mt-5 text-[16.5px] text-ice leading-relaxed max-w-[60ch] text-pretty';

const EVENT_TONES = { jade: 'bg-jade text-ink', blue: 'bg-blue-500 text-white', amber: 'bg-amber-400 text-ink' } as const;

/** A notification-style card for an example event from the demo data (decorative). */
function EventCard({ icon: Icon, tone, title, meta, className = '' }: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: keyof typeof EVENT_TONES; title: string; meta: string; className?: string;
}) {
  return (
    <div aria-hidden="true" className={`flex items-center gap-3 rounded-2xl ring-1 ring-white/10 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.75)] pl-2.5 pr-4 py-2.5 ${className}`}>
      <span className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${EVENT_TONES[tone]}`}>
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </span>
      <span className="leading-tight">
        <span className="block whitespace-nowrap text-[12.5px] sm:text-[13px] font-semibold text-white">{title}</span>
        <span className="block whitespace-nowrap mt-0.5 text-[11px] sm:text-[11.5px] text-slate-400">{meta}</span>
      </span>
    </div>
  );
}

/** Jade "done" mark: an ink check on a jade dot, legible on light and dark grounds. */
function JadeCheck() {
  return (
    <span className="mt-[1px] flex items-center justify-center w-[18px] h-[18px] rounded-full bg-jade shrink-0">
      <Check className="w-3 h-3 text-ink" strokeWidth={3} />
    </span>
  );
}

// Feature stickers floating beside the workflow heading: each names something on the page.
const STICKERS = [
  { label: 'Signering med BankID', pos: 'left-[6%] top-[4%]', tone: 'bg-white rotate-[-5deg]', delay: 0 },
  { label: 'Synk med Fortnox', pos: 'left-[38%] top-[42%]', tone: 'bg-jade rotate-[4deg]', delay: 120 },
  { label: 'Retur med QR-kod', pos: 'left-[2%] top-[76%]', tone: 'bg-ice rotate-[-2deg]', delay: 240 },
];

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <JsonLd data={jsonLd} />
      <PublicHeader />

      <main>
        {/* Hero: dark stage, copy left, the real dashboard on a laptop and an iPhone on a pedestal */}
        <section className="relative isolate pt-32 sm:pt-36 lg:pt-40 pb-14 sm:pb-16 px-4 sm:px-6 overflow-hidden bg-[#141414]">
          {/* Phones and small tablets: the iPhone alone, top right, under the headline. */}
          <div aria-hidden="true" className="lg:hidden absolute -z-10 right-[-30%] top-0 w-[95%] h-[560px] device-glow" />
          <Image
            src="/screens/hero-phone.webp"
            alt="FleetOS dashboard i mobilen"
            width={450}
            height={631}
            sizes="(min-width: 640px) 320px, 64vw"
            priority
            className="hero-phone lg:hidden absolute -z-10 right-[-20%] sm:right-[-4%] top-[76px] sm:top-[96px] w-[64%] sm:w-[42%] max-w-[340px] h-auto"
          />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-20 sm:gap-24 lg:gap-6 items-center">
            <div className="hero-copy relative z-10">
              <h1 className="hero-shade text-[38px] sm:text-[50px] lg:text-[54px] font-semibold text-white tracking-[-0.035em] leading-[1.04] text-balance">
                Uthyrningssystem för maskiner, <span className="text-jade">truckar och liftar</span>
              </h1>
              <p className="hero-shade mt-6 text-[17px] sm:text-[18px] text-slate-300 lg:text-slate-400 leading-relaxed max-w-[22ch] sm:max-w-[40ch] text-pretty">
                Bokningar, hyresavtal, utlämning, retur och fakturaunderlag till Fortnox i ett system.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                <PrimaryCta>Boka demo</PrimaryCta>
                <TextLink href="/demo" dark>Prova demon</TextLink>
              </div>
              <p className="lg:hidden mt-12 text-[12px] text-slate-400">Skärmbild från den interaktiva demon med exempeldata.</p>
            </div>

            <div className="hidden lg:block relative lg:-mr-40 xl:-mr-56">
              {/* The box is the devices' own frame; the image's soft light spills past it up and right. */}
              <div className="relative aspect-[2192/1476]">
                <Image
                  src="/screens/hero-devices.webp"
                  alt="FleetOS dashboard på en laptop och i mobilen, med flottans status, intäkter per månad och varningar för försenade returer"
                  width={2752}
                  height={1916}
                  sizes="(min-width: 1024px) 1130px, 125vw"
                  priority
                  quality={90}
                  className="hero-devices absolute left-0 top-[-29.81%] w-[125.55%] max-w-none h-auto"
                />
                {/* Two example events from the demo data, popping out of the screens. */}
                <EventCard icon={QrCode} tone="jade" title="Retur registrerad via QR" meta="Toyota 8FBN25 · tillbaka i lager" className="hero-event hero-event-a absolute left-[2%] top-[52%] bg-ink" />
                <EventCard icon={Check} tone="jade" title="Skickad till Fortnox" meta="FR-202604-2990 · 15 200 kr" className="hero-event hero-event-b absolute left-[56%] top-[7%] bg-ink" />
              </div>
              <p className="relative -mt-10 text-[12px] text-slate-400">Skärmbilder från den interaktiva demon med exempeldata.</p>
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

        {/* Facts: real, verifiable numbers from /priser and the integrations */}
        <section aria-label="FleetOS i siffror" className="px-4 sm:px-6 pt-16 sm:pt-20">
          {/* Left rule between columns only: odd cells on mobile (2 cols) and the first cell on desktop (4 cols) start flush with the page edge. */}
          <dl className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-y-10">
            {FACTS.map(({ end, suffix, label }, i) => (
              <AnimateIn
                key={label}
                delay={i * 60}
                className="flex flex-col-reverse justify-end pl-6 border-l border-slate-200/80 max-lg:odd:pl-0 max-lg:odd:border-l-0 lg:pl-8 lg:first:pl-0 lg:first:border-l-0"
              >
                <dt className="mt-3 text-[14px] text-slate-500 leading-snug max-w-[24ch]">{label}</dt>
                <dd className="text-[32px] sm:text-[42px] font-semibold text-slate-950 tracking-[-0.03em] leading-none tabular-nums">
                  <CountUp end={end} suffix={suffix} format />
                </dd>
              </AnimateIn>
            ))}
          </dl>
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
                    {WITHOUT.map((t, i) => (
                      <li key={t}>
                        <AnimateIn delay={120 + i * 50} className="flex gap-3 text-[15px] text-slate-500 leading-snug">
                        <Minus className="w-4 h-4 mt-0.5 shrink-0 text-slate-300" strokeWidth={2} />
                        {t}
                        </AnimateIn>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateIn>
              <AnimateIn delay={80} className="h-full">
                <div className="h-full rounded-[1.25rem] bg-white ring-1 ring-slate-900/[0.07] shadow-[0_24px_48px_-32px_rgba(15,23,42,0.3)] p-7 sm:p-9">
                  <h3 className="text-[17px] font-semibold text-slate-950">Med FleetOS</h3>
                  <ul className="mt-6 space-y-4">
                    {WITH.map((t, i) => (
                      <li key={t}>
                        <AnimateIn delay={120 + i * 50} className="flex gap-3 text-[15px] text-slate-800 leading-snug">
                        <JadeCheck />
                        {t}
                        </AnimateIn>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* Workflow bento: five steps, five cells, on the deep navy band */}
        <section className="relative isolate overflow-hidden py-24 sm:py-32 px-4 sm:px-6 bg-ink">
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              <AnimateIn className="max-w-3xl">
                <h2 className={sectionHeadingDark}>Från bokning till faktura</h2>
                <p className={sectionLeadDark}>
                  Order, avtal, utlämning, retur och fakturaunderlag hänger ihop på samma order, så att inget behöver föras över för hand.
                </p>
              </AnimateIn>
              <div aria-hidden="true" className="hidden lg:block absolute right-0 top-0 h-full w-[34%]">
                {STICKERS.map(({ label, pos, tone, delay }) => (
                  <AnimateIn key={label} delay={delay} direction="scale" className={`absolute ${pos}`}>
                    <span className={`sticker inline-block whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-semibold text-ink shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)] ${tone}`} style={{ animationDelay: `${delay * 8}ms` }}>
                      {label}
                    </span>
                  </AnimateIn>
                ))}
              </div>
            </div>

            {/* Each cell is one link (hover = feedback that it leads somewhere). Lift and image
                zoom use transform only; Tailwind v4 gates hover: to real pointer devices. */}
            <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Orders */}
              <AnimateIn className="lg:col-span-7">
                <Link href="/funktioner" className={`${cardLink} bg-white ring-1 ring-white/10 hover:ring-ice/70 p-7 sm:p-9`}>
                  <h3 className="text-[20px] font-semibold text-slate-950 tracking-tight">Order och bokning</h3>
                  <p className="mt-3 text-[15px] text-slate-500 leading-relaxed max-w-[52ch]">
                    Välj kund, anläggning och maskin. Priset räknas fram från prismallen för dag, vecka eller månad, och maskinen kan reserveras i förväg.
                  </p>
                  <Screenshot
                    src="/screens/order-v2.png"
                    alt="Lista över uthyrningsorder med kund, maskin, period, belopp och status"
                    sizes="(min-width: 1024px) 620px, 100vw"
                    className="mt-8 aspect-[16/10]"
                    imgClassName={zoomImg}
                  />
                </Link>
              </AnimateIn>

              {/* Pickup and return */}
              <AnimateIn delay={60} className="lg:col-span-5">
                <Link href="/funktioner" className={`${cardLink} relative min-h-[420px] overflow-hidden justify-end p-7 sm:p-9 text-white`}>
                  <Image
                    src="/Rental-truck-demo-picture.png"
                    alt="Motviktstruck med pall i ett lager"
                    fill
                    sizes="(min-width: 1024px) 440px, 100vw"
                    className={`object-cover object-[20%_center] ${zoomImg}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/0" />
                  <div className="relative">
                    <h3 className="text-[20px] font-semibold tracking-tight">Utlämning och retur med QR-kod</h3>
                    <p className="mt-3 text-[15px] text-slate-200 leading-relaxed">
                      Skanna maskinens QR-kod och registrera drifttimmar, skick, foton och tillbehör. En skadad maskin går direkt till service.
                    </p>
                  </div>
                </Link>
              </AnimateIn>

              {/* Agreements */}
              <AnimateIn className="lg:col-span-5">
                <Link href="/funktioner" className={`${cardLink} bg-jade p-7 sm:p-9 hover:shadow-[0_24px_50px_-24px_rgba(91,200,161,0.5)]`}>
                  <h3 className="text-[20px] font-semibold text-ink tracking-tight">Hyresavtal med e-signering</h3>
                  <p className="mt-3 text-[15px] text-ink/80 leading-relaxed">
                    Avtalet skapas från ordern och skickas till kunden via e-post. Kunden signerar med BankID.
                  </p>
                  <p className="mt-3 text-[15px] text-ink/80 leading-relaxed">
                    Det går till beställarens e-post, eller kundens om ingen beställare är angiven. Kunden behöver inget konto i FleetOS. En rörlig kostnad tillkommer per skickat avtal.
                  </p>
                  <ul className="mt-auto pt-10 space-y-3.5">
                    {['Skapas direkt från ordern', 'Kunden signerar med BankID', 'Signeringsstatus följs upp i FleetOS', 'Det signerade avtalet sparas på ordern'].map((t) => (
                      <li key={t} className="flex gap-3 text-[15px] font-medium text-ink leading-snug">
                        <span className="mt-[1px] flex items-center justify-center w-[18px] h-[18px] rounded-full bg-ink shrink-0">
                          <Check className="w-3 h-3 text-jade" strokeWidth={3} />
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </Link>
              </AnimateIn>

              {/* Fortnox */}
              <AnimateIn delay={60} className="lg:col-span-7">
                <Link href="/integrationer/fortnox" className={`${cardLink} bg-white ring-1 ring-white/10 hover:ring-ice/70 p-7 sm:p-9`}>
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
                  <CardArrow className="mt-auto pt-8">Så fungerar Fortnox-integrationen</CardArrow>
                </Link>
              </AnimateIn>

              {/* Profitability */}
              <AnimateIn className="lg:col-span-12">
                <Link href="/funktioner" className={`${cardLink} bg-white ring-1 ring-white/10 hover:ring-ice/70 p-7 sm:p-9 lg:grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-8 lg:gap-12 items-center`}>
                  <div>
                    <h3 className="text-[20px] font-semibold text-slate-950 tracking-tight">Lönsamhet per maskin</h3>
                    <p className="mt-3 text-[15px] text-slate-500 leading-relaxed">
                      Intäkter, beläggning och resultat per maskin och kund, räknat mot inköp, leasing, försäkring och service. Ni ser vilka maskiner som tjänar pengar och vilka som står still.
                    </p>
                    <CardArrow className="mt-8">Se alla funktioner</CardArrow>
                  </div>
                  <Screenshot
                    src="/screens/statistik-v2.png"
                    alt="Statistik med intäkter per månad, intäkt per kategori och lönsamhet per maskin"
                    sizes="(min-width: 1024px) 700px, 100vw"
                    className="mt-8 lg:mt-0 aspect-[16/9]"
                    imgClassName={zoomImg}
                  />
                </Link>
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
                    <Link href={href} className="group grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_auto] gap-3 md:gap-10 items-center py-8 md:-mx-5 md:px-5 rounded-[14px] transition-colors duration-200 hover:bg-slate-50">
                      <h3 className="text-[20px] sm:text-[22px] font-semibold text-slate-950 tracking-tight transition-colors group-hover:text-blue-700">{title}</h3>
                      <p className="text-[15px] text-slate-500 leading-relaxed text-pretty">{desc}</p>
                      <span className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl ring-1 ring-slate-200 text-slate-400 transition-[background-color,color,transform] duration-200 ease-out-strong group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600 group-hover:translate-x-0.5">
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

        {/* Device band: the same orders on the office laptop (sm+) and the workshop phone (mobile) */}
        <section className="relative isolate overflow-hidden py-24 sm:py-32 px-4 sm:px-6 bg-ink">
          <div aria-hidden="true" className="device-glow absolute inset-0 -z-10" />
          <div className="max-w-6xl mx-auto">
            <AnimateIn className="max-w-3xl mx-auto text-center">
              <h2 className={sectionHeadingDark}>
                Kontoret och verkstaden <span className="text-jade">ser samma sak</span>
              </h2>
              <p className={`${sectionLeadDark} mx-auto`}>
                FleetOS körs i webbläsaren på dator, surfplatta och mobil. När verkstaden registrerar en retur med QR-koden syns den direkt hos säljarna.
              </p>
            </AnimateIn>

            <div className="relative mt-16 sm:mt-20 mx-auto max-w-[880px]">
              {/* Laptop: a plain front view, so the real screenshot stays the subject */}
              <div className="device-rise hidden sm:block">
                <div className="rounded-t-[22px] bg-[#0b0e14] p-[1.6%] pb-[2.4%] ring-1 ring-white/10 shadow-[0_50px_90px_-35px_rgba(0,0,0,0.85)]">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-white">
                    <Image
                      src="/screens/orders-desktop.png"
                      alt="Uthyrningsorder i FleetOS med kund, maskin, period, belopp och status"
                      fill
                      sizes="(min-width: 1024px) 860px, 90vw"
                      className="object-cover object-left-top"
                    />
                  </div>
                </div>
                <div className="relative -mx-[7%] h-[18px] rounded-b-[20px] bg-gradient-to-b from-[#3a3f48] to-[#16191f]">
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[14%] h-[6px] rounded-b-[8px] bg-[#0d1015]" />
                </div>
              </div>

              {/* Phone */}
              <div className="device-rise sm:hidden mx-auto w-[68%] max-w-[290px]">
                <div className="rounded-[46px] bg-[#0b0e14] p-[3.4%] ring-1 ring-white/15 shadow-[0_50px_90px_-35px_rgba(0,0,0,0.85)]">
                  <div className="relative flex flex-col aspect-[390/844] overflow-hidden rounded-[38px] bg-white">
                    {/* iOS status bar, so the app header clears the Dynamic Island */}
                    <div className="relative h-[6.4%] shrink-0 flex items-center justify-between px-[9%] text-[11px] font-semibold text-slate-900">
                      <span>9:41</span>
                      <span className="flex items-center gap-1">
                        <Signal className="w-3 h-3" strokeWidth={2.5} />
                        <Wifi className="w-3 h-3" strokeWidth={2.5} />
                        <BatteryFull className="w-4 h-4" strokeWidth={2} />
                      </span>
                      <div className="absolute left-1/2 -translate-x-1/2 top-[22%] w-[31%] h-[56%] rounded-full bg-black" />
                    </div>
                    <div className="relative flex-1">
                      <Image
                        src="/screens/orders-mobile.png"
                        alt="Uthyrningsorder i FleetOS i mobilen"
                        fill
                        sizes="290px"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Events from the demo data, drifting around the device */}
              <AnimateIn delay={250} direction="scale" className="absolute left-0 sm:left-[-9%] top-[15%] sm:top-[10%] z-10">
                <EventCard icon={FileText} tone="blue" title="Ny order" meta="FR-202606-0287 · Lindström Bygg AB" className="sticker rotate-[-3deg] bg-[#121d38]" />
              </AnimateIn>
              <AnimateIn delay={400} direction="scale" className="absolute right-0 sm:right-[-10%] top-[34%] z-10">
                <EventCard icon={QrCode} tone="jade" title="Retur registrerad via QR" meta="Toyota 8FBN25 · tillbaka i lager" className="sticker rotate-[2deg] bg-[#121d38]" />
              </AnimateIn>
              <AnimateIn delay={550} direction="scale" className="hidden sm:block absolute left-[-5%] bottom-[20%] z-10">
                <EventCard icon={Clock} tone="amber" title="Försenad retur" meta="Volvo L60H · Björk & Söner Anläggning" className="sticker rotate-[2deg] bg-[#121d38]" />
              </AnimateIn>
              <AnimateIn delay={700} direction="scale" className="absolute right-0 sm:right-[-7%] bottom-[8%] z-10">
                <EventCard icon={Check} tone="jade" title="Klar för fakturering" meta="FR-202604-2990 · 15 200 kr" className="sticker rotate-[-2deg] bg-[#121d38]" />
              </AnimateIn>
            </div>
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
                  { name: 'Fortnox', href: '/integrationer/fortnox', from: 'FleetOS', to: 'Fortnox', direction: 'Från FleetOS till Fortnox', desc: 'Klara ordrar och delfakturor skickas som ordrar i Fortnox med kund, hyresrader, artikelnummer och kostnadsställe. Kunder som saknas skapas automatiskt.' },
                  { name: 'Serviceprotokoll', href: '/integrationer/serviceprotokoll', from: 'Serviceprotokoll', to: 'FleetOS', direction: 'Från Serviceprotokoll till FleetOS', desc: 'Hyresmaskiner med tekniska data samt kunder, anläggningar och kontakter hämtas automatiskt var 30:e minut.' },
                ].map(({ name, href, from, to, direction, desc }) => (
                  <div key={name} className="p-7 sm:p-10 flex flex-col">
                    <div className="mb-8 rounded-[14px] bg-slate-50 px-4 py-5">
                      <FlowDiagram from={from} to={to} />
                    </div>
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
                <li key={title} className="relative pt-7">
                  <span aria-hidden="true" className="absolute top-0 inset-x-0 h-[3px] rounded-full bg-slate-200" />
                  <span
                    aria-hidden="true"
                    className="step-fill absolute top-0 inset-x-0 h-[3px] rounded-full bg-gradient-to-r from-ice to-jade"
                    style={{ '--fill-from': `${10 + i * 6}%`, '--fill-to': `${22 + i * 6}%` } as React.CSSProperties}
                  />
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
            {/* Two panels: the pitch on navy, the action as a whole jade field. */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] overflow-hidden rounded-[1.5rem]">
              <div className="relative isolate flex flex-col bg-ink px-7 py-12 sm:px-12 sm:py-16">
                <div aria-hidden="true" className="dot-field-dark absolute inset-0 -z-10" />
                <h2 className={sectionHeadingDark}>Se FleetOS med era egna maskiner</h2>
                <p className="mt-5 text-[16.5px] text-slate-300 leading-relaxed max-w-[48ch] text-pretty">
                  Vi visar flödet från order till retur och fakturaunderlag. Ingen bindningstid, och ni betalar månad för månad.
                </p>
                <Link href="/kontakt" className="group mt-10 self-start inline-flex items-center gap-2 border-b border-white/30 pb-1 text-[17px] font-medium text-white transition-colors hover:border-white">
                  Kontakta oss
                  <ArrowUpRight className="w-5 h-5 transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
                </Link>
              </div>
              <Link href="/kom-igang" className="group flex min-h-[260px] flex-col justify-between bg-jade px-7 py-12 sm:px-12 sm:py-16 text-ink transition-colors duration-200 hover:bg-[#6dd0ad]">
                <span className="text-[15.5px] font-medium text-ink/80 max-w-[30ch] text-pretty">
                  Vi går igenom era behov, sätter upp kontot och ni bjuder in kollegorna.
                </span>
                <span className="mt-12 flex items-end justify-between gap-4 border-b-2 border-ink/80 pb-2">
                  <span className="text-[40px] sm:text-[52px] font-semibold tracking-[-0.035em] leading-none">Boka demo</span>
                  <ArrowUpRight className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 transition-transform duration-300 ease-out-strong group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={1.75} />
                </span>
              </Link>
            </div>
          </AnimateIn>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
