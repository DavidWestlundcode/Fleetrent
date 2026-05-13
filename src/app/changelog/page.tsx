import PublicLayout from '@/components/layout/PublicLayout';

const entries = [
  {
    version: '1.3.0',
    date: 'Maj 2026',
    items: [
      'AI-sökning med naturligt språk på maskinflottan',
      'Tekniska specifikationer per maskintyp (lyfthöjd, grävdjup, motoreffekt m.m.)',
      'Kapacitet anges och visas alltid i kg',
      'Möjlighet att radera maskiner med bekräftelsedialog',
    ],
  },
  {
    version: '1.2.0',
    date: 'April 2026',
    items: [
      'Prismallar med kapacitetsintervall och försäkringspriser',
      'Automatisk prismallsmatchning vid ny order',
      'Valbar försäkring i orderflödet',
    ],
  },
  {
    version: '1.1.0',
    date: 'Mars 2026',
    items: [
      'AI-analys av typskylt och maskinbild vid registrering',
      'Ny landningssida med interaktiva demoer',
      'Statistiksida med intäktsdiagram',
    ],
  },
  {
    version: '1.0.0',
    date: 'Februari 2026',
    items: [
      'Lansering av FleetRent',
      'Maskinflotta, orderhantering och kundregister',
      'QR-koder per maskin',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <PublicLayout title="Changelog">
      <p className="text-lg text-slate-500 mb-10">Senaste uppdateringar och förbättringar av FleetRent.</p>
      <div className="not-prose space-y-8">
        {entries.map(({ version, date, items }) => (
          <div key={version} className="flex gap-6">
            <div className="shrink-0 w-28 text-right">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{version}</span>
              <p className="text-xs text-slate-400 mt-2">{date}</p>
            </div>
            <div className="flex-1 border-l border-slate-200 pl-6 pb-8">
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}
