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
      <p className="mb-4">Frågor om dessa villkor skickas till <a href="mailto:info@dseenterprise.se" className="text-blue-600 hover:underline">info@dseenterprise.se</a>.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">12. Ansvarsbegränsning</h2>
      <p className="mb-4">12.1 FleetOS är en molnbaserad programvarutjänst som tillhandahålls av DSE ENTERPRISE AB ("Leverantören") för administration och hantering av kundens verksamhet. FleetOS utgör endast ett tekniskt hjälpmedel och Leverantören ansvarar inte för kundens affärsverksamhet, beslut eller operativa processer.</p>
      <p className="mb-4">12.2 Kunden ansvarar för att all information som registreras, behandlas eller lagras i FleetOS är korrekt, fullständig och uppdaterad. Kunden ansvarar vidare för att granska och verifiera uppgifter, rapporter, avtal, fakturaunderlag, prisuppgifter och annan information som genereras eller hanteras genom tjänsten innan sådan information används eller kommuniceras till tredje man.</p>
      <p className="mb-4">12.3 Leverantören ansvarar inte för skador, förluster eller kostnader som uppkommer till följd av kundens uthyrningsverksamhet, inklusive men inte begränsat till stöld, förlust av utrustning, sakskador, personskador, driftstopp, felaktig användning av maskiner eller tvister mellan kunden och dess kunder eller samarbetspartners.</p>
      <p className="mb-4">12.4 FleetOS tillhandahålls i befintligt skick ("as is"). Leverantören lämnar inga uttryckliga eller underförstådda garantier avseende tjänstens funktion, tillgänglighet, lämplighet för visst ändamål eller att tjänsten kommer att vara fri från fel, avbrott eller störningar.</p>
      <p className="mb-4">12.5 Leverantören ansvarar inte för fel, avbrott eller brister som orsakas av tredjepartsleverantörer, externa integrationer, API:er, kommunikationsnät, internetanslutningar, molninfrastruktur eller andra omständigheter utanför Leverantörens rimliga kontroll.</p>
      <p className="mb-4">12.6 Leverantören ska under inga omständigheter vara ansvarig för indirekt skada, följdskada eller ren förmögenhetsskada, inklusive men inte begränsat till utebliven vinst, uteblivna intäkter, produktionsbortfall, dataförlust, goodwillförlust eller förlust av affärsmöjligheter.</p>
      <p className="mb-4">12.7 Om Leverantören trots ovanstående bestämmelser skulle anses ansvarig för skada ska Leverantörens sammanlagda ansvar under en tolvmånadersperiod vara begränsat till ett belopp motsvarande de avgifter som kunden faktiskt har betalat för FleetOS under de tolv (12) månader som närmast föregått den skadegörande händelsen.</p>
      <p className="mb-4">12.8 Ansvarsbegränsningen i denna punkt ska tillämpas i den utsträckning som är tillåten enligt tillämplig lag och gäller oavsett om anspråket grundas på avtal, skadeståndsrätt eller annan rättslig grund.</p>
    </PublicLayout>
  );
}
