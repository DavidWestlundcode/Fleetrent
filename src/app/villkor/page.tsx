import PublicLayout from '@/components/layout/PublicLayout';

export const revalidate = 86400;

export default function VillkorPage() {
  return (
    <PublicLayout title="Användarvillkor">
      <p className="text-sm text-slate-400 mb-8">Senast uppdaterad: juni 2026</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">1. Tjänsten</h2>
      <p className="mb-4">FleetOS tillhandahålls av DSE ENTERPRISE AB som en molnbaserad tjänst (SaaS) för hantering av maskinflottor. Användning av tjänsten innebär att du accepterar dessa villkor.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">2. Konto och ansvar</h2>
      <p className="mb-4">Du ansvarar för att hålla dina inloggningsuppgifter konfidentiella och för all aktivitet som sker via ditt konto. Kontakta oss omedelbart vid misstänkt obehörig åtkomst.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">3. Tillåten användning</h2>
      <p className="mb-4">Tjänsten får endast användas för lagliga ändamål och i enlighet med dessa villkor. Det är inte tillåtet att missbruka tjänsten, försöka komma åt data som inte tillhör dig eller använda automatiserade metoder för att extrahera data.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">4. Tillgänglighet</h2>
      <p className="mb-4">Vi strävar efter hög tillgänglighet men garanterar inte att tjänsten är tillgänglig utan avbrott. Planerat underhåll meddelas i förväg.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">5. Priser och ändringar</h2>
      <p className="mb-4">FleetOS förbehåller sig rätten att justera priser och tjänstens innehåll. Eventuella prisändringar meddelas minst 30 dagar innan de träder i kraft.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">6. Uppsägning</h2>
      <p className="mb-4">Antingen part kan säga upp avtalet. Vid uppsägning avslutas åtkomsten till tjänsten och data raderas i enlighet med vår datalagringsPolicy.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">7. Tillämplig lag</h2>
      <p className="mb-4">Dessa villkor regleras av svensk lag. Tvister ska i första hand lösas genom förhandling och i andra hand via allmän domstol med Stockholm som forum.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">8. Kontakt</h2>
      <p className="mb-4">Frågor om dessa villkor skickas till <a href="mailto:david@fleetos.se,elias@fleetos.se" className="text-blue-600 hover:underline">david@fleetos.se & elias@fleetos.se</a>.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">12. Ansvarsbegränsning</h2>
      <p className="mb-4">12.1 FleetOS är en molnbaserad programvarutjänst som tillhandahålls av DSE ENTERPRISE AB ("Leverantören") för administration och hantering av kundens verksamhet. FleetOS utgör endast ett tekniskt hjälpmedel och Leverantören ansvarar inte för kundens affärsverksamhet, affärsbeslut, uthyrningsprocesser eller operativa verksamhet.</p>
      <p className="mb-4">12.2 Kunden ansvarar för att all information som registreras, behandlas eller lagras i FleetOS är korrekt, fullständig och uppdaterad. Kunden ansvarar vidare för att granska och verifiera uppgifter, rapporter, avtal, fakturaunderlag, prisuppgifter, kunduppgifter och annan information som genereras eller hanteras genom tjänsten innan sådan information används eller kommuniceras till tredje man.</p>
      <p className="mb-4">12.3 Kunden ansvarar för att löpande exportera och säkerhetskopiera affärskritisk information i den utsträckning kunden bedömer nödvändig för sin verksamhet.</p>
      <p className="mb-4">12.4 Leverantören ansvarar inte för skador, förluster eller kostnader som uppkommer till följd av kundens uthyrningsverksamhet, inklusive men inte begränsat till stöld, förlust av utrustning, sakskador, personskador, driftstopp, felaktig användning av maskiner eller tvister mellan kunden och dess kunder, leverantörer eller samarbetspartners.</p>
      <p className="mb-4">12.5 FleetOS tillhandahålls i befintligt skick ("as is"). Leverantören lämnar inga uttryckliga eller underförstådda garantier avseende tjänstens funktion, tillgänglighet, lämplighet för visst ändamål eller att tjänsten kommer att vara fri från fel, avbrott eller störningar.</p>
      <p className="mb-4">12.6 Leverantören garanterar inte oavbruten eller felfri drift. Tillfälliga avbrott kan förekomma till följd av underhåll, uppdateringar, säkerhetsåtgärder, tekniska problem eller omständigheter utanför Leverantörens kontroll. Kunden har inte rätt till ersättning eller skadestånd på grund av sådana avbrott, såvida inte annat uttryckligen anges i avtalet.</p>
      <p className="mb-4">12.7 Leverantören ansvarar inte för fel, avbrott eller brister som orsakas av tredjepartsleverantörer, externa integrationer, API:er, kommunikationsnät, internetanslutningar, molninfrastruktur eller andra omständigheter utanför Leverantörens rimliga kontroll.</p>
      <p className="mb-4">12.8 Leverantören ansvarar inte för felaktiga transaktioner, dokument, fakturor, avtal, rapporter eller dataöverföringar som uppstår genom användning av tredjepartsintegrationer eller på grund av felaktig, ofullständig eller föråldrad information som tillhandahållits av kunden eller tredje part.</p>
      <p className="mb-4">12.9 Om FleetOS tillhandahåller analyser, rekommendationer, prognoser, automatiserade arbetsflöden eller funktioner baserade på artificiell intelligens eller automatiserad databehandling är dessa endast vägledande. Kunden ansvarar ensam för samtliga affärsbeslut, ekonomiska beslut och operativa beslut som fattas med stöd av sådan information.</p>
      <p className="mb-4">12.10 Leverantören ansvarar inte för indirekt skada, följdskada eller ren förmögenhetsskada, inklusive men inte begränsat till utebliven vinst, uteblivna intäkter, förlust av kunder, produktionsbortfall, dataförlust, goodwillförlust, förlust av affärsmöjligheter eller andra ekonomiska följdverkningar.</p>
      <p className="mb-4">12.11 Leverantören ansvarar inte för dataförlust, datakorruption, obehörig åtkomst, säkerhetsincidenter eller dataintrång som orsakats av tredje part, kundens användare, kundens systemmiljö eller andra omständigheter utanför Leverantörens rimliga kontroll.</p>
      <p className="mb-4">12.12 Om Leverantören trots ovanstående bestämmelser skulle anses ansvarig för skada ska Leverantörens sammanlagda ansvar under en tolvmånadersperiod vara begränsat till det högre av: a) de avgifter som kunden faktiskt har betalat för FleetOS under de tolv (12) månader som närmast föregått den skadegörande händelsen, eller b) 10 000 SEK.</p>
      <p className="mb-4">12.13 Kunden ska framställa skriftligt krav mot Leverantören senast nittio (90) dagar efter att kunden upptäckt eller borde ha upptäckt den omständighet som ligger till grund för kravet. Anspråk som framställs senare ska anses förverkade.</p>
      <p className="mb-4">12.14 Ansvarsbegränsningarna i denna punkt gäller inte för skada som orsakats genom uppsåt eller grov vårdslöshet från Leverantörens sida eller i den utsträckning ansvar inte får begränsas enligt tvingande lag.</p>
      <p className="mb-4">12.15 Leverantören ska inte anses ansvarig för underlåtenhet att fullgöra sina skyldigheter enligt avtalet om sådan underlåtenhet beror på omständighet utanför Leverantörens rimliga kontroll, inklusive men inte begränsat till naturkatastrof, krig, myndighetsåtgärd, arbetskonflikt, cyberattack, omfattande driftstörning hos tredjepartsleverantör, avbrott i elförsörjning, internetstörning eller annan jämförbar händelse (force majeure).</p>
      <p className="mb-4">12.16 Ansvarsbegränsningen i denna punkt ska tillämpas i den utsträckning som är tillåten enligt tillämplig lag och gäller oavsett om anspråket grundas på avtal, skadeståndsrätt eller annan rättslig grund.</p>
    </PublicLayout>
  );
}
