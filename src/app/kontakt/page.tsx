import PublicLayout from '@/components/layout/PublicLayout';

export default function KontaktPage() {
  return (
    <PublicLayout title="Kontakt">
      <p className="text-lg text-slate-500 mb-10">
        Vi svarar normalt inom en arbetsdag.
      </p>
      <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { title: 'Support', desc: 'Frågor om plattformen eller ditt konto.', email: 'support@fleetrent.se' },
          { title: 'Försäljning', desc: 'Frågor om priser eller att komma igång.', email: 'sales@fleetrent.se' },
          { title: 'Press', desc: 'Medieförfrågningar och intervjuer.', email: 'press@fleetrent.se' },
          { title: 'Övrigt', desc: 'Allt annat — vi hjälper gärna.', email: 'info@fleetrent.se' },
        ].map(({ title, desc, email }) => (
          <div key={title} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">{title}</p>
            <p className="text-sm text-slate-500 mb-3">{desc}</p>
            <a href={`mailto:${email}`} className="text-sm text-blue-600 hover:underline">{email}</a>
          </div>
        ))}
      </div>
      <div className="not-prose mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-900 mb-1">DSE ENTERPRISE AB</p>
        <p className="text-sm text-slate-500">Sverige · Org.nr xxxxxxxxxx</p>
      </div>
    </PublicLayout>
  );
}
