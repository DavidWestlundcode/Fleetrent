import PublicLayout from '@/components/layout/PublicLayout';

export default function OmOssPage() {
  return (
    <PublicLayout title="Om oss">
      <p className="text-lg text-slate-500 mb-8">
        FleetOS är en produkt från DSE ENTERPRISE AB — ett svenskt teknikbolag med fokus på smarta verktyg för maskinuthyrningsbranschen.
      </p>
      <p className="mb-6">
        Vi grundades med målet att modernisera en bransch där pappersblanketter och kalkylblad fortfarande är norm. Vår plattform ger maskinuthyrare full kontroll över sin flotta — från offert och avtal till fakturering och servicehistorik — i ett och samma system.
      </p>
      <p className="mb-6">
        FleetOS används av maskinuthyrare i hela Sverige. Vi bygger nära våra kunder och prioriterar funktioner som löser verkliga problem i vardagen.
      </p>

      <h2>Vad vi står för</h2>
      <p className="mb-6">
        Maskinuthyrning är en bransch som kräver precision — rätt maskin, rätt kund, rätt tidpunkt. Vi har byggt FleetOS för att göra den precisionen tillgänglig utan att det kräver timmar av administration.
      </p>
      <p className="mb-6">
        Genom att automatisera det som är rutinmässigt frigör vi tid för det som faktiskt skapar värde: kundrelationer, underhåll och tillväxt. Det är utgångspunkten för allt vi bygger.
      </p>

      <div className="not-prose mt-2 mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Byggt för branschen', desc: 'FleetOS är utformat specifikt för maskinuthyrning — inte en generisk plattform som anpassats i efterhand.' },
          { title: 'Automatiserade flöden', desc: 'Från orderhantering till signerade avtal och fakturaunderlag — utan manuella mellansteg.' },
          { title: 'Enkel att använda', desc: 'Ett gränssnitt som personalen faktiskt vill använda, utan lång inlärningstid eller konsulthjälp.' },
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
        <p className="text-sm text-slate-500">Org.nr: 559510-0248</p>
        <p className="text-sm text-slate-500 mt-3">
          Frågor?{' '}
          <a href="mailto:info@FleetOS.se" className="text-blue-600 hover:underline">info@FleetOS.se</a>
        </p>
      </div>
    </PublicLayout>
  );
}
