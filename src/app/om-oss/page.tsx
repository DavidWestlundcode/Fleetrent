import Image from 'next/image';
import PublicLayout from '@/components/layout/PublicLayout';

export const revalidate = 86400;

export default function OmOssPage() {
  return (
    <PublicLayout title="Om oss">
      <p className="text-lg text-slate-500 mb-8">
        FleetOS är en produkt från DSE ENTERPRISE AB — ett svenskt teknikbolag med fokus på smarta verktyg för maskinuthyrningsbranschen.
      </p>
      <p className="mb-6">
        Vi grundades med målet att modernisera en bransch där pappersblanketter och kalkylblad fortfarande är norm. Vår plattform ger maskinuthyrare full kontroll över sin flotta — från offert och avtal till fakturering och servicehistorik — i ett och samma system.
      </p>
      <div className="not-prose flex items-center justify-center gap-10 sm:gap-16 my-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
            <Image src="/david-profilbild.jpg" alt="David Vestlund" width={128} height={128} className="w-full h-full object-cover" />
          </div>
          <p className="text-sm font-semibold text-slate-900">David Vestlund</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
            <Image src="/elias-profilbild.jpg" alt="Elias Morberg" width={128} height={128} className="w-full h-full object-cover" />
          </div>
          <p className="text-sm font-semibold text-slate-900">Elias Morberg</p>
        </div>
      </div>

      <h2>Varför vi startade FleetOS</h2>
      <p className="mb-6">
        Idén till FleetOS föddes inte i maskinuthyrningsbranschen, utan i truckbranschen. Det var där David Vestlund, en av grundarna, först stötte på problemet: hyror och hyressystem som byggde på lösa Excel-ark, pappersblanketter och manuell uppföljning — system som var krångliga, lätta att göra fel i och nästan omöjliga att få en samlad överblick av.
      </p>
      <p className="mb-6">
        Tanken som föddes där var enkel: <em>&quot;Det här kan man göra bättre.&quot;</em> Den idén blev startskottet för FleetOS — tillsammans med medgrundare Elias Morberg har vi sedan byggt vidare på den för att skapa ett system som faktiskt är anpassat för hur maskinuthyrning fungerar i verkligheten, inte tvärtom.
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
          <a href="mailto:info@dseenterprise.se" className="text-blue-600 hover:underline">info@dseenterprise.se</a>
        </p>
      </div>
    </PublicLayout>
  );
}
