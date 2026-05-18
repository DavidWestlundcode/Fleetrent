import PublicLayout from '@/components/layout/PublicLayout';

export default function OmOssPage() {
  return (
    <PublicLayout title="Om oss">
      <p className="text-lg text-slate-500 mb-8">
        FleetRent är en produkt från DSE ENTERPRISE AB — ett svenskt teknikbolag med fokus på smarta verktyg för maskinuthyrningsbranschen.
      </p>
      <p className="mb-6">
        Vi grundades med målet att modernisera en bransch där pappersblanketter och kalkylblad fortfarande är standard. Vår plattform kombinerar AI-teknik med ett enkelt gränssnitt för att ge uthyrningsföretag full kontroll över sin flotta — utan onödig komplexitet.
      </p>
      <p className="mb-6">
        FleetRent används av maskinuthyrare i hela Sverige och fortsätter att växa. Vi lyssnar aktivt på våra kunder och bygger funktioner som löser verkliga problem.
      </p>

      <h2>Varför vi är bättre</h2>
      <p className="mb-6">
        Många mjukvarubolag lägger miljoner på representationskontor, stor säljkår och tung administration — och välter sedan notan på sina kunder via höga månadsavgifter. Vi gör tvärtom.
      </p>
      <p className="mb-6">
        Genom att bygga smarta AI-lösningar som automatiserar det som tidigare krävde manuellt arbete kan vi hålla organisationen lean. Inga onödiga overhead-kostnader. Ingen adminpersonal för saker som en algoritm löser bättre. Det frigör resurser som vi istället lägger på att göra produkten bättre — och priset lägre.
      </p>
      <p className="mb-6">
        Resultatet är en produkt som faktiskt kostar mindre än konkurrenterna, men som levererar mer. Inte trots att vi är ett litet team — utan tack vare det.
      </p>

      <div className="not-prose mt-2 mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'AI-driven automatisering', desc: 'Flöden som annars kräver manuell hantering sköts automatiskt — från orderhantering till fakturaunderlag.' },
          { title: 'Lean organisation', desc: 'Inga flashiga kontor eller onödig administration. Varje krona går till produktutveckling.' },
          { title: 'Lägre pris, bättre produkt', desc: 'Vi sparar på rätt ställen och för kostnadsbesparingen direkt vidare till våra kunder.' },
        ].map(({ title, desc }) => (
          <div key={title} className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-sm font-semibold text-blue-900 mb-1">{title}</p>
            <p className="text-sm text-blue-700 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="not-prose mt-10 p-6 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-900 mb-1">DSE ENTERPRISE AB</p>
        <p className="text-sm text-slate-500">Sverige</p>
        <p className="text-sm text-slate-500 mt-3">
          Frågor?{' '}
          <a href="mailto:info@fleetrent.se" className="text-blue-600 hover:underline">info@fleetrent.se</a>
        </p>
      </div>
    </PublicLayout>
  );
}
