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
    industry: 'Totalleverantör inom materialhantering',
    summary: 'Digitaliserade hela sin maskinuthyrning med FleetOS – från orderhantering till fakturering.',
    highlights: [
      'Hela maskinflottan samlad på ett ställe',
      'Automatisk fakturering via Fortnox-integrationen',
      'Löpande avtalsfakturering för långtidskontrakt',
    ],
    body: [
      'WTS Machinery Solutions använder FleetOS för att hantera hela sin uthyrningsverksamhet – från maskinregister och uthyrningsorder till kundhantering, avtal och fakturering.',
      'Med FleetOS har WTS full kontroll över var varje maskin befinner sig, vilket skick den är i och när den ska returneras – i realtid, utan att behöva leta information i separata Excel-filer.',
      'Genom Fortnox-integrationen skickas fakturaunderlag vidare till bokföringen med några klick, och för kunder med långtidskontrakt genereras delfakturor automatiskt varje månad via FleetOS avtalshyra-funktion.',
      'FleetOS ger också WTS full insyn i verksamhetens lönsamhet. De kan se exakt hur mycket varje maskin, kund och uthyrning genererar i intäkter, vilket ger bättre beslutsunderlag och total kontroll över verksamheten.',
    ],
  },
];
