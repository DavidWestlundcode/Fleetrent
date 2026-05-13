import PublicLayout from '@/components/layout/PublicLayout';

export default function GdprPage() {
  return (
    <PublicLayout title="GDPR">
      <p className="text-lg text-slate-500 mb-8">
        Vi tar dataskydd på allvar. Här förklarar vi hur FleetRent hanterar personuppgifter i enlighet med GDPR (General Data Protection Regulation).
      </p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Dina rättigheter enligt GDPR</h2>
      <div className="not-prose space-y-3 mb-8">
        {[
          { title: 'Rätt till tillgång', desc: 'Du kan begära ut en kopia av de personuppgifter vi har om dig.' },
          { title: 'Rätt till rättelse', desc: 'Du kan begära att felaktiga uppgifter korrigeras.' },
          { title: 'Rätt till radering', desc: 'Du kan begära att dina uppgifter raderas ("rätten att bli glömd").' },
          { title: 'Rätt till begränsning', desc: 'Du kan begära att vi begränsar behandlingen av dina uppgifter.' },
          { title: 'Rätt till dataportabilitet', desc: 'Du kan begära att dina uppgifter lämnas ut i ett maskinläsbart format.' },
          { title: 'Rätt att invända', desc: 'Du kan invända mot behandling som baseras på berättigat intresse.' },
        ].map(({ title, desc }) => (
          <div key={title} className="flex gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Utöva dina rättigheter</h2>
      <p className="mb-4">Skicka din begäran till <a href="mailto:gdpr@fleetrent.se" className="text-blue-600 hover:underline">gdpr@fleetrent.se</a>. Vi svarar inom 30 dagar.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Klagomål</h2>
      <p className="mb-4">Om du anser att vi hanterar dina uppgifter felaktigt har du rätt att lämna klagomål till <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Integritetsskyddsmyndigheten (IMY)</a>.</p>
    </PublicLayout>
  );
}
