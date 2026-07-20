'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, LayoutGrid, LayoutList, Truck, Sparkles, X, Loader2, Search, Lock, SlidersHorizontal, ChevronDown, Download, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { MachineStatusBadge } from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { exportToCsv } from '@/lib/csv';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils';
import { CATEGORY_LABELS, FUEL_LABELS, type MachineStatus, type Machine, type MachineCategory, type FuelType } from '@/lib/types';
import type { SearchCriteria } from '@/app/api/search-machines/route';
import Pagination from '@/components/ui/Pagination';

const PAGE_SIZE = 50;

function SortHeader<K extends string>({ label, column, activeKey, dir, onSort, className = '' }: {
  label: string; column: K; activeKey: K | null; dir: 'asc' | 'desc'; onSort: (col: K) => void; className?: string;
}) {
  const active = activeKey === column;
  return (
    <th
      onClick={() => onSort(column)}
      className={`text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors ${active ? 'text-slate-700' : 'text-slate-400 hover:text-slate-600'} ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
      </span>
    </th>
  );
}

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

const VALID_MACHINE_STATUSES: MachineStatus[] = ['i_lager', 'uthyrd', 'reserverad', 'service', 'skadad', 'utfasad'];

function MachinesPageInner() {
  const searchParams = useSearchParams();
  const { machines, orders, maxMachines, updateMachine, deleteMachine } = useStore();

  const today = new Date().toISOString().split('T')[0];

  const reservedMachineIds = useMemo(() => {
    const ids = new Set<string>();
    orders.forEach((o) => {
      if (o.status === 'reserverad' && o.startDate > today) ids.add(o.machineId);
    });
    return ids;
  }, [orders, today]);

  const getUpcomingReservation = (machineId: string) =>
    orders
      .filter((o) => o.machineId === machineId && o.status === 'reserverad' && o.startDate > today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null;

  const atMachineLimit = machines.length >= maxMachines;
  const [statusFilter, setStatusFilter] = useState<MachineStatus | 'all'>(() => {
    const status = searchParams.get('status');
    return status && VALID_MACHINE_STATUSES.includes(status as MachineStatus) ? (status as MachineStatus) : 'all';
  });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Manual filters
  type NumRange = { min: string; max: string };
  const emptyRange = (): NumRange => ({ min: '', max: '' });
  const [categories, setCategories] = useState<Set<MachineCategory>>(new Set());
  const [fuels, setFuels] = useState<Set<FuelType>>(new Set());
  const [locationFilter, setLocationFilter] = useState('');
  const [capacity, setCapacity] = useState<NumRange>(emptyRange());
  const [liftHeight, setLiftHeight] = useState<NumRange>(emptyRange());
  const [buildHeight, setBuildHeight] = useState<NumRange>(emptyRange());
  const [forkLength, setForkLength] = useState<NumRange>(emptyRange());
  const [freeLift, setFreeLift] = useState<NumRange>(emptyRange());
  const [maxReach, setMaxReach] = useState<NumRange>(emptyRange());
  const [digDepth, setDigDepth] = useState<NumRange>(emptyRange());
  const [bucketVolume, setBucketVolume] = useState<NumRange>(emptyRange());
  const [workingWeight, setWorkingWeight] = useState<NumRange>(emptyRange());
  const [enginePower, setEnginePower] = useState<NumRange>(emptyRange());
  const [year, setYear] = useState<NumRange>(emptyRange());

  const machineLocations = useMemo(
    () => Array.from(new Set(machines.map((m) => m.location).filter(Boolean))).sort(),
    [machines]
  );

  const activeManualFilterCount = [
    categories.size > 0, fuels.size > 0, !!locationFilter,
    capacity.min || capacity.max, liftHeight.min || liftHeight.max,
    buildHeight.min || buildHeight.max, forkLength.min || forkLength.max,
    freeLift.min || freeLift.max, maxReach.min || maxReach.max,
    digDepth.min || digDepth.max, bucketVolume.min || bucketVolume.max,
    workingWeight.min || workingWeight.max, enginePower.min || enginePower.max,
    year.min || year.max,
  ].filter(Boolean).length;

  function clearManualFilters() {
    setCategories(new Set()); setFuels(new Set()); setLocationFilter('');
    setCapacity(emptyRange()); setLiftHeight(emptyRange());
    setBuildHeight(emptyRange()); setForkLength(emptyRange());
    setFreeLift(emptyRange()); setMaxReach(emptyRange());
    setDigDepth(emptyRange()); setBucketVolume(emptyRange());
    setWorkingWeight(emptyRange()); setEnginePower(emptyRange());
    setYear(emptyRange());
  }

  function applyRange(val: number | undefined, range: NumRange): boolean {
    if (val == null) return true;
    if (range.min && val < Number(range.min)) return false;
    if (range.max && val > Number(range.max)) return false;
    return true;
  }

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

  const hasActiveFilters = statusFilter !== 'all' || aiActive || !!textSearch || activeManualFilterCount > 0;

  function clearAllFilters() {
    setStatusFilter('all');
    setTextSearch('');
    clearAI();
    clearManualFilters();
  }

  const activeCriteriaChips = useMemo(() => {
    if (!aiCriteria) return [];
    return Object.entries(aiCriteria)
      .filter(([, v]) => v != null && (Array.isArray(v) ? v.length > 0 : true))
      .map(([k, v]) => ({ key: k, label: criteriaLabel(k, v) }));
  }, [aiCriteria]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: machines.length };
    machines.forEach((m) => { counts[m.status] = (counts[m.status] ?? 0) + 1; });
    // Add machines with upcoming reservations to the 'reserverad' count
    const extraReserved = machines.filter((m) => m.status !== 'reserverad' && reservedMachineIds.has(m.id)).length;
    counts['reserverad'] = (counts['reserverad'] ?? 0) + extraReserved;
    return counts;
  }, [machines, reservedMachineIds]);

  const filtered = useMemo(() => {
    let result = machines;
    if (statusFilter === 'reserverad') {
      result = result.filter((m) => m.status === 'reserverad' || reservedMachineIds.has(m.id));
    } else if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }
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
    // Manual filters
    if (categories.size > 0) result = result.filter((m) => categories.has(m.category));
    if (fuels.size > 0) result = result.filter((m) => fuels.has(m.fuelType));
    if (locationFilter) result = result.filter((m) => m.location === locationFilter);
    result = result.filter((m) =>
      applyRange(m.capacity, capacity) &&
      applyRange(m.liftHeight, liftHeight) &&
      applyRange(m.buildHeight, buildHeight) &&
      applyRange(m.forkLength, forkLength) &&
      applyRange(m.freeLift, freeLift) &&
      applyRange(m.maxReach, maxReach) &&
      applyRange(m.digDepth, digDepth) &&
      applyRange(m.bucketVolume, bucketVolume) &&
      applyRange(m.workingWeight, workingWeight) &&
      applyRange(m.enginePower, enginePower) &&
      applyRange(m.year, year)
    );
    return result;
  }, [machines, statusFilter, aiActive, aiCriteria, textSearch,
      categories, fuels, locationFilter, capacity, liftHeight, buildHeight, forkLength,
      freeLift, maxReach, digDepth, bucketVolume, workingWeight, enginePower, year]);

  useEffect(() => { setPage(1); }, [statusFilter, aiActive, textSearch,
    categories, fuels, locationFilter, capacity, liftHeight, buildHeight, forkLength,
    freeLift, maxReach, digDepth, bucketVolume, workingWeight, enginePower, year]);

  type SortKey = 'name' | 'category' | 'capacity' | 'operatingHours' | 'totalRevenue' | 'totalRentals';
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = sortKey === 'category' ? CATEGORY_LABELS[a.category] : a[sortKey];
      const bv = sortKey === 'category' ? CATEGORY_LABELS[b.category] : b[sortKey];
      if (typeof av === 'string' || typeof bv === 'string') return String(av).localeCompare(String(bv), 'sv') * dir;
      return ((av as number) - (bv as number)) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  useEffect(() => { setSelected(new Set()); }, [page, filtered]);

  const selectedMachines = machines.filter((m) => selected.has(m.id));
  const allVisibleSelected = paginated.length > 0 && paginated.every((m) => selected.has(m.id));

  function toggleSelectAllVisible() {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        paginated.forEach((m) => next.delete(m.id));
        return next;
      }
      const next = new Set(prev);
      paginated.forEach((m) => next.add(m.id));
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function bulkChangeStatus(status: MachineStatus) {
    selected.forEach((id) => updateMachine(id, { status }));
    setSelected(new Set());
  }

  function bulkDelete() {
    selected.forEach((id) => deleteMachine(id));
    setSelected(new Set());
    setBulkDeleteConfirm(false);
  }

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
            <button
              onClick={() => exportToCsv('maskiner.csv', machinesToCsvRows(filtered))}
              className="flex items-center gap-1.5 px-3.5 py-[7px] bg-white text-slate-700 border border-slate-200 text-[13px] font-medium rounded-xl hover:bg-slate-50 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Exportera CSV
            </button>
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

        {/* Text search + filter button (when AI not active) */}
        {!aiActive && (
          <div className="flex items-center gap-2">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Sök på namn, märke, serienummer..."
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xl border transition-colors cursor-pointer shrink-0 ${
                showFilters || activeManualFilterCount > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
              {activeManualFilterCount > 0 && (
                <span className="flex items-center justify-center w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                  {activeManualFilterCount}
                </span>
              )}
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {activeManualFilterCount > 0 && (
              <button
                onClick={clearManualFilters}
                className="flex items-center gap-1 px-3 py-2 text-[12px] font-medium text-slate-500 hover:text-red-600 bg-white border border-slate-200 hover:border-red-200 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3 h-3" />
                Rensa
              </button>
            )}
          </div>
        )}

        {/* Manual filter panel */}
        {showFilters && !aiActive && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5">

            {/* Kategori */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Kategori</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(CATEGORY_LABELS) as [MachineCategory, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setCategories((prev) => {
                      const next = new Set(prev);
                      next.has(key) ? next.delete(key) : next.add(key);
                      return next;
                    })}
                    className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium border transition-colors cursor-pointer ${
                      categories.has(key)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drivmedel */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Drivmedel</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(FUEL_LABELS) as [FuelType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFuels((prev) => {
                      const next = new Set(prev);
                      next.has(key) ? next.delete(key) : next.add(key);
                      return next;
                    })}
                    className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium border transition-colors cursor-pointer ${
                      fuels.has(key)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Plats */}
            {machineLocations.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Plats</p>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-3 py-1.5 text-[12.5px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                >
                  <option value="">Alla platser</option>
                  {machineLocations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Specifikationer */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Specifikationer</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {([
                  { label: 'Kapacitet (kg)', state: capacity, set: setCapacity },
                  { label: 'Lyfthöjd (mm)', state: liftHeight, set: setLiftHeight },
                  { label: 'Bygghöjd (mm)', state: buildHeight, set: setBuildHeight },
                  { label: 'Gaffellängd (mm)', state: forkLength, set: setForkLength },
                  { label: 'Frilyft (mm)', state: freeLift, set: setFreeLift },
                  { label: 'Max räckvidd (mm)', state: maxReach, set: setMaxReach },
                  { label: 'Grävdjup (mm)', state: digDepth, set: setDigDepth },
                  { label: 'Skopvolym (l)', state: bucketVolume, set: setBucketVolume },
                  { label: 'Tjänstevikt (kg)', state: workingWeight, set: setWorkingWeight },
                  { label: 'Motoreffekt (kW)', state: enginePower, set: setEnginePower },
                  { label: 'Årsmodell', state: year, set: setYear },
                ] as { label: string; state: NumRange; set: React.Dispatch<React.SetStateAction<NumRange>> }[]).map(({ label, state, set }) => (
                  <div key={label}>
                    <p className="text-[11px] text-slate-500 mb-1.5">{label}</p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Min"
                        value={state.min}
                        onChange={(e) => set((p) => ({ ...p, min: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-300"
                      />
                      <span className="text-slate-300 text-[11px] shrink-0">–</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={state.max}
                        onChange={(e) => set((p) => ({ ...p, max: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

        {/* Bulk actions toolbar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 flex-wrap bg-slate-900 text-white rounded-xl px-4 py-2.5">
            <span className="text-[12.5px] font-medium">{selected.size} valda</span>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-slate-300 hover:text-white cursor-pointer">
              Avmarkera
            </button>
            <div className="ml-auto flex items-center gap-2">
              <select
                onChange={(e) => { if (e.target.value) bulkChangeStatus(e.target.value as MachineStatus); e.target.value = ''; }}
                defaultValue=""
                className="px-2.5 py-1.5 text-[12px] bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
              >
                <option value="" disabled>Ändra status...</option>
                {VALID_MACHINE_STATUSES.map((s) => (
                  <option key={s} value={s}>{statusLabels[s]}</option>
                ))}
              </select>
              <button
                onClick={() => exportToCsv('maskiner.csv', machinesToCsvRows(selectedMachines))}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Exportera
              </button>
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ta bort
              </button>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="w-10 px-3 py-3">
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} className="cursor-pointer" />
                  </th>
                  <SortHeader label="Maskin" column="name" activeKey={sortKey} dir={sortDir} onSort={toggleSort} className="px-5" />
                  <SortHeader label="Kategori" column="category" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Drivmedel</th>
                  <SortHeader label="Kapacitet" column="capacity" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Timmar" column="operatingHours" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <SortHeader label="Intäkt" column="totalRevenue" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Uthyrn." column="totalRentals" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Plats</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11}>
                      {hasActiveFilters ? (
                        <EmptyState icon={Search} title="Inga träffar" description="Inga maskiner matchar sökningen eller filtren." actionLabel="Rensa filter" onAction={clearAllFilters} />
                      ) : (
                        <EmptyState icon={Truck} title="Inga maskiner ännu" description="Lägg till din första maskin för att komma igång." actionLabel="Lägg till maskin" actionHref="/machines/new" />
                      )}
                    </td>
                  </tr>
                )}
                {paginated.map((machine) => (
                  <tr key={machine.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-3 py-3.5">
                      <input type="checkbox" checked={selected.has(machine.id)} onChange={() => toggleSelect(machine.id)} className="cursor-pointer" />
                    </td>
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
                    <td className="px-4 py-3.5 text-[13px] text-slate-600">{machine.totalRentals} st</td>
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
            <div className="px-5 py-3">
              <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((machine) => (
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
                <p className="text-[11px] text-slate-400 mt-1">{machine.brand} {machine.model} · {machine.internalCode}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {[
                    machine.capacity > 0 ? `${machine.capacity.toLocaleString('sv-SE')} kg` : null,
                    FUEL_LABELS[machine.fuelType],
                    `${machine.operatingHours.toLocaleString('sv-SE')} h`,
                    machine.location || null,
                  ].filter(Boolean).join(' · ')}
                </p>
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
              <div className="col-span-4">
                {hasActiveFilters ? (
                  <EmptyState icon={Search} title="Inga träffar" description="Inga maskiner matchar sökningen eller filtren." actionLabel="Rensa filter" onAction={clearAllFilters} />
                ) : (
                  <EmptyState icon={Truck} title="Inga maskiner ännu" description="Lägg till din första maskin för att komma igång." actionLabel="Lägg till maskin" actionHref="/machines/new" />
                )}
              </div>
            )}
            {filtered.length > 0 && (
              <div className="col-span-full mt-2">
                <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={bulkDeleteConfirm}
        title="Ta bort maskiner"
        message={`Är du säker på att du vill ta bort ${selected.size} maskin${selected.size !== 1 ? 'er' : ''}? Åtgärden kan inte ångras.`}
        onConfirm={bulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}

function machinesToCsvRows(list: Machine[]) {
  return list.map((m) => ({
    Namn: m.name,
    'Intern kod': m.internalCode,
    Fabrikat: m.brand,
    Modell: m.model,
    Kategori: CATEGORY_LABELS[m.category],
    Drivmedel: FUEL_LABELS[m.fuelType],
    'Kapacitet (kg)': m.capacity,
    Drifttimmar: m.operatingHours,
    Status: m.status,
    Plats: m.location,
    'Total intäkt': m.totalRevenue,
    'Antal uthyrningar': m.totalRentals,
  }));
}

export default function MachinesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center flex-1 text-slate-400">Laddar...</div>}>
      <MachinesPageInner />
    </Suspense>
  );
}
