import PublicLayout from '@/components/layout/PublicLayout';

const items = [
  { status: 'Planerad', label: 'Snart', title: 'Fakturaintegrationer', desc: 'Direkt export till Fortnox och Visma.' },
  { status: 'Planerad', label: 'Snart', title: 'Kundportal', desc: 'Kunder kan se sina aktiva ordrar och dokument online.' },
  { status: 'Planerad', label: 'Q3 2026', title: 'Mobilapp', desc: 'Native iOS och Android-app för fältpersonal.' },
  { status: 'Planerad', label: 'Q3 2026', title: 'Kalendervy', desc: 'Visualisera tillgänglighet och bokningar i en kalender.' },
  { status: 'Planerad', label: 'Q4 2026', title: 'Flerlagersstöd', desc: 'Hantera maskiner och ordrar per lager eller region.' },
  { status: 'Planerad', label: 'Q4 2026', title: 'API', desc: 'Öppet REST-API för integration med egna system.' },
];

export default function RoadmapPage() {
  return (
    <PublicLayout title="Roadmap">
      <p className="text-lg text-slate-500 mb-10">Vad vi arbetar med härnäst. Har du ett förslag? Kontakta oss.</p>
      <div className="not-prose space-y-4">
        {items.map(({ label, title, desc }) => (
          <div key={title} className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="mt-0.5 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full shrink-0">{label}</span>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{title}</p>
              <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}
