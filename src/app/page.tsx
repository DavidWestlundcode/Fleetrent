import Link from 'next/link';
import {
  Zap, Truck, BarChart3, QrCode, Wrench, Users, CheckCircle,
  ArrowRight, Shield, Clock, TrendingUp, Bell, Search,
  LayoutDashboard, FileText, Tag, Star, Activity, ChevronRight,
  Camera, Sparkles, X, Check, Brain, ArrowUpRight, Database,
  Target, RefreshCw, Cpu, Monitor, Upload,
} from 'lucide-react';
import { AnimateIn, CountUp } from '@/components/ui/AnimateIn';
import { Logo } from '@/components/ui/Logo';

/* ─── Static data ─────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: 'Magnus Eriksson',
    title: 'VD, Eriksson Maskinuthyrning AB',
    text: 'Vi hanterade allt i Excel tidigare. FleetOS gav oss full kontroll på dag ett – beläggningsgrad, försenade returer, lönsamhet per maskin. Det tog oss under en vecka att komma igång.',
    initials: 'ME',
    color: 'from-blue-500 to-blue-700',
  },
  {
    name: 'Sara Lindgren',
    title: 'Driftchef, Nordmark Hyrmaskiner',
    text: 'QR-funktionen är guld värd. Förut ringde mekanikerna mig varje gång en maskin kom in. Nu skannar de bara koden och allt uppdateras automatiskt. Sparar oss timmar varje vecka.',
    initials: 'SL',
    color: 'from-violet-500 to-violet-700',
  },
  {
    name: 'Johan Pettersson',
    title: 'Ägare, JP Anläggning & Uthyrning',
    text: 'Har testat tre andra system. FleetOS är det enda som faktiskt funkar för maskinuthyrning specifikt. Statistiken och ROI-analysen per maskin är något de andra saknar helt.',
    initials: 'JP',
    color: 'from-emerald-500 to-emerald-700',
  },
];

/* ─── Sub-components ─────────────────────────────────────────────── */
function DashboardMockup() {
  return (
    <div className="relative bg-[#0B1120] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 h-10 bg-[#0B1120] border-b border-white/[0.06]">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
        <div className="ml-3 flex items-center gap-1.5 bg-white/[0.05] rounded-md px-3 h-6 max-w-[160px] flex-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500/60 shrink-0" />
          <div className="h-1.5 bg-white/20 rounded flex-1" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="text-[8px] font-semibold text-emerald-400">LIVE</span>
          </div>
          <Bell className="w-3 h-3 text-white/20" />
          <div className="w-5 h-5 rounded-full bg-blue-600/50" />
        </div>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-40 bg-[#060D1A] border-r border-white/[0.05] p-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-2 mb-3">
            <Logo size={20} />
            <span className="text-[11px] font-bold text-white">FleetOS</span>
          </div>
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: true },
            { icon: Truck, label: 'Maskinflotta', active: false },
            { icon: FileText, label: 'Order', active: false },
            { icon: Users, label: 'Kunder', active: false },
            { icon: Wrench, label: 'Service', active: false },
            { icon: BarChart3, label: 'Statistik', active: false },
          ].map(({ icon: Icon, label, active }) => (
            <div key={label} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg mb-0.5 relative ${active ? 'bg-white/10' : ''}`}>
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3 bg-blue-400 rounded-r-full" />}
              <Icon className={`w-3 h-3 ${active ? 'text-blue-400' : 'text-white/20'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-white/25'}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] font-semibold text-white">Dashboard</div>
              <div className="text-[9px] text-white/30 mt-0.5">måndag 12 maj 2025</div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1">
                <Search className="w-2.5 h-2.5 text-white/20" />
                <div className="w-14 h-1.5 bg-white/10 rounded" />
              </div>
              <div className="px-2 py-1 bg-blue-600 rounded-lg text-[9px] text-white font-medium">+ Ny order</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'I lager', val: '8', sub: 'av 14 totalt', dot: 'bg-emerald-500', accent: 'bg-emerald-500' },
              { label: 'Uthyrda', val: '5', sub: '36% beläggning', dot: 'bg-blue-500', accent: 'bg-blue-500' },
              { label: 'Aktiva order', val: '7', sub: '1 försenad', dot: 'bg-amber-400', accent: 'bg-amber-400' },
              { label: 'Månadsintäkt', val: '84k', sub: '+12% vs förra', dot: 'bg-violet-500', accent: 'bg-violet-500' },
            ].map(({ label, val, sub, dot, accent }) => (
              <div key={label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-2.5 overflow-hidden relative">
                <div className={`absolute top-0 left-0 right-0 h-[2px] ${accent}`} />
                <div className="text-[9px] text-white/40 uppercase tracking-wider">{label}</div>
                <div className="text-[20px] font-bold text-white mt-0.5 leading-none">{val}</div>
                <div className="flex items-center gap-1 mt-1">
                  <div className={`w-1 h-1 rounded-full ${dot}`} />
                  <div className="text-[8px] text-white/30">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-3 bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-semibold text-white/70">Intäkter per månad</div>
                <div className="text-[8px] text-white/30 bg-white/[0.05] px-2 py-0.5 rounded">12 månader</div>
              </div>
              <div className="flex items-end gap-1 h-16">
                {[30, 50, 40, 70, 55, 80, 65, 90, 60, 85, 70, 95].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-t-sm ${i === 11 ? 'bg-blue-500' : 'bg-blue-500/30'}`} style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {['Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'Maj'].map((m) => (
                  <div key={m} className="flex-1 text-center text-[7px] text-white/20">{m}</div>
                ))}
              </div>
            </div>
            <div className="col-span-2 bg-white/[0.04] border border-white/[0.06] rounded-xl p-2.5">
              <div className="text-[10px] font-semibold text-white/70 mb-2">Senaste order</div>
              {[
                { nr: 'ORD-241', co: 'Lindström AB', color: 'bg-blue-500' },
                { nr: 'ORD-240', co: 'Björk & Söner', color: 'bg-emerald-500' },
                { nr: 'ORD-239', co: 'NordMark', color: 'bg-red-500' },
                { nr: 'ORD-238', co: 'Svensson HB', color: 'bg-blue-500' },
              ].map(({ nr, co, color }) => (
                <div key={nr} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                  <div>
                    <div className="text-[9px] font-medium text-white/70">{nr}</div>
                    <div className="text-[8px] text-white/30">{co}</div>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="grid grid-cols-5 px-3 py-1.5 border-b border-white/[0.05]">
              {['Maskin', 'Kategori', 'Status', 'Intäkt', 'ROI'].map((h) => (
                <div key={h} className="text-[8px] font-semibold text-white/30 uppercase tracking-wider">{h}</div>
              ))}
            </div>
            {[
              { name: 'Toyota 8FBN25', cat: 'Motviktstruck', color: 'bg-blue-500', rev: '42 000 kr', roi: '+127%', roiColor: 'text-emerald-400' },
              { name: 'Volvo L60H', cat: 'Hjullastare', color: 'bg-emerald-500', rev: '38 500 kr', roi: '+89%', roiColor: 'text-emerald-400' },
              { name: 'CAT 308CR', cat: 'Grävmaskin', color: 'bg-amber-400', rev: '29 000 kr', roi: '+44%', roiColor: 'text-amber-400' },
            ].map(({ name, cat, color, rev, roi, roiColor }) => (
              <div key={name} className="grid grid-cols-5 px-3 py-2 border-b border-white/[0.03] last:border-0">
                <div className="text-[9px] font-medium text-white/70 truncate pr-2">{name}</div>
                <div className="text-[9px] text-white/35 truncate pr-2">{cat}</div>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                </div>
                <div className="text-[9px] font-semibold text-emerald-400">{rev}</div>
                <div className={`text-[9px] font-bold ${roiColor}`}>{roi}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMockup() {
  return (
    <div className="relative w-[200px] bg-[#0B1120] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl mx-auto">
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-20 h-5 bg-black rounded-full" />
      </div>
      <div className="px-3 pb-4 space-y-2.5">
        <div className="text-center">
          <div className="text-[10px] font-bold text-white">Skanna QR-kod</div>
          <div className="text-[8px] text-white/40 mt-0.5">Håll kameran mot koden</div>
        </div>
        <div className="relative bg-black/60 rounded-xl h-32 flex items-center justify-center overflow-hidden border border-white/10">
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-blue-400 rounded-tl-md" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-blue-400 rounded-tr-md" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-blue-400 rounded-bl-md" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-blue-400 rounded-br-md" />
          <div className="absolute left-3 right-3 h-px bg-blue-400/70 top-1/2" />
          <div className="grid grid-cols-5 gap-0.5 opacity-30">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-sm ${[0, 1, 2, 5, 7, 10, 12, 14, 17, 19, 22, 23, 24].includes(i) ? 'bg-white' : 'bg-transparent'}`} />
            ))}
          </div>
        </div>
        <div className="bg-white/[0.06] border border-white/[0.08] rounded-xl p-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600/30 rounded-lg flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-white">Toyota 8FBN25</div>
              <div className="text-[8px] text-white/40">Motviktstruck 2.5T</div>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {[
              { l: 'Status', v: 'Uthyrd', c: 'text-blue-400' },
              { l: 'Kund', v: 'Lindström AB', c: 'text-white/60' },
              { l: 'Order', v: 'ORD-241', c: 'text-white/60' },
              { l: 'Retur', v: '15 maj', c: 'text-amber-400' },
            ].map(({ l, v, c }) => (
              <div key={l}>
                <div className="text-[7px] text-white/30 uppercase tracking-wide">{l}</div>
                <div className={`text-[9px] font-medium ${c} mt-0.5`}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="w-full bg-blue-600 rounded-xl py-2 text-[10px] font-bold text-white">Registrera retur</button>
      </div>
    </div>
  );
}

function AIAnalysisMockup() {
  return (
    <div className="bg-[#0B1120] rounded-2xl border border-white/[0.08] p-5 shadow-2xl">
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/[0.06]">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-slate-400">Foto laddat upp</p>
            <p className="text-[12px] font-medium text-white">typskylt_toyota.jpg</p>
          </div>
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
        </div>

        <div className="flex items-center gap-3 p-3 bg-blue-600/10 rounded-xl border border-blue-500/20">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-blue-400 animate-spin-slow" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-blue-300">AI analyserar typskylt...</p>
            <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '80%' }} />
            </div>
          </div>
        </div>

        <div className="p-3 bg-emerald-600/10 rounded-xl border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">Identifierade uppgifter</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              ['Märke', 'Toyota'],
              ['Modell', '8FBN25'],
              ['Kapacitet', '2 500 kg'],
              ['Årsmodell', '2021'],
              ['Drivmedel', 'El (Lithium)'],
              ['Serienummer', 'TY8FBN-20213847'],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[9px] text-white/30 uppercase tracking-wide">{k}</div>
                <div className="text-[11px] font-semibold text-white mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderMockup() {
  return (
    <div className="bg-[#0B1120] rounded-2xl border border-white/[0.08] p-5 shadow-2xl">
      <div className="text-[11px] font-semibold text-white/60 mb-3 uppercase tracking-wider">Ny uthyrningsorder</div>
      <div className="space-y-2.5">
        {[
          { label: 'Kund', value: 'Lindström AB', color: 'text-white' },
          { label: 'Maskin', value: 'Toyota 8FBN25 · Motviktstruck', color: 'text-white' },
          { label: 'Startdatum', value: '2025-05-15', color: 'text-white' },
          { label: 'Returdatum', value: '2025-06-15', color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between bg-white/[0.04] px-3 py-2 rounded-lg">
            <span className="text-[10px] text-white/40">{label}</span>
            <span className={`text-[11px] font-medium ${color}`}>{value}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 p-2.5 bg-blue-600/15 rounded-xl border border-blue-500/20">
          <div className="w-5 h-5 bg-blue-600/30 rounded-lg flex items-center justify-center shrink-0">
            <Tag className="w-2.5 h-2.5 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="text-[9px] text-blue-400">Prismall matchad automatiskt</div>
            <div className="text-[10px] font-semibold text-white">Motviktstruck 2–3 ton</div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/[0.06]">
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-white/40">Hyra (31 dagar)</span>
          <span className="text-white">18 600 kr</span>
        </div>
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-white/40">Transport</span>
          <span className="text-white">1 200 kr</span>
        </div>
        <div className="flex justify-between text-[13px] font-bold mt-2 pt-2 border-t border-white/[0.06]">
          <span className="text-white">Totalt</span>
          <span className="text-blue-400">19 800 kr</span>
        </div>
      </div>
    </div>
  );
}

function ROIMockup() {
  return (
    <div className="bg-[#0B1120] rounded-2xl border border-white/[0.08] p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">Lönsamhet per maskin</div>
        <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-medium">
          <TrendingUp className="w-3 h-3" />
          +14% vs förra mån
        </div>
      </div>
      <div className="space-y-2.5">
        {[
          { name: 'Toyota 8FBN25', roi: 127, bar: 'bg-blue-500', rev: '42 000 kr' },
          { name: 'Volvo L60H', roi: 89, bar: 'bg-emerald-500', rev: '38 500 kr' },
          { name: 'CAT 308CR', roi: 44, bar: 'bg-amber-400', rev: '29 000 kr' },
          { name: 'Manitou MLT845', roi: 22, bar: 'bg-violet-500', rev: '17 200 kr' },
        ].map(({ name, roi, bar, rev }) => (
          <div key={name}>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-white/70">{name}</span>
              <div className="flex items-center gap-2">
                <span className="text-white/40">{rev}</span>
                <span className="font-bold text-emerald-400">+{roi}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className={`h-full ${bar} rounded-full`} style={{ width: `${Math.min(100, roi)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-3 gap-2">
        {[
          { label: 'Total intäkt', value: '127k kr', icon: 'text-emerald-400' },
          { label: 'Beläggning', value: '71%', icon: 'text-blue-400' },
          { label: 'Netto ROI', value: '+84%', icon: 'text-violet-400' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="text-center">
            <div className={`text-[13px] font-bold ${icon}`}>{value}</div>
            <div className="text-[9px] text-white/30 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-bold text-slate-900 text-[15px] tracking-tight">FleetOS</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Funktioner', href: '#features' },
              { label: 'Hur det fungerar', href: '#how-it-works' },
              { label: 'Priser', href: '/priser' },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-[13px] font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              Logga in
            </Link>
            <Link href="/kom-igang" className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-700 text-white text-[13px] font-semibold rounded-xl transition-colors shadow-sm">
              Kom igång gratis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-0 bg-[#060D1A] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-blue-600/[0.07] rounded-full blur-[160px]" />
          <div className="absolute top-40 left-[10%] w-[400px] h-[400px] bg-indigo-600/[0.05] rounded-full blur-[120px]" />
          <div className="absolute top-20 right-[10%] w-[350px] h-[350px] bg-violet-600/[0.04] rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.022]"
            style={{
              backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#060D1A] to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-[12px] font-semibold mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            AI-drivet fleet management för maskinuthyrning
          </div>

          <h1 className="text-[52px] md:text-[76px] font-bold text-white leading-[1.02] tracking-[-0.025em] mb-6">
            Automatisera din{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 40%, #818CF8 100%)' }}
            >
              maskinuthyrning
            </span>
            <br />
            med AI
          </h1>

          <p className="text-[18px] text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            FleetOS ersätter Excel, telefonsamtal och manuellt arbete med ett intelligent system som hanterar flotta, order och lönsamhet automatiskt.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link href="/kom-igang" className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all text-[14px] shadow-xl shadow-blue-900/40 hover:shadow-blue-700/30 hover:-translate-y-0.5">
              Kom igång – kontakta oss
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="flex items-center gap-2 px-6 py-3.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium rounded-xl border border-white/10 transition-all text-[14px] hover:-translate-y-0.5">
              Se hur det fungerar
              <ChevronRight className="w-4 h-4 text-white/50" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-slate-500 text-[12px] font-medium mb-20">
            {[
              { icon: CheckCircle, label: 'Ingen bindningstid' },
              { icon: Shield, label: 'GDPR-anpassad' },
              { icon: Zap, label: 'Kom igång på < 1 dag' },
              { icon: Users, label: 'Fullständig dashboard' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-emerald-500" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard with floating cards */}
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="absolute -inset-4 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent rounded-3xl blur-3xl pointer-events-none" />
          <div className="relative">
            {/* Floating notification – top right */}
            <div className="absolute -top-5 right-8 z-20 hidden lg:flex items-center gap-2.5 bg-white rounded-2xl border border-slate-200 shadow-2xl px-3.5 py-2.5 animate-float">
              <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-800">Ny order skapad</p>
                <p className="text-[10px] text-slate-400">Toyota 8FBN25 · Lindström AB</p>
              </div>
            </div>
            {/* Floating stat – bottom left */}
            <div className="absolute -bottom-4 left-8 z-20 hidden lg:flex items-center gap-2.5 bg-white rounded-2xl border border-slate-200 shadow-2xl px-3.5 py-2.5 animate-float2">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-800">ROI +127% denna mån</p>
                <p className="text-[10px] text-slate-400">Toyota 8FBN25</p>
              </div>
            </div>
            <DashboardMockup />
          </div>
        </div>
      </section>


      {/* ── Problem → Solution ── */}
      <section className="py-28 px-6 bg-slate-50 border-b border-slate-200 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <AnimateIn className="text-center mb-16">
            <p className="text-[12px] font-semibold text-red-500 uppercase tracking-widest mb-3">Problemet</p>
            <h2 className="text-[40px] md:text-[48px] font-bold text-slate-900 tracking-tight mb-4 leading-tight">
              Maskinuthyrning utan rätt<br />verktyg är kostsamt
            </h2>
            <p className="text-[16px] text-slate-500 max-w-xl mx-auto leading-relaxed">
              De flesta uthyrningsföretag förlorar tid och pengar på grund av ineffektiva processer. FleetOS löser det.
            </p>
          </AnimateIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Before */}
            <AnimateIn direction="left">
              <div className="bg-white border border-red-100 rounded-2xl overflow-hidden shadow-sm h-full">
                <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-[12px] font-bold text-red-600 uppercase tracking-wider">Utan FleetOS</span>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { icon: X, text: 'Excel-kalkylblad och e-postkedjor som primära verktyg', sub: 'Information sprids och går förlorad' },
                    { icon: X, text: 'Telefonsamtal för varje lagerfråga och statusuppdatering', sub: 'Timmar läggs på administration' },
                    { icon: X, text: 'Missade returdatum och förlorade intäkter', sub: 'Ingen automatisk påminnelse' },
                    { icon: X, text: 'Ingen lönsamhetsöverblick per maskin', sub: 'Vet inte vilka maskiner som lönar sig' },
                    { icon: X, text: 'Service och underhåll hanteras reaktivt', sub: 'Maskiner havererar oväntat' },
                  ].map(({ icon: Icon, text, sub }) => (
                    <div key={text} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-slate-700">{text}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateIn>

            {/* After */}
            <AnimateIn direction="right">
              <div className="bg-[#060D1A] border border-blue-500/20 rounded-2xl overflow-hidden shadow-xl h-full">
                <div className="px-6 py-4 bg-blue-600/10 border-b border-blue-500/20 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[12px] font-bold text-blue-400 uppercase tracking-wider">Med FleetOS</span>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { icon: Check, text: 'Realtids-dashboard med hela flottans status', sub: 'All information samlad på ett ställe', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' },
                    { icon: Check, text: 'Automatiska notiser och påminnelser', sub: 'Aldrig mer missade returdatum', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' },
                    { icon: Check, text: 'AI fyller i maskinuppgifter från foto', sub: 'Registrering tar sekunder, inte minuter', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/20' },
                    { icon: Check, text: 'Full ROI-analys per maskin i realtid', sub: 'Fatta beslut baserade på data', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' },
                    { icon: Check, text: 'Proaktiv serviceplanering med notiser', sub: 'Förhindra driftstopp i förväg', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' },
                  ].map(({ icon: Icon, text, sub, color }) => (
                    <div key={text} className="flex gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-white/90">{text}</p>
                        <p className="text-[11px] text-white/35 mt-0.5">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-20 bg-[#060D1A] border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimateIn className="text-center" direction="scale">
              <div className="flex items-center justify-center mb-1">
                <div className="relative inline-flex items-center justify-center w-[52px] h-[52px] text-blue-400">
                  <Monitor className="w-10 h-10" strokeWidth={1.5} />
                  <Upload className="absolute bottom-0 right-0 w-4 h-4 text-blue-300 animate-bounce" strokeWidth={2} />
                </div>
              </div>
              <p className="text-[14px] font-semibold text-white mt-1">AI-drivna flöden</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Automatisera uthyrning och administration</p>
            </AnimateIn>
            <AnimateIn className="text-center" direction="scale">
              <p className="text-[40px] font-bold tracking-tight text-emerald-400">
                <CountUp end={100} suffix="%" />
              </p>
              <p className="text-[14px] font-semibold text-white mt-1">Full kontroll</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Se status på alla maskiner i realtid</p>
            </AnimateIn>
            {[
              { end: 1, suffix: ' dag', label: 'Onboarding-tid', sub: 'Från konto till full drift', color: 'text-violet-400' },
              { end: 40, suffix: '%', label: 'Minskad admin', sub: 'Genomsnitt för våra kunder', color: 'text-amber-400' },
            ].map(({ end, suffix, label, sub, color }) => (
              <AnimateIn key={label} className="text-center" direction="scale">
                <p className={`text-[40px] font-bold tracking-tight ${color}`}>
                  <CountUp end={end} suffix={suffix} />
                </p>
                <p className="text-[14px] font-semibold text-white mt-1">{label}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{sub}</p>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features showcase ── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto space-y-28">
          <AnimateIn className="text-center">
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Funktioner</p>
            <h2 className="text-[40px] md:text-[48px] font-bold text-slate-900 tracking-tight mb-4">
              Allt du behöver,<br />inget du inte behöver
            </h2>
            <p className="text-[16px] text-slate-500 max-w-lg mx-auto leading-relaxed">
              Byggt specifikt för maskinuthyrning. Inte ett generellt system du måste anpassa.
            </p>
          </AnimateIn>

          {/* Feature 1: AI Register */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <AnimateIn direction="left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200/80 rounded-full text-blue-600 text-[11px] font-semibold mb-5">
                <Brain className="w-3.5 h-3.5" />
                AI-driven
              </div>
              <h3 className="text-[32px] font-bold text-slate-900 tracking-tight mb-4 leading-tight">
                Lägg till maskiner<br />på sekunder med AI
              </h3>
              <p className="text-[15px] text-slate-500 leading-relaxed mb-7">
                Fotografera maskinens typskylt med mobilen. FleetOSs AI identifierar märke, modell, kapacitet och serienummer automatiskt – utan att du behöver skriva ett enda tecken manuellt.
              </p>
              <div className="space-y-3">
                {[
                  { icon: Camera, text: 'Fotografera typskylten – det tar 3 sekunder' },
                  { icon: Sparkles, text: 'AI analyserar och fyller i alla fält' },
                  { icon: CheckCircle, text: 'Granska och spara – klart på under 30 sekunder' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-[14px] text-slate-700 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </AnimateIn>
            <AnimateIn direction="right">
              <AIAnalysisMockup />
            </AnimateIn>
          </div>

          {/* Feature 2: Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <AnimateIn direction="left" className="order-2 lg:order-1">
              <OrderMockup />
            </AnimateIn>
            <AnimateIn direction="right" className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-700 text-[11px] font-semibold mb-5">
                <Zap className="w-3.5 h-3.5" />
                Automatiserat
              </div>
              <h3 className="text-[32px] font-bold text-slate-900 tracking-tight mb-4 leading-tight">
                Skapa uthyrningsorder<br />på under en minut
              </h3>
              <p className="text-[15px] text-slate-500 leading-relaxed mb-7">
                Välj kund och maskin – systemet matchar automatiskt rätt prismall baserat på maskintyp och kapacitet. Pris och villkor beräknas direkt. Du skapar ordern, AI sköter resten.
              </p>
              <div className="space-y-3">
                {[
                  { icon: Tag, text: 'Prismallar matchas automatiskt till rätt maskin' },
                  { icon: Activity, text: 'Priskalkyl beräknas direkt för dag, vecka, månad' },
                  { icon: Shield, text: 'Valfri försäkring kopplas till varje order' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-[14px] text-slate-700 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>

          {/* Feature 3: ROI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <AnimateIn direction="left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-200/80 rounded-full text-violet-700 text-[11px] font-semibold mb-5">
                <BarChart3 className="w-3.5 h-3.5" />
                Realtidsanalys
              </div>
              <h3 className="text-[32px] font-bold text-slate-900 tracking-tight mb-4 leading-tight">
                Vet exakt vilka maskiner<br />som lönar sig
              </h3>
              <p className="text-[15px] text-slate-500 leading-relaxed mb-7">
                Fullständig ROI-analys per maskin i realtid. Se intäkt, kostnad, beläggningsgrad och återbetalningstid för varje tillgång – och fatta bättre beslut om köp, service och utfasning.
              </p>
              <div className="space-y-3">
                {[
                  { icon: TrendingUp, text: 'ROI och nettoresultat per maskin och period' },
                  { icon: Target, text: 'Beläggningsgrad och återbetalningstid' },
                  { icon: Database, text: 'Fullständig kostnadsanalys inklusive service' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-violet-600" />
                    </div>
                    <span className="text-[14px] text-slate-700 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </AnimateIn>
            <AnimateIn direction="right">
              <ROIMockup />
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── AI Deep Dive ── */}
      <section className="py-28 px-6 bg-[#060D1A] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-blue-600/[0.06] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/[0.06] rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '64px 64px' }}
          />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <AnimateIn className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-[12px] font-semibold mb-6">
              <Cpu className="w-3.5 h-3.5" />
              AI Automation
            </div>
            <h2 className="text-[40px] md:text-[48px] font-bold text-white tracking-tight mb-4">
              Intelligent automatisering<br />i varje steg
            </h2>
            <p className="text-[16px] text-slate-400 max-w-xl mx-auto leading-relaxed">
              FleetOS använder AI för att eliminera manuellt arbete – från registrering till analys.
            </p>
          </AnimateIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Camera,
                step: '01',
                title: 'Fotografera & registrera',
                desc: 'Ta ett foto av typskylten. AI läser av och fyller i märke, modell, kapacitet, serienummer och drifttimmar automatiskt.',
                color: 'from-blue-500/20 to-blue-600/5',
                border: 'border-blue-500/20',
                iconBg: 'bg-blue-600/20',
                iconColor: 'text-blue-400',
                badge: 'AI Vision',
                badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
              },
              {
                icon: RefreshCw,
                step: '02',
                title: 'Automatisk prismatchning',
                desc: 'Systemet identifierar rätt prismall baserat på maskintyp och kapacitet. Pris, villkor och försäkring föreslås direkt.',
                color: 'from-violet-500/20 to-violet-600/5',
                border: 'border-violet-500/20',
                iconBg: 'bg-violet-600/20',
                iconColor: 'text-violet-400',
                badge: 'Smart Matching',
                badgeColor: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
              },
              {
                icon: BarChart3,
                step: '03',
                title: 'Realtids lönsamhetsanalys',
                desc: 'Varje order, servicekostnad och intäkt analyseras löpande. ROI, beläggning och kassaflöde uppdateras i realtid.',
                color: 'from-emerald-500/20 to-emerald-600/5',
                border: 'border-emerald-500/20',
                iconBg: 'bg-emerald-600/20',
                iconColor: 'text-emerald-400',
                badge: 'Live Analytics',
                badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
              },
            ].map(({ icon: Icon, step, title, desc, color, border, iconBg, iconColor, badge, badgeColor }, i) => (
              <AnimateIn key={title} delay={i * 120} direction="scale">
                <div className={`relative bg-gradient-to-br ${color} border ${border} rounded-2xl p-6 h-full group hover:-translate-y-1 transition-all duration-300`}>
                  <div className="absolute top-4 right-4">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${badgeColor}`}>{badge}</span>
                  </div>
                  <div className="text-[11px] font-bold text-white/20 tracking-widest mb-4">{step}</div>
                  <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-5`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <h3 className="text-[16px] font-semibold text-white mb-3">{title}</h3>
                  <p className="text-[13px] text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>

          {/* Bottom CTA */}
          <AnimateIn className="mt-14 text-center">
            <Link href="/kom-igang" className="inline-flex items-center gap-2 px-7 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all text-[14px] shadow-xl shadow-blue-900/40 hover:-translate-y-0.5">
              Kom igång med FleetOS
              <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* ── QR Feature callout ── */}
      <section className="py-28 px-6 bg-[#060D1A] relative overflow-hidden border-t border-white/[0.04]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-blue-600/[0.05] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-violet-600/[0.05] rounded-full blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimateIn direction="left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-[12px] font-semibold mb-6">
                <QrCode className="w-3.5 h-3.5" />
                QR-returhantering
              </div>
              <h2 className="text-[40px] font-bold text-white tracking-tight leading-tight mb-5">
                Retur på sekunder,
                <br />
                <span className="text-blue-400">inte minuter</span>
              </h2>
              <p className="text-[15px] text-slate-400 leading-relaxed mb-8">
                Varje maskin får en unik QR-kod. Verkstadspersonalen skannar koden med sin smartphone och registrerar returen direkt – utan inloggning, utan papper, utan telefonsamtal.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Clock, text: 'Retur registreras på under 10 sekunder' },
                  { icon: Bell, text: 'Automatisk notis till ansvarig vid retur' },
                  { icon: Shield, text: 'Fungerar utan internetanslutning' },
                  { icon: Activity, text: 'Systemet uppdateras i realtid' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-[14px] text-slate-300 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </AnimateIn>
            <AnimateIn direction="right" className="flex justify-center lg:justify-end">
              <MobileMockup />
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-28 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <AnimateIn className="text-center mb-20">
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Hur det fungerar</p>
            <h2 className="text-[40px] font-bold text-slate-900 tracking-tight mb-4">Från signup till full drift på en dag</h2>
            <p className="text-[16px] text-slate-500 max-w-lg mx-auto">Fyra steg och du har kontroll över hela flottan.</p>
          </AnimateIn>

          <div className="relative">
            <div className="absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: 1, title: 'Skapa konto', desc: 'Registrera ditt företag och bjud in teammedlemmar. Klar på 2 minuter.', icon: Users },
                { step: 2, title: 'Lägg upp flottan', desc: 'Fotografera maskinen – AI fyller i uppgifterna automatiskt från typskylten.', icon: Truck },
                { step: 3, title: 'Skapa order', desc: 'Välj kund, maskin och prismall. Systemet beräknar pris och genererar avtal.', icon: FileText },
                { step: 4, title: 'Följ & analysera', desc: 'Realtidsdashboard med beläggning, försenade returer och lönsamhet.', icon: BarChart3 },
              ].map(({ step, title, desc, icon: Icon }, i) => (
                <AnimateIn key={step} delay={i * 100} direction="up" className="flex flex-col items-center text-center relative">
                  <div className="w-20 h-20 rounded-2xl bg-white border-2 border-blue-200 flex flex-col items-center justify-center mb-5 shadow-sm relative z-10">
                    <Icon className="w-7 h-7 text-blue-600 mb-1" />
                    <span className="text-[10px] font-bold text-blue-400">STEG {step}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-900 mb-2">{title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{desc}</p>
                </AnimateIn>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── FAQ ── */}
      <section className="py-24 px-6 border-t border-slate-100 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <AnimateIn className="text-center mb-14">
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-widest mb-3">Vanliga frågor</p>
            <h2 className="text-[36px] font-bold text-slate-900 tracking-tight">Frågor & svar</h2>
          </AnimateIn>
          <div className="space-y-4">
            {[
              { q: 'Hur lång tid tar det att komma igång?', a: 'De flesta kunder är igång med full drift inom en arbetsdag. Vi hjälper dig att lägga upp flottan och onboarda teamet.' },
              { q: 'Fungerar det i mobilen?', a: 'Ja, FleetOS är fullt responsivt och optimerat för mobila enheter. QR-funktionen kräver bara en webbläsare.' },
              { q: 'Hur säker är datan?', a: 'All data lagras krypterad i EU-baserade datacenter (Supabase/AWS Frankfurt). Vi följer GDPR fullt ut.' },
              { q: 'Kan jag bjuda in hela teamet?', a: 'Ja, alla planer inkluderar obegränsat antal användare. Du styr vilka roller och behörigheter varje person har.' },
              { q: 'Vad händer med mina befintliga data i Excel?', a: 'Vi hjälper dig migrera din befintliga data. Kontakta oss så sätter vi upp en import anpassad för din situation.' },
            ].map(({ q, a }, i) => (
              <AnimateIn key={q} delay={i * 60}>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-sm transition-all">
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-2">{q}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{a}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 px-6 bg-[#060D1A] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/[0.07] rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.022]"
            style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '64px 64px' }}
          />
        </div>
        <AnimateIn direction="scale" className="relative max-w-2xl mx-auto text-center">
          <div className="mx-auto mb-8">
            <Logo size={56} />
          </div>
          <h2 className="text-[44px] font-bold text-white tracking-tight leading-tight mb-5">
            Redo att modernisera<br />din uthyrning?
          </h2>
          <p className="text-[16px] text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
            Digitalisera hela uthyrningsprocessen med FleetOS — från order och hyresavtal till returhantering och fakturaunderlag.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/kom-igang" className="flex items-center gap-2 px-7 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all text-[15px] shadow-xl shadow-blue-900/40 hover:-translate-y-0.5">
              Kom igång med FleetOS
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="mailto:info@FleetOS.se" className="flex items-center gap-2 px-7 py-4 bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium rounded-xl border border-white/10 transition-all text-[15px]">
              Kontakta oss
            </a>
          </div>
          <p className="text-[12px] text-slate-600 mt-6">Ingen bindningstid · AI drivet · Full kontroll på intäkterna</p>
        </AnimateIn>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#030810] border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Logo size={28} />
                <span className="text-[14px] font-bold text-white tracking-tight">FleetOS</span>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-[220px]">
                Det moderna uthyrningssystemet för maskinföretag i Sverige.
              </p>
              <div className="flex gap-3 mt-5">
                {['LinkedIn', 'Twitter'].map((s) => (
                  <a key={s} href="#" className="text-[12px] text-slate-600 hover:text-slate-300 transition-colors">{s}</a>
                ))}
              </div>
            </div>
            {[
              { title: 'Produkt', links: [
                { label: 'Funktioner', href: '/funktioner' },
                { label: 'Changelog', href: '/changelog' },
                { label: 'Roadmap', href: '/roadmap' },
              ]},
              { title: 'Företag', links: [
                { label: 'Om oss', href: '/om-oss' },
                { label: 'Karriär', href: '/karriar' },
                { label: 'Press', href: '/press' },
                { label: 'Kontakt', href: '/kontakt' },
              ]},
              { title: 'Juridik', links: [
                { label: 'Integritetspolicy', href: '/integritetspolicy' },
                { label: 'Villkor', href: '/villkor' },
                { label: 'GDPR', href: '/gdpr' },
                { label: 'Säkerhet', href: '/sakerhet' },
              ]},
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-[12px] font-semibold text-white uppercase tracking-wider mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a href={href} className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-slate-600">
              © {new Date().getFullYear()} DSE ENTERPRISE AB. Alla rättigheter förbehållna.
            </p>
            <div className="flex items-center gap-2 text-[12px] text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Alla system operativa
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
