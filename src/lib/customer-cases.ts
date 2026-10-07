export interface CustomerCase {
  slug: string;
  name: string;
  logo: string;
  industry: string;
  /** Used as the meta description and the intro under the H1. */
  summary: string;
  highlights: string[];
  sections: { heading: string; paragraphs: string[] }[];
  related: { href: string; title: string; desc: string }[];
  /** Date the case text last changed — used as lastmod in the sitemap. */
  lastModified: string;
}

// Only describe workflows the customer actually uses and features that exist. No quotes,
// time savings or results unless the customer has confirmed them in writing.
export const CUSTOMER_CASES: CustomerCase[] = [
  {
    slug: 'wts-machinery-solutions',
    name: 'WTS Machinery Solutions',
    logo: '/wts-logo.png',
    industry: 'Totalleverantör inom materialhantering',
    summary: 'Så använder WTS Machinery Solutions FleetOS för sin maskinuthyrning – från maskinregister och order till avtalshyra och fakturaunderlag i Fortnox.',
    highlights: [
      'Maskinflotta och kunder hämtas automatiskt från Serviceprotokoll',
      'Ordrar och delfakturor skickas till Fortnox',
      'Avtalshyra med månadsvisa delfakturor för långtidskontrakt',
    ],
    sections: [
      {
        heading: 'Om WTS Machinery Solutions',
        paragraphs: [
          'WTS Machinery Solutions är en totalleverantör inom materialhantering. Uthyrningen omfattar både kortare hyror och långtidskontrakt, med kunder som ofta har flera anläggningar.',
        ],
      },
      {
        heading: 'Så används FleetOS',
        paragraphs: [
          'WTS använder FleetOS för hela uthyrningsflödet: maskinregister, uthyrningsordrar, kunder, hyresavtal och fakturaunderlag. Varje maskin har ett maskinkort med status, tekniska data och historik, så att det går att se vilka maskiner som är uthyrda, till vem och när de ska tillbaka utan att leta i separata Excel-filer.',
          'Ordrarna kopplas till kundens anläggning och beställare, och när en order är klar för fakturering skickas den till Fortnox med hyresrader, tillägg och artikelnummer.',
        ],
      },
      {
        heading: 'Avtalshyra för långtidskontrakt',
        paragraphs: [
          'För kunder med långtidskontrakt använder WTS avtalshyra. FleetOS skapar då automatiskt en delfaktura för varje aktiv avtalsorder i slutet av månaden. Delfakturorna granskas i FleetOS och skickas sedan till Fortnox, så att ekonomi behåller kontrollen över vad som faktureras.',
        ],
      },
      {
        heading: 'Integration med Serviceprotokoll',
        paragraphs: [
          'WTS använder Serviceprotokoll för service, och FleetOS hämtar maskiner och kunder därifrån automatiskt. Tekniska data, kunder, anläggningar och kontaktpersoner behöver därför inte föras in två gånger eller underhållas i två register.',
        ],
      },
      {
        heading: 'Uppföljning',
        paragraphs: [
          'I FleetOS kan WTS följa intäkter per maskin, kund och uthyrning, vilket ger underlag för beslut om flottan.',
        ],
      },
    ],
    related: [
      { href: '/uthyrning/truckar', title: 'Uthyrningssystem för truckar', desc: 'Avtalshyra, tekniska data och tillbehörskontroll' },
      { href: '/integrationer/fortnox', title: 'Fortnox-integration', desc: 'Vad som skickas till Fortnox och hur' },
      { href: '/integrationer/serviceprotokoll', title: 'Serviceprotokoll-integration', desc: 'Vad som hämtas och hur ofta' },
      { href: '/funktioner', title: 'Alla funktioner', desc: 'Från maskinregister till lönsamhet per maskin' },
    ],
    lastModified: '2026-10-07',
  },
];
