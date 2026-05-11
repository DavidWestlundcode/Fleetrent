import Link from 'next/link';
import {
  Zap, Truck, BarChart3, QrCode, Wrench, Users, CheckCircle,
  ArrowRight, Shield, Clock, TrendingUp, Package,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Truck,
    title: 'Maskinregister',
    desc: 'Håll koll på hela flottan – status, placering, drifttimmar och servicehistorik på ett ställe.',
  },
  {
    icon: BarChart3,
    title: 'Lönsamhetsanalys',
    desc: 'Se ROI, beläggningsgrad och återbetalning per maskin. Identifiera vad som driver intäkter.',
  },
  {
    icon: QrCode,
    title: 'QR-returhantering',
    desc: 'Verkstadspersonal skannar QR-koden och registrerar retur på sekunder – direkt i mobilen.',
  },
  {
    icon: Users,
    title: 'Kundregister & CRM',
    desc: 'Komplett kundhistorik, aktiva order och total intäkt per kund samlat i ett register.',
  },
  {
    icon: Wrench,
    title: 'Service & Underhåll',
    desc: 'Planera och logga serviceärenden. Bli påmind innan service förfaller eller maskin står still.',
  },
  {
    icon: Shield,
    title: 'Roller & Behörigheter',
    desc: 'Separata vyer för admin, säljare och verkstad. Rätt information till rätt person.',
  },
];

