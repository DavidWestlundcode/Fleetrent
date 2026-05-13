import PublicLayout from '@/components/layout/PublicLayout';

export default function PressPage() {
  return (
    <PublicLayout title="Press">
      <p className="text-lg text-slate-500 mb-8">
        För pressförfrågningar, intervjuer eller mediamaterial, kontakta oss via e-post.
      </p>
      <div className="not-prose space-y-4">
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-900 mb-1">Presskontakt</p>
          <p className="text-sm text-slate-500">
            <a href="mailto:press@fleetrent.se" className="text-blue-600 hover:underline">press@fleetrent.se</a>
          </p>
        </div>
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-900 mb-2">Om FleetRent</p>
          <p className="text-sm text-slate-500 leading-relaxed">
            FleetRent är en AI-driven SaaS-plattform för maskinuthyrning, utvecklad av DSE ENTERPRISE AB. Plattformen hjälper uthyrningsföretag att digitalisera och effektivisera hanteringen av maskinflottor, ordrar och kunder.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
