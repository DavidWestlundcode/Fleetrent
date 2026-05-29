'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, LayoutGrid, LayoutList, Truck, Sparkles, X, Loader2, Search, Lock } from 'lucide-react';
import Header from '@/components/layout/Header';
import { MachineStatusBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils';
import { CATEGORY_LABELS, FUEL_LABELS, type MachineStatus, type Machine } from '@/lib/types';
import type { SearchCriteria } from '@/app/api/search-machines/route';

const EXAMPLES = [
  'Motviktstruck, el, kapacitet max 2000 kg',
  'Lyfthöjd min 5000 mm, bygghöjd max 2500 mm',
  'Grävmaskin, grävdjup min 4000 mm',
  'Teleskoplastare, räckvidd 8000 mm',
];

function criteriaLabel(key: string, value: unknown): string {
  const map: Record<string, string> = {
    category: 'Typ',
    fuelTypes: 'Drivmedel',
    capacityMin: 'Kapacitet ≥',
    capacityMax: 'Kapacitet ≤',
    liftHeightMin: 'Lyfthöjd ≥',
    liftHeightMax: 'Lyfthöjd ≤',
    buildHeightMin: 'Bygghöjd ≥',
    buildHeightMax: 'Bygghöjd ≤',
    forkLengthMin: 'Gaffellängd ≥',
    forkLengthMax: 'Gaffellängd ≤',
    freeLiftMin: 'Frilyft ≥',
    freeLiftMax: 'Frilyft ≤',
    maxReachMin: 'Max räckvidd ≥',
    maxReachMax: 'Max räckvidd ≤',
    digDepthMin: 'Grävdjup ≥',
    digDepthMax: 'Grävdjup ≤',
    bucketVolumeMin: 'Skopvolym ≥',
    bucketVolumeMax: 'Skopvolym ≤',
    workingWeightMin: 'Tjänstevikt ≥',
    workingWeightMax: 'Tjänstevikt ≤',
    enginePowerMin: 'Motoreffekt ≥',
    enginePowerMax: 'Motoreffekt ≤',
    yearMin: 'Årsmodell ≥',
    yearMax: 'Årsmodell ≤',
  };
  const label = map[key] ?? key;
  if (key === 'category') return CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS] ?? String(value);
  if (key === 'fuelTypes') return (value as string[]).map((f) => FUEL_LABELS[f as keyof typeof FUEL_LABELS] ?? f).join(', ');
  const unit = key.includes('Height') || key.includes('Reach') || key.includes('Depth') || key.includes('Length') || key.includes('Lift') ? ' mm' :
    key.includes('capacity') || key.includes('Weight') ? ' kg' :
    key.includes('bucket') || key.includes('Volume') ? ' l' :
    key.includes('Power') ? ' kW' : '';
  return `${label} ${value}${unit}`;
}

function applyAICriteria(machines: Machine[], criteria: SearchCriteria): Machine[] {
  return machines.filter((m) => {
    if (criteria.category && m.category !== criteria.category) return false;
    if (criteria.fuelTypes?.length && !criteria.fuelTypes.includes(m.fuelType)) return false;
    if (criteria.capacityMin != null && m.capacity < criteria.capacityMin) return false;
    if (criteria.capacityMax != null && m.capacity > criteria.capacityMax) return false;
    if (criteria.liftHeightMin != null && m.liftHeight != null && m.liftHeight < criteria.liftHeightMin) return false;
    if (criteria.liftHeightMax != null && m.liftHeight != null && m.liftHeight > criteria.liftHeightMax) return false;
    if (criteria.buildHeightMin != null && m.buildHeight != null && m.buildHeight < criteria.buildHeightMin) return false;
    if (criteria.buildHeightMax != null && m.buildHeight != null && m.buildHeight > criteria.buildHeightMax) return false;
    if (criteria.forkLengthMin != null && m.forkLength != null && m.forkLength < criteria.forkLengthMin) return false;
    if (criteria.forkLengthMax != null && m.forkLength != null && m.forkLength > criteria.forkLengthMax) return false;
    if (criteria.freeLiftMin != null && m.freeLift != null && m.freeLift < criteria.freeLiftMin) return false;
    if (criteria.maxReachMin != null && m.maxReach != null && m.maxReach < criteria.maxReachMin) return false;
    if (criteria.maxReachMax != null && m.maxReach != null && m.maxReach > criteria.maxReachMax) return false;
    if (criteria.digDepthMin != null && m.digDepth != null && m.digDepth < criteria.digDepthMin) return false;
    if (criteria.digDepthMax != null && m.digDepth != null && m.digDepth > criteria.digDepthMax) return false;
    if (criteria.bucketVolumeMin != null && m.bucketVolume != null && m.bucketVolume < criteria.bucketVolumeMin) return false;
    if (criteria.bucketVolumeMax != null && m.bucketVolume != null && m.bucketVolume > criteria.bucketVolumeMax) return false;
    if (criteria.workingWeightMin != null && m.workingWeight != null && m.workingWeight < criteria.workingWeightMin) return false;
    if (criteria.workingWeightMax != null && m.workingWeight != null && m.workingWeight > criteria.workingWeightMax) return false;
    if (criteria.enginePowerMin != null && m.enginePower != null && m.enginePower < criteria.enginePowerMin) return false;
    if (criteria.yearMin != null && m.year < criteria.yearMin) return false;
    if (criteria.yearMax != null && m.year > criteria.yearMax) return false;
    return true;
  });
}

