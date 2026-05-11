'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { CATEGORY_LABELS, FUEL_LABELS, type MachineCategory, type FuelType, type MachineStatus } from '@/lib/types';

const inputClass = 'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function EditMachinePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { machines, updateMachine } = useStore();
  const machine = machines.find((m) => m.id === id);

  const [form, setForm] = useState({
    name: '', model: '', brand: '', serialNumber: '', registrationNumber: '',
    internalCode: '', category: 'motviktstruck' as MachineCategory,
    capacity: '', fuelType: 'diesel' as FuelType, year: 2020,
    operatingHours: 0, status: 'i_lager' as MachineStatus, notes: '', location: '',
    purchasePrice: 0, purchaseDate: '', leasingCost: 0, financingCost: 0,
    insuranceCost: 0, serviceCost: 0, otherCosts: 0,
  });

  useEffect(() => {
    if (machine) {
      setForm({
        name: machine.name, model: machine.model, brand: machine.brand,
        serialNumber: machine.serialNumber, registrationNumber: machine.registrationNumber,
        internalCode: machine.internalCode, category: machine.category,
        capacity: machine.capacity, fuelType: machine.fuelType, year: machine.year,
        operatingHours: machine.operatingHours, status: machine.status,
        notes: machine.notes, location: machine.location,
        purchasePrice: machine.purchasePrice, purchaseDate: machine.purchaseDate,
        leasingCost: machine.leasingCost, financingCost: machine.financingCost,
        insuranceCost: machine.insuranceCost, serviceCost: machine.serviceCost,
        otherCosts: machine.otherCosts,
      });
    }
  }, [machine]);

  if (!machine) return <div className="flex items-center justify-center flex-1 text-slate-400">Maskinen hittades inte</div>;

  const set = (field: string, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMachine(id, form);
    router.push(`/machines/${id}`);
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title={`Redigera: ${machine.name}`} />
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <Link href={`/machines/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Tillbaka
        </Link>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Grundinformation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Maskinnamn">
                <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
                  {(['i_lager', 'uthyrd', 'reserverad', 'service', 'skadad', 'utfasad'] as MachineStatus[]).map((s) => (
                    <option key={s} value={s}>{s === 'i_lager' ? 'I lager' : s === 'uthyrd' ? 'Uthyrd' : s === 'reserverad' ? 'Reserverad' : s === 'service' ? 'Service' : s === 'skadad' ? 'Skadad' : 'Utfasad'}</option>
                  ))}
                </select>
              </Field>
              <Field label="Intern kod">
                <input required value={form.internalCode} onChange={(e) => set('internalCode', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Fabrikat">
                <input value={form.brand} onChange={(e) => set('brand', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Modell">
                <input value={form.model} onChange={(e) => set('model', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Kategori">
                <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Drivmedel">
                <select value={form.fuelType} onChange={(e) => set('fuelType', e.target.value)} className={inputClass}>
                  {Object.entries(FUEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Kapacitet">
                <input value={form.capacity} onChange={(e) => set('capacity', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Årsmodell">
                <input type="number" value={form.year} onChange={(e) => set('year', Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Serienummer">
                <input value={form.serialNumber} onChange={(e) => set('serialNumber', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Registreringsnummer">
                <input value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Drifttimmar">
                <input type="number" value={form.operatingHours} onChange={(e) => set('operatingHours', Number(e.target.value))} className={inputClass} min={0} />
              </Field>
              <Field label="Placering">
                <input value={form.location} onChange={(e) => set('location', e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Anteckningar">
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className={`${inputClass} resize-none mt-4`} rows={3} />
            </Field>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Ekonomi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Inköpspris (kr)">
                <input type="number" value={form.purchasePrice} onChange={(e) => set('purchasePrice', Number(e.target.value))} className={inputClass} min={0} />
              </Field>
              <Field label="Inköpsdatum">
                <input type="date" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Finansieringskostnad/mån (kr)">
                <input type="number" value={form.financingCost} onChange={(e) => set('financingCost', Number(e.target.value))} className={inputClass} min={0} />
              </Field>
              <Field label="Försäkring/mån (kr)">
                <input type="number" value={form.insuranceCost} onChange={(e) => set('insuranceCost', Number(e.target.value))} className={inputClass} min={0} />
              </Field>
              <Field label="Leasingkostnad/mån (kr)">
                <input type="number" value={form.leasingCost} onChange={(e) => set('leasingCost', Number(e.target.value))} className={inputClass} min={0} />
              </Field>
              <Field label="Övriga kostnader/mån (kr)">
                <input type="number" value={form.otherCosts} onChange={(e) => set('otherCosts', Number(e.target.value))} className={inputClass} min={0} />
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href={`/machines/${id}`} className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Avbryt</Link>
            <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              <Save className="w-4 h-4" /> Spara
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
