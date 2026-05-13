import PublicLayout from '@/components/layout/PublicLayout';

export default function SakerhetPage() {
  return (
    <PublicLayout title="Säkerhet">
      <p className="text-lg text-slate-500 mb-10">
        Säkerhet är en grundprincip i hur vi bygger FleetRent — inte ett eftertanke.
      </p>
      <div className="not-prose space-y-4 mb-10">
        {[
          { title: 'Krypterad dataöverföring', desc: 'All kommunikation sker via HTTPS/TLS. Data skickas aldrig okrypterat.' },
          { title: 'Säker autentisering', desc: 'Stöd för starka lösenord och sessionstidsgränser för att skydda ditt konto.' },
          { title: 'API-nycklar', desc: 'API-nycklar lagras aldrig i klientkod och exponeras aldrig i frontend.' },
          { title: 'Datalagring i EU', desc: 'All data lagras på servrar inom EU i enlighet med GDPR.' },
          { title: 'Regelbundna säkerhetsgranskningar', desc: 'Vi genomför löpande säkerhetstester av vår plattform.' },
          { title: 'Ansvarsfull hantering', desc: 'Hittat en sårbarhet? Kontakta oss på security@fleetrent.se så hanterar vi det skyndsamt.' },
        ].map(({ title, desc }) => (
          <div key={title} className="flex gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{title}</p>
              <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-500">
        Säkerhetsrapporter skickas till{' '}
        <a href="mailto:security@fleetrent.se" className="text-blue-600 hover:underline">security@fleetrent.se</a>.
      </p>
    </PublicLayout>
  );
}
