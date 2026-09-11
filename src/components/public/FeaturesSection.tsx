import {
  BarChart3, Zap, Brain, PenLine, QrCode, ArrowRight,
  TrendingUp, Target, Database, Tag, Activity, Shield,
  Camera, Sparkles, CheckCircle, FileSignature, Mail, RefreshCw, Truck, Check,
} from 'lucide-react';
import { AnimateIn } from '@/components/ui/AnimateIn';

/* ─── Mockups (moved from page.tsx — used only here) ──────────────── */
function ROIMockup() {
  return (
    <div className="bg-[#0B1120] rounded-2xl border border-white/[0.08] p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
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
      <div className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-3 gap-2">
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

function SigningMockup() {
  return (
    <div className="bg-[#0B1120] rounded-2xl border border-white/[0.08] p-5 shadow-2xl space-y-3">
      <div className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-2">Digital signering</div>

      <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
        <div className="w-9 h-9 bg-indigo-600/20 rounded-xl flex items-center justify-center shrink-0">
          <FileSignature className="w-4.5 h-4.5 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-medium text-white/90 truncate">hyresavtal-FR-202606-9204.pdf</div>
          <div className="text-[10px] text-white/40 mt-0.5">Skickat till kund@foretaget.se</div>
        </div>
        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[9px] font-semibold text-amber-300">Väntar</span>
        </div>
      </div>

      <div className="space-y-2 pl-1">
        {[
          { label: 'Avtal genererat & skickat', done: true },
          { label: 'Kund signerar med BankID', done: true },
          { label: 'Signerat avtal levererat', done: true },
        ].map(({ label, done }) => (
          <div key={label} className="flex items-center gap-2.5">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500/20' : 'bg-white/[0.05]'}`}>
              {done && <Check className="w-2.5 h-2.5 text-emerald-400" />}
            </div>
            <span className={`text-[11px] ${done ? 'text-white/70' : 'text-white/25'}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <div className="text-[11px] font-semibold text-emerald-300">Signerat av kunden</div>
          <div className="text-[10px] text-white/40 mt-0.5">Båda parter har fått en kopia via e-post</div>
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.06] grid grid-cols-3 gap-2">
        {[
          { label: 'Signeringstid', value: '< 2 min', color: 'text-indigo-400' },
          { label: 'Juridiskt giltigt', value: 'BankID', color: 'text-emerald-400' },
          { label: 'Arkiverat', value: 'Alltid', color: 'text-violet-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <div className={`text-[12px] font-bold ${color}`}>{value}</div>
            <div className="text-[9px] text-white/30 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QRReturnMockup() {
  return (
    <div className="bg-[#0B1120] rounded-2xl border border-white/[0.08] p-5 shadow-2xl space-y-3">
      <div className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-2">QR-returhantering</div>

      <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
        <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center shrink-0">
          <Truck className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-medium text-white/90 truncate">Toyota Motviktstruck 2.5T</div>
          <div className="text-[10px] text-white/40 mt-0.5">Scannad via QR-kod · Internt nr: TR-044</div>
        </div>
        <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-[9px] font-semibold text-blue-300">Uthyrd</span>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 space-y-1.5">
        <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Aktiv order</div>
        <div className="flex justify-between">
          <span className="text-[11px] text-white/50">Kund</span>
          <span className="text-[11px] text-white/80 font-medium">Svensson Bygg AB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[11px] text-white/50">Planerad retur</span>
          <span className="text-[11px] text-amber-300 font-medium">Idag</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider pl-1">Skick vid retur</div>
        {[
          { label: 'Bra skick', selected: true, color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
          { label: 'Kräver service', selected: false, color: 'border-white/[0.08] bg-white/[0.03] text-white/40' },
          { label: 'Skadad', selected: false, color: 'border-white/[0.08] bg-white/[0.03] text-white/40' },
        ].map(({ label, selected, color }) => (
          <div key={label} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-[11px] font-medium ${color}`}>
            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-emerald-400' : 'border-white/20'}`}>
              {selected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </div>
            {label}
          </div>
        ))}
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <div className="text-[11px] font-semibold text-emerald-300">Retur registrerad</div>
          <div className="text-[10px] text-white/40 mt-0.5">Maskin uppdaterad till I lager automatiskt</div>
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.06] grid grid-cols-3 gap-2">
        {[
          { label: 'Registreringstid', value: '< 1 min', color: 'text-blue-400' },
          { label: 'QR-skanning', value: 'QR', color: 'text-emerald-400' },
          { label: 'Uppdateras', value: 'Direkt', color: 'text-violet-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <div className={`text-[12px] font-bold ${color}`}>{value}</div>
            <div className="text-[9px] text-white/30 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Feature data ─────────────────────────────────────────────────── */
const FEATURES = [
  {
    badge: 'Realtidsanalys',
    badgeIcon: BarChart3,
    badgeColor: 'text-violet-700',
    title: 'Se vilka maskiner som faktiskt lönar sig',
    desc: 'Få full kontroll över varje maskins intäkter, kostnader, beläggningsgrad och lönsamhet. FleetOS gör det enkelt att se vilka maskiner som presterar bäst och var det finns möjlighet att förbättra resultatet.',
    benefits: ['ROI och nettoresultat per maskin', 'Beläggningsgrad och återbetalningstid', 'Kostnadsanalys inklusive service'],
    Mockup: ROIMockup,
  },
  {
    badge: 'Automatiserat',
    badgeIcon: Zap,
    badgeColor: 'text-emerald-700',
    title: 'Skapa uthyrningsorder på några minuter',
    desc: 'Välj kund och maskin så matchar FleetOS automatiskt rätt prismall. Hyrespris, period, tillägg och villkor beräknas direkt utan manuellt dubbelarbete.',
    benefits: ['Automatisk matchning av prismallar', 'Direkt beräkning för dag, vecka och månad', 'Färdigt fakturaunderlag från ordern'],
    Mockup: OrderMockup,
  },
  {
    badge: 'AI-driven',
    badgeIcon: Brain,
    badgeColor: 'text-blue-600',
    title: 'Lägg till maskiner på sekunder med AI',
    desc: 'Fotografera maskinens typskylt med mobilen. FleetOS identifierar automatiskt exempelvis märke, modell, kapacitet och serienummer och fyller i uppgifterna åt användaren.',
    benefits: ['Fotografera typskylten direkt med mobilen', 'AI identifierar och fyller i maskinuppgifterna', 'Granska och spara på under en minut'],
    Mockup: AIAnalysisMockup,
  },
  {
    badge: 'Digital signering',
    badgeIcon: PenLine,
    badgeColor: 'text-indigo-700',
    title: 'Låt kunden signera avtalet med BankID',
    desc: 'Skicka hyresavtalet direkt från ordern. Kunden signerar med BankID i mobilen och både kunden och uthyraren får det signerade avtalet automatiskt via e-post.',
    benefits: ['Avtalet skapas och skickas från ordern', 'Kunden signerar direkt med BankID', 'Det signerade avtalet arkiveras automatiskt'],
    Mockup: SigningMockup,
  },
  {
    badge: 'QR-returhantering',
    badgeIcon: QrCode,
    badgeColor: 'text-emerald-700',
    title: 'Registrera returer på under en minut',
    desc: 'Lagerpersonalen skannar QR-koden på maskinen och registrerar skick, drifttimmar och eventuella skador direkt i mobilen. Ordern och maskinens tillgänglighet uppdateras automatiskt.',
    benefits: ['Skanna maskinens QR-kod direkt i mobilen', 'Registrera skick och drifttimmar på plats', 'Order- och maskinstatus uppdateras direkt'],
    Mockup: QRReturnMockup,
  },
];

/* ─── Card ──────────────────────────────────────────────────────────── */
function FeatureCard({ badge, badgeIcon: BadgeIcon, badgeColor, title, desc, benefits, Mockup }: {
  badge: string;
  badgeIcon: typeof BarChart3;
  badgeColor: string;
  title: string;
  desc: string;
  benefits: string[];
  Mockup: () => React.ReactElement;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 sm:p-10 flex flex-col justify-center order-1">
          <div className={`inline-flex items-center gap-2 ${badgeColor} text-[11px] font-semibold mb-4 w-fit`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            {badge}
          </div>
          <h3 className="text-xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-3 leading-tight">
            {title}
          </h3>
          <p className="text-[14px] text-slate-500 leading-relaxed mb-6">{desc}</p>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <AnimateIn key={b} delay={i * 60} className="flex items-center gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
                  <ArrowRight className="w-3 h-3" />
                </span>
                <span className="text-[13.5px] text-slate-700 font-medium">{b}</span>
              </AnimateIn>
            ))}
          </div>
        </div>
        <div className="order-2 bg-slate-50 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm rounded-[1.75rem] bg-gradient-to-br from-slate-100 to-slate-200/80 ring-1 ring-slate-200/70 p-2 shadow-sm">
            <Mockup />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Section ───────────────────────────────────────────────────────── */
export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <AnimateIn>
              <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-widest mb-4">Funktioner</p>
              <h2 className="text-[32px] sm:text-[40px] font-bold text-slate-900 tracking-tight leading-[1.1] mb-5">
                Allt du behöver för smartare maskinuthyrning
              </h2>
              <p className="text-[15px] text-slate-500 leading-relaxed">
                FleetOS samlar hela uthyrningsflödet i ett system – från maskiner och order till avtal, returer, fakturering och lönsamhet.
              </p>
            </AnimateIn>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {FEATURES.map((f) => (
              <AnimateIn key={f.title} direction="up" threshold={0.01} rootMargin="0px 0px -22% 0px">
                <FeatureCard {...f} />
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
