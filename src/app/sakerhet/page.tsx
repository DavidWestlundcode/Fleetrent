import PublicLayout from '@/components/layout/PublicLayout';

const layers = [
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    ),
    title: 'Infrastruktur',
    items: [
      { label: 'Vercel Edge Network', desc: 'Applikationen körs på Vercels globala edge-nätverk med inbyggt DDoS-skydd och automatisk skalning.' },
      { label: 'Supabase (PostgreSQL)', desc: 'Databasen driftas av Supabase på AWS eu-central-1 (Frankfurt) — inom EU/EES.' },
      { label: 'Miljövariabler', desc: 'Alla API-nycklar och hemligheter lagras som krypterade miljövariabler i Vercel — aldrig i källkoden.' },
    ],
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    ),
    title: 'Kryptering',
    items: [
      { label: 'TLS i transit', desc: 'All kommunikation sker uteslutande via HTTPS/TLS 1.2+. HTTP-trafik omdirigeras automatiskt.' },
      { label: 'AES-256 i vila', desc: 'Data krypteras i vila på databasnivå av Supabase/AWS med AES-256.' },
      { label: 'Lösenord', desc: 'Lösenord lagras aldrig i klartext — hashing hanteras av Supabase Auth (bcrypt).' },
    ],
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    ),
    title: 'Autentisering och sessioner',
    items: [
      { label: 'Supabase Auth', desc: 'Autentisering hanteras av Supabase med säkra JWT-tokens. Tokens förnyas automatiskt och är kortlivade.' },
      { label: 'Sessionskontroll', desc: 'Inaktiva sessioner avslutas automatiskt. Inloggning kräver alltid verifiering via e-post.' },
      { label: 'Lösenordspolicy', desc: 'Minimikrav på lösenordsstyrka tillämpas. Lösenordsåterställning sker via verifierad e-postlänk.' },
    ],
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
    title: 'Åtkomstkontroll',
    items: [
      { label: 'Row Level Security (RLS)', desc: 'PostgreSQL RLS är aktiverat på alla tabeller. Varje organisation kan enbart läsa och skriva sin egen data — på databasnivå, inte bara i applikationskoden.' },
      { label: 'Organisationsisolering', desc: 'Multitenant-arkitekturen säkerställer strikt dataisolering. Det är strukturellt omöjligt för en organisation att se en annans data.' },
      { label: 'Rollbaserad åtkomst', desc: 'Behörigheter styrs av roller kopplade till respektive organisation. Service role-nyckeln används enbart server-side och exponeras aldrig för klienten.' },
    ],
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
    title: 'API-säkerhet',
    items: [
      { label: 'Rate limiting', desc: 'Alla API-endpoints har hastighetsbegränsning per IP. Kontaktformulär begränsas till 5 anrop/10 min, webhooks till 100 anrop/min.' },
      { label: 'Webhook-signering', desc: 'Inkommande webhooks (Zigned) verifieras mot en signaturhemlighet innan de behandlas. Osignerade anrop avvisas med HTTP 401.' },
      { label: 'Inputvalidering', desc: 'All extern input valideras och saneras på serversidan. Fältlängder begränsas, format kontrolleras och SQL-injektioner förhindras via parameteriserade queries.' },
    ],
  },
];

export default function SakerhetPage() {
  return (
    <PublicLayout title="Säkerhet">
      <p className="text-lg text-slate-500 mb-10">
        Säkerhet är inbyggt i varje lager av FleetOS — från infrastruktur till applikationskod. Här beskriver vi hur vi skyddar din data i praktiken.
      </p>

      <div className="not-prose space-y-10 mb-12">
        {layers.map(({ icon, title, items }) => (
          <div key={title}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {icon}
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            </div>
            <div className="space-y-2 pl-11">
              {items.map(({ label, desc }) => (
                <div key={label} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-sm font-semibold text-slate-900 mb-0.5">{label}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Responsible disclosure */}
      <div className="not-prose p-6 bg-amber-50 border border-amber-200 rounded-xl mb-8">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-amber-900 mb-1">Ansvarsfull rapportering av sårbarheter</p>
            <p className="text-sm text-amber-800 leading-relaxed mb-3">
              Har du hittat en säkerhetsbrist i FleetOS? Vi uppskattar ansvarsfull rapportering. Kontakta oss direkt med en beskrivning av problemet — vi svarar inom 48 timmar och hanterar det skyndsamt.
            </p>
            <a href="mailto:info@dseenterprise.se" className="text-sm font-medium text-amber-900 hover:underline">
              info@dseenterprise.se →
            </a>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-400">
        Frågor om vår säkerhetsarkitektur? Kontakta oss på{' '}
        <a href="mailto:info@dseenterprise.se" className="text-blue-600 hover:underline">info@dseenterprise.se</a>.
      </p>
    </PublicLayout>
  );
}