const STATS = [
  { value: '100%', label: 'Webbaserat', sub: 'Fungerar i alla browsers' },
  { value: '< 2 min', label: 'Skapa en order', sub: 'Från kund till signerad order' },
  { value: 'Realtid', label: 'Flottastatus', sub: 'Se alltid aktuell status' },
  { value: 'Gratis', label: 'Kom igång', sub: 'Ingen bindningstid' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Lägg upp din flotta', desc: 'Registrera dina maskiner med all information – serienummer, inköpspris, försäkring och kostnader.' },
  { step: '02', title: 'Skapa uthyrningsorder', desc: 'Välj kund, maskin och prismall. Systemet beräknar automatiskt pris baserat på period.' },
  { step: '03', title: 'Följ flottan i realtid', desc: 'Dashboarden visar alltid vilka maskiner som är ute, försenade returer och kommande service.' },
  { step: '04', title: 'QR-baserad retur', desc: 'Verkstadspersonal skannar QR-koden på maskinen och registrerar returen – systemet uppdateras direkt.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">FleetRent</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Funktioner</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Hur det fungerar</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pris</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">Logga in</Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kom igång gratis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            Modernaste systemet för maskinuthyrning
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Hantera din{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              maskinflotta
            </span>
            {' '}med precision
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            FleetRent är ett komplett uthyrningssystem för maskinföretag. Spåra maskiner, skapa order, analysera lönsamhet och hantera returer via QR – allt i ett system.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-base"
            >
              Starta gratis idag
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20 text-base"
            >
              Se hur det fungerar
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-slate-400 text-sm">
            {['Ingen bindningstid', 'GDPR-anpassad', 'Säker datakryptering', 'Automatisk backup'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, sub }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-blue-600 mb-1">{value}</p>
                <p className="font-semibold text-slate-800 text-sm">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Allt du behöver för uthyrning
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Från maskinregister till QR-returhantering – FleetRent täcker hela processen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all group">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Icon className="w-5.5 h-5.5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-blue-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">En dashboard som ger dig kontroll</h2>
            <p className="text-slate-400">Se allt som händer i flottan – försenade returer, kommande service och lönsamhet i realtid.</p>
          </div>

          {/* Fake dashboard preview */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            {/* Header bar */}
            <div className="bg-slate-900 px-6 py-3 flex items-center gap-2 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="ml-4 flex-1 bg-slate-700 rounded-md h-6 max-w-xs" />
            </div>
            {/* Fake content */}
            <div className="flex">
              {/* Sidebar */}
              <div className="w-52 bg-slate-900 p-4 border-r border-slate-700 hidden md:block">
                <div className="space-y-1">
                  {['Dashboard', 'Maskinflotta', 'Order', 'Kunder', 'Service', 'Statistik'].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${i === 0 ? 'bg-blue-600' : ''}`}>
                      <div className={`w-4 h-4 rounded ${i === 0 ? 'bg-white/40' : 'bg-slate-700'}`} />
                      <div className={`h-2.5 rounded flex-1 ${i === 0 ? 'bg-white/60' : 'bg-slate-700'}`} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Main content */}
              <div className="flex-1 p-6 space-y-4">
                {/* KPI row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'I lager', val: '6', color: 'bg-emerald-500' },
                    { label: 'Uthyrda', val: '3', color: 'bg-blue-500' },
                    { label: 'Aktiva order', val: '4', color: 'bg-amber-500' },
                    { label: 'Månadsintäkt', val: '82k', color: 'bg-purple-500' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="bg-slate-700 rounded-xl p-4">
                      <div className="text-xs text-slate-400 mb-1">{label}</div>
                      <div className="text-2xl font-bold text-white">{val}</div>
                      <div className={`h-1 rounded-full mt-2 ${color} w-2/3`} />
                    </div>
                  ))}
                </div>
                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 bg-slate-700 rounded-xl p-4 h-32">
                    <div className="text-xs text-slate-400 mb-3">Intäkter per månad</div>
                    <div className="flex items-end gap-1.5 h-16">
                      {[40, 60, 45, 80, 55, 90, 70, 85, 65, 95, 75, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-500/60 rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-700 rounded-xl p-4 h-32">
                    <div className="text-xs text-slate-400 mb-2">Flottastatus</div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="w-14 h-14 rounded-full border-4 border-blue-500 border-t-emerald-500 border-r-amber-500" />
                      <div className="space-y-1">
                        {[['Uthyrda', 'bg-blue-500'], ['I lager', 'bg-emerald-500'], ['Service', 'bg-amber-500']].map(([l, c]) => (
                          <div key={l} className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${c}`} />
                            <span className="text-xs text-slate-400">{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Kom igång på minuter</h2>
            <p className="text-lg text-slate-500">Fyra steg från registrering till full kontroll över flottan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1.5">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Enkla priser, inga överraskningar</h2>
            <p className="text-slate-500">Välj det plan som passar din flotta. Byt när som helst.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: 'Gratis',
                sub: 'upp till 5 maskiner',
                features: ['5 maskiner', '50 order/mån', 'QR-koder', 'Statistik', 'E-postsupport'],
                cta: 'Kom igång',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '990 kr',
                sub: 'per månad',
                features: ['Obegränsade maskiner', 'Obegränsade order', 'QR-koder', 'Avancerad statistik', 'Service-modul', 'Prioritetssupport'],
                cta: 'Starta Pro',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Kontakta oss',
                sub: 'anpassad lösning',
                features: ['Allt i Pro', 'Fortnox-integration', 'API-åtkomst', 'SLA-garanti', 'Dedikerad support', 'Anpassad onboarding'],
                cta: 'Kontakta oss',
                highlight: false,
              },
            ].map(({ name, price, sub, features, cta, highlight }) => (
              <div
                key={name}
                className={`rounded-2xl p-6 border ${highlight ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white border-slate-200'}`}
              >
                {highlight && (
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-3">Mest populär</div>
                )}
                <h3 className={`text-xl font-bold mb-1 ${highlight ? 'text-white' : 'text-slate-900'}`}>{name}</h3>
                <div className="mb-1">
                  <span className={`text-3xl font-bold ${highlight ? 'text-white' : 'text-slate-900'}`}>{price}</span>
                </div>
                <p className={`text-sm mb-6 ${highlight ? 'text-blue-200' : 'text-slate-500'}`}>{sub}</p>
                <ul className="space-y-2 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${highlight ? 'text-blue-200' : 'text-emerald-500'}`} />
                      <span className={highlight ? 'text-blue-100' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Redo att modernisera din uthyrning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Skapa ett konto idag – gratis, ingen kreditkortsinformation krävs.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors text-lg"
          >
            Skapa gratis konto
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">FleetRent</span>
          </div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} FleetRent. Alla rättigheter förbehållna.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Integritetspolicy</a>
            <a href="#" className="hover:text-white transition-colors">Villkor</a>
            <a href="#" className="hover:text-white transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