export default function MachinesPage() {
  const { machines, orders, maxMachines } = useStore();

  const getUpcomingReservation = (machineId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return orders
      .filter((o) => o.machineId === machineId && o.status === 'reserverad' && o.startDate > today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null;
  };
  const atMachineLimit = machines.length >= maxMachines;
  const [statusFilter, setStatusFilter] = useState<MachineStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Text search (name/brand/model)
  const [textSearch, setTextSearch] = useState('');

  // AI search
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiCriteria, setAiCriteria] = useState<SearchCriteria | null>(null);
  const [aiActive, setAiActive] = useState(false);

  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/search-machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiCriteria(data.criteria);
      setAiActive(true);
      setTextSearch('');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Sökning misslyckades');
    } finally {
      setAiLoading(false);
    }
  };

  const clearAI = () => {
    setAiActive(false);
    setAiCriteria(null);
    setAiQuery('');
    setAiError('');
  };

  const activeCriteriaChips = useMemo(() => {
    if (!aiCriteria) return [];
    return Object.entries(aiCriteria)
      .filter(([, v]) => v != null && (Array.isArray(v) ? v.length > 0 : true))
      .map(([k, v]) => ({ key: k, label: criteriaLabel(k, v) }));
  }, [aiCriteria]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: machines.length };
    machines.forEach((m) => { counts[m.status] = (counts[m.status] ?? 0) + 1; });
    return counts;
  }, [machines]);

  const filtered = useMemo(() => {
    let result = machines;
    if (statusFilter !== 'all') result = result.filter((m) => m.status === statusFilter);
    if (aiActive && aiCriteria) {
      result = applyAICriteria(result, aiCriteria);
    } else if (textSearch) {
      const q = textSearch.toLowerCase();
      result = result.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.internalCode.toLowerCase().includes(q) ||
        m.serialNumber.toLowerCase().includes(q)
      );
    }
    return result;
  }, [machines, statusFilter, aiActive, aiCriteria, textSearch]);

  const statusLabels: Record<string, string> = {
    all: 'Alla', i_lager: 'I lager', uthyrd: 'Uthyrd',
    reserverad: 'Reserverad', service: 'Service', skadad: 'Skadad', utfasad: 'Utfasad',
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-50/60">
      <Header
        title="Maskinflotta"
        subtitle={`${machines.length} maskiner registrerade`}
        actions={
          <div className="flex items-center gap-2.5">
            <span className={`text-[12px] font-medium ${atMachineLimit ? 'text-red-500' : 'text-slate-400'}`}>
              {machines.length}/{maxMachines} maskiner
            </span>
            {atMachineLimit ? (
              <button
                disabled
                title="Kontakta oss för att utöka din plan"
                className="flex items-center gap-1.5 px-3.5 py-[7px] bg-slate-200 text-slate-400 text-[13px] font-medium rounded-xl cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" />
                Gräns nådd
              </button>
            ) : (
              <Link
                href="/machines/new"
                className="flex items-center gap-1.5 px-3.5 py-[7px] bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Lägg till maskin
              </Link>
            )}
          </div>
        }
      />

      <div className="flex-1 p-3 sm:p-6 space-y-4">
        {/* AI Search */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-[13px] font-semibold text-slate-800">AI-sökning</span>
            <span className="text-[11px] text-slate-400">Beskriv maskinen du letar efter på naturligt språk</span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                placeholder="T.ex. motviktstruck el, lyfthöjd min 5000 mm, kapacitet max 2000 kg..."
                className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-400"
                disabled={aiLoading}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
            <button
              onClick={handleAISearch}
              disabled={aiLoading || !aiQuery.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-xl transition-all cursor-pointer"
            >
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {aiLoading ? 'Analyserar...' : 'Sök'}
            </button>
            {aiActive && (
              <button
                onClick={clearAI}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[13px] font-medium rounded-xl transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Rensa
              </button>
            )}
          </div>

          {/* Examples */}
          {!aiActive && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setAiQuery(ex)}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-500 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          {/* Active criteria chips */}
          {aiActive && activeCriteriaChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-[11px] text-slate-400 self-center">Aktiva filter:</span>
              {activeCriteriaChips.map(({ key, label }) => (
                <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-lg text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  {label}
                </span>
              ))}
              <span className="text-[11px] text-slate-500 self-center ml-1">→ {filtered.length} maskiner</span>
            </div>
          )}

          {aiError && (
            <p className="mt-2 text-[12px] text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">{aiError}</p>
          )}
        </div>

        {/* Text search (when AI not active) */}
        {!aiActive && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Sök på namn, märke, serienummer..."
              value={textSearch}
              onChange={(e) => setTextSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400"
            />
          </div>
        )}

        {/* Status Filter Tabs + view toggle */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'i_lager', 'uthyrd', 'reserverad', 'service', 'skadad', 'utfasad'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {statusLabels[s]}
                <span className={`ml-1.5 text-[11px] ${statusFilter === s ? 'text-white/60' : 'text-slate-400'}`}>
                  {statusCounts[s] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl p-1">
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg cursor-pointer transition-colors ${viewMode === 'table' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Maskin</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Drivmedel</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kapacitet</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Timmar</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Intäkt</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Plats</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-14 text-center text-[13px] text-slate-400">Inga maskiner hittades</td>
                  </tr>
                )}
                {filtered.map((machine) => (
                  <tr key={machine.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-[13px] font-medium text-slate-800">{machine.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{machine.brand} {machine.model} · {machine.internalCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-600">{CATEGORY_LABELS[machine.category]}</td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-600">{FUEL_LABELS[machine.fuelType]}</td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-600">
                      {machine.capacity > 0 ? `${machine.capacity.toLocaleString('sv-SE')} kg` : '–'}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-600">{machine.operatingHours.toLocaleString('sv-SE')} h</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <MachineStatusBadge status={machine.status} />
                        {(() => {
                          const res = getUpcomingReservation(machine.id);
                          return res ? (
                            <span
                              title={`Bokad från ${res.startDate}`}
                              className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full cursor-default"
                            >
                              Bokad {res.startDate}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-slate-700">{formatCurrency(machine.totalRevenue)}</td>
                    <td className="px-4 py-3.5 text-[12px] text-slate-400">{machine.location}</td>
                    <td className="px-4 py-3.5">
                      <Link href={`/machines/${machine.id}`} className="text-[12px] font-medium text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        Visa →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((machine) => (
              <Link key={machine.id} href={`/machines/${machine.id}`} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-200 cursor-pointer">
                <div className="flex items-start justify-between mb-3.5">
                  <div className="p-2 bg-slate-100 rounded-xl">
                    <Truck className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <MachineStatusBadge status={machine.status} />
                    {(() => {
                      const res = getUpcomingReservation(machine.id);
                      return res ? (
                        <span
                          title={`Bokad från ${res.startDate}`}
                          className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full cursor-default"
                        >
                          Bokad {res.startDate}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
                <h3 className="text-[13px] font-semibold text-slate-800 leading-tight">{machine.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{machine.brand} {machine.model}</p>
                {machine.capacity > 0 && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{machine.capacity.toLocaleString('sv-SE')} kg</p>
                )}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Intäkt</p>
                    <p className="text-[13px] font-semibold text-slate-700 mt-0.5">{formatCurrency(machine.totalRevenue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Uthyrn.</p>
                    <p className="text-[13px] font-semibold text-slate-700 mt-0.5">{machine.totalRentals} st</p>
                  </div>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-4 py-14 text-center text-[13px] text-slate-400">Inga maskiner hittades</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
