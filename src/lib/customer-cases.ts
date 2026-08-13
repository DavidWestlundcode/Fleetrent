export interface CustomerCase {
  slug: string;
  name: string;
  logo: string;
  industry: string;
  summary: string;
  highlights: string[];
  body: string[];
}

export const CUSTOMER_CASES: CustomerCase[] = [
  {
    slug: 'wts-machinery-solutions',
    name: 'WTS Machinery Solutions',
    logo: '/wts-logo.png',
    industry: 'Maskinuthyrning',
    summary: 'Digitaliserade hela sin maskinuthyrning med FleetOS – från orderhantering till fakturering.',
    highlights: [
      'Hela maskinflottan samlad på ett ställe',
      'Automatisk fakturering via Fortnox-integrationen',
      'Löpande avtalsfakturering för långtidskontrakt',
    ],
    body: [
      'WTS Machinery Solutions hyr ut maskiner till bygg- och anläggningsbranschen och använder FleetOS för att hantera hela sin verksamhet – från maskinregister och uthyrningsorder till kundhantering och fakturering.',
      'Med FleetOS har WTS koll på var varje maskin befinner sig, vilket skick den är i och när den ska returneras – i realtid, utan att behöva slå upp information i separata Excel-filer.',
      'Genom Fortnox-integrationen skickas fakturaunderlag vidare till bokföringen med några klick, och för kunder med långtidskontrakt genereras delfakturor automatiskt varje månad via FleetOS avtalshyra-funktion.',
    ],
  },
];
