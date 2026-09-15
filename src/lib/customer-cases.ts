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
      'Maskiner och kunder synkade automatiskt via Serviceprotokoll-integrationen',
    ],
    body: [
      'WTS Machinery Solutions använder FleetOS för att hantera hela sin uthyrningsverksamhet – från maskinregister och uthyrningsorder till kundhantering, avtal och fakturering.',
      'Med FleetOS har WTS full kontroll över var varje maskin befinner sig, vilket skick den är i och när den ska returneras – i realtid, utan att behöva leta information i separata Excel-filer.',
      'Genom Fortnox-integrationen skickas fakturaunderlag vidare till bokföringen med några klick, och för kunder med långtidskontrakt genereras delfakturor automatiskt varje månad via FleetOS avtalshyra-funktion.',
      'WTS använder även FleetOS integration mot Serviceprotokoll, vilket gör att maskiner och kunder synkroniseras automatiskt mellan systemen – utan dubbelregistrering eller manuellt underhåll av flera register.',
      'FleetOS ger också WTS full insyn i verksamhetens lönsamhet. De kan se exakt hur mycket varje maskin, kund och uthyrning genererar i intäkter, vilket ger bättre beslutsunderlag och total kontroll över verksamheten.',
    ],
  },
];
