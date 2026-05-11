'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, LayoutGrid, LayoutList, Truck } from 'lucide-react';
import Header from '@/components/layout/Header';
import { MachineStatusBadge } from '@/components/ui/StatusBadge';
import { useStore } from '@/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_LABELS, FUEL_LABELS, type MachineStatus, type MachineCategory } from '@/lib/types';

export default function MachinesPage() {
  const { machines } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MachineStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<MachineCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filtered = useMemo(() => {
    return machines.filter((m) => {
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.brand.toLowerCase().includes(search.toLowerCase()) ||
        m.model.toLowerCase().includes(search.toLowerCase()) ||
        m.internalCode.toLowerCase().includes(search.toLowerCase()) ||
        m.serialNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [machines, search, statusFilter, categoryFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: machines.length };
    machines.forEach((m) => { counts[m.status] = (counts[m.status] ?? 0) + 1; });
    return counts;
  }, [machines]);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title="Maskinflotta"
        subtitle={`${machines.length} maskiner registrerade`}
        actions={
          <Link
            href="/machines/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lägg till maskin
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'i_lager', 'uthyrd', 'reserverad', 'service', 'skadad', 'utfasad'] as const).map((s) => {
            const labels: Record<string, string> = {
              all: 'Alla', i_lager: 'I lager', uthyrd: 'Uthyrd', reserverad: 'Reserverad',
              service: 'Service', skadad: 'Skadad', utfasad: 'Utfasad',
            };
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {labels[s]}
                <span className={`ml-1.5 text-xs ${statusFilter === s ? 'text-blue-200' : 'text-slate-400'}`}>
                  {statusCounts[s] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Sök maskin, modell, serienummer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as MachineCategory | 'all')}
              className="pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="all">Alla kategorier</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Maskin</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Drivmedel</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timmar</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total intäkt</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plats</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      Inga maskiner hittades
                    </td>
                  </tr>
                )}
                {filtered.map((machine) => (
                  <tr key={machine.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-slate-800">{machine.name}</p>
                        <p className="text-xs text-slate-500">{machine.brand} {machine.model} · {machine.internalCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{CATEGORY_LABELS[machine.category]}</td>
                    <td className="px-4 py-3.5 text-slate-600">{FUEL_LABELS[machine.fuelType]}</td>
                    <td className="px-4 py-3.5 text-slate-600">{machine.operatingHours.toLocaleString('sv-SE')} h</td>
                    <td className="px-4 py-3.5">
                      <MachineStatusBadge status={machine.status} />
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{formatCurrency(machine.totalRevenue)}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">{machine.location}</td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/machines/${machine.id}`}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        Visa
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((machine) => (
              <Link
                key={machine.id}
                href={`/machines/${machine.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Truck className="w-5 h-5 text-slate-600" />
                  </div>
                  <MachineStatusBadge status={machine.status} />
                </div>
                <h3 className="font-semibold text-slate-800">{machine.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{machine.brand} {machine.model}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Intäkt</p>
                    <p className="text-sm font-semibold text-slate-700">{formatCurrency(machine.totalRevenue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Uthyrningar</p>
                    <p className="text-sm font-semibold text-slate-700">{machine.totalRentals} st</p>
                  </div>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-4 py-12 text-center text-slate-400">Inga maskiner hittades</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
