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
