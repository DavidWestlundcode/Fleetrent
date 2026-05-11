'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Wrench, CheckCircle2, Clock, Calendar } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ServiceType, ServiceStatus } from '@/lib/types';

const inputClass = 'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white';

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  periodisk: 'Periodisk service',
  reparation: 'Reparation',
  besiktning: 'Besiktning',
  kontroll: 'Kontroll',
};

const statusColors: Record<ServiceStatus, string> = {
  planerad: 'bg-amber-100 text-amber-700',
  pagaende: 'bg-blue-100 text-blue-700',
  avslutad: 'bg-emerald-100 text-emerald-700',
};

const statusLabels: Record<ServiceStatus, string> = {
  planerad: 'Planerad',
  pagaende: 'Pågående',
  avslutad: 'Avslutad',
};

function ServiceContent() {
  const searchParams = useSearchParams();
  const { serviceRecords, machines, addServiceRecord, updateServiceRecord } = useStore();
  const [showForm, setShowForm] = useState(searchParams.has('machine'));
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');
  const [form, setForm] = useState({
    machineId: searchParams.get('machine') ?? '',
    type: 'periodisk' as ServiceType,
    status: 'planerad' as ServiceStatus,
    description: '',
    technicianName: '',
    startDate: new Date().toISOString().split('T')[0],
    completedDate: '',
    cost: 0,
    notes: '',
  });

  const set = (field: string, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addServiceRecord({ ...form, images: [] });
    setShowForm(false);
    setForm({ machineId: '', type: 'periodisk', status: 'planerad', description: '', technicianName: '', startDate: new Date().toISOString().split('T')[0], completedDate: '', cost: 0, notes: '' });
  };

  const filtered = serviceRecords.filter((s) => statusFilter === 'all' || s.status === statusFilter);
  const counts = { all: serviceRecords.length, planerad: 0, pagaende: 0, avslutad: 0 };
  serviceRecords.forEach((s) => counts[s.status]++);

  const totalCost = serviceRecords.filter((s) => s.status === 'avslutad').reduce((sum, s) => sum + s.cost, 0);
  const pendingCost = serviceRecords.filter((s) => s.status !== 'avslutad').reduce((sum, s) => sum + s.cost, 0);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title="Service & Underhåll"
        subtitle="Hantera serviceärenden och reparationer"
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nytt serviceärende
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pågående', value: counts.pagaende, icon: Clock, color: 'text-blue-600 bg-blue-50' },
            { label: 'Planerade', value: counts.planerad, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
            { label: 'Avslutade', value: counts.avslutad, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Totala servicekostnader', value: formatCurrency(totalCost), icon: Wrench, color: 'text-slate-600 bg-slate-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className={`inline-flex p-2 rounded-lg ${color} mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-blue-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Nytt serviceärende</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Maskin *</label>
                <select required value={form.machineId} onChange={(e) => set('machineId', e.target.value)} className={inputClass}>
                  <option value="">Välj maskin...</option>
                  {machines.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.internalCode})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Typ</label>
                <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputClass}>
                  {Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Beskrivning *</label>
                <input required value={form.description} onChange={(e) => set('description', e.target.value)} className={inputClass} placeholder="Beskriv serviceåtgärden..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Tekniker</label>
                <input value={form.technicianName} onChange={(e) => set('technicianName', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
                  <option value="planerad">Planerad</option>
                  <option value="pagaende">Pågående</option>
                  <option value="avslutad">Avslutad</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Startdatum</label>
                <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Slutfört datum</label>
                <input type="date" value={form.completedDate} onChange={(e) => set('completedDate', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Kostnad (kr)</label>
                <input type="number" value={form.cost} onChange={(e) => set('cost', Number(e.target.value))} className={inputClass} min={0} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Anteckningar</label>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className={`${inputClass} resize-none`} rows={3} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Avbryt</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Spara ärende</button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['all', 'pagaende', 'planerad', 'avslutad'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? 'Alla' : statusLabels[s]}
              <span className={`ml-1 text-xs ${statusFilter === s ? 'text-blue-200' : 'text-slate-400'}`}>{counts[s]}</span>
            </button>
          ))}
        </div>

        {/* Records */}
        <div className="space-y-3">
          {filtered.map((record) => {
            const machine = machines.find((m) => m.id === record.machineId);
            return (
              <div key={record.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[record.status]}`}>
                        {statusLabels[record.status]}
                      </span>
                      <span className="text-xs text-slate-400">{SERVICE_TYPE_LABELS[record.type]}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800">{record.description}</h3>
                    {machine && (
                      <Link href={`/machines/${machine.id}`} className="text-xs text-blue-600 hover:underline">
                        {machine.name} ({machine.internalCode})
                      </Link>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-slate-800">{formatCurrency(record.cost)}</p>
                    <p className="text-xs text-slate-500">{formatDate(record.startDate)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  {record.technicianName && <span>Tekniker: {record.technicianName}</span>}
                  {record.completedDate && <span>Slutfört: {formatDate(record.completedDate)}</span>}
                  {record.notes && <span className="italic">{record.notes}</span>}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {record.status === 'planerad' && (
                    <button
                      onClick={() => updateServiceRecord(record.id, { status: 'pagaende' })}
                      className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Starta
                    </button>
                  )}
                  {record.status === 'pagaende' && (
                    <button
                      onClick={() => updateServiceRecord(record.id, { status: 'avslutad', completedDate: new Date().toISOString().split('T')[0] })}
                      className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      Markera avslutad
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400">Inga serviceärenden hittades</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServicePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center flex-1 text-slate-400">Laddar...</div>}>
      <ServiceContent />
    </Suspense>
  );
}
