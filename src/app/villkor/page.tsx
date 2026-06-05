import PublicLayout from '@/components/layout/PublicLayout';

export const revalidate = 86400;

export default function VillkorPage() {
  return (
    <PublicLayout title="Användarvillkor">
      <p className="text-sm text-slate-400 mb-8">Senast uppdaterad: maj 2026</p>

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
    </PublicLayout>
  );
}
