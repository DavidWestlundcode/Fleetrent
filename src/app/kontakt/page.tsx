import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import PublicLayout from '@/components/layout/PublicLayout';

export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({
  path: '/kontakt',
  title: 'Kontakta oss',
  description: 'Kontakta FleetOS om demo, priser, support eller press. Vi svarar normalt inom en arbetsdag. DSE ENTERPRISE AB, org.nr 559510-0248.',
});

export default function KontaktPage() {
  return (
    <PublicLayout title="Kontakt" breadcrumbs={[{ name: 'Kontakt', path: '/kontakt' }]}>
      <p className="text-lg text-slate-500 mb-10">
        Vi svarar normalt inom en arbetsdag.
      </p>
      <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { title: 'Support', desc: 'Frågor om plattformen eller ditt konto.', email: 'david@fleetos.se,elias@fleetos.se' },
          { title: 'Försäljning', desc: 'Frågor om priser eller att komma igång.', email: 'david@fleetos.se,elias@fleetos.se' },
          { title: 'Press', desc: 'Medieförfrågningar och intervjuer.', email: 'david@fleetos.se,elias@fleetos.se' },
          { title: 'Övrigt', desc: 'Allt annat — vi hjälper gärna.', email: 'david@fleetos.se,elias@fleetos.se' },
        ].map(({ title, desc, email }) => (
          <div key={title} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">{title}</p>
            <p className="text-sm text-slate-500 mb-3">{desc}</p>
            <a href={`mailto:${email}`} className="text-sm text-blue-600 hover:underline">{email.replace(',', ' & ')}</a>
          </div>
        ))}
      </div>
      <div className="not-prose mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-900 mb-1">DSE ENTERPRISE AB</p>
        <p className="text-sm text-slate-500">Sverige · Org.nr 559510-0248</p>
        <p className="text-sm text-slate-500 mt-3">
          Vill du se systemet? <a href="/kom-igang" className="text-blue-600 hover:underline">Boka en demo</a> så återkommer vi inom 24 timmar. Läs mer <a href="/om-oss" className="text-blue-600 hover:underline">om oss</a>.
        </p>
      </div>
    </PublicLayout>
  );
}
