'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { CATEGORY_LABELS, FUEL_LABELS, type MachineCategory, type FuelType, type MachineStatus } from '@/lib/types';
import PhotoCapture from '@/components/ui/PhotoCapture';

const inputCls = 'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const SPEC_FIELDS: Record<MachineCategory, { key: string; label: string; unit: string }[]> = {
  motviktstruck: [
    { key: 'liftHeight', label: 'Lyfthöjd', unit: 'mm' },
    { key: 'buildHeight', label: 'Bygghöjd', unit: 'mm' },
    { key: 'forkLength', label: 'Gaffellängd', unit: 'mm' },
    { key: 'freeLift', label: 'Frilyft', unit: 'mm' },
  ],
  ledstaplare: [
    { key: 'liftHeight', label: 'Lyfthöjd', unit: 'mm' },
    { key: 'buildHeight', label: 'Bygghöjd', unit: 'mm' },
    { key: 'forkLength', label: 'Gaffellängd', unit: 'mm' },
    { key: 'freeLift', label: 'Frilyft', unit: 'mm' },
  ],
  skjutstativtruck: [
    { key: 'liftHeight', label: 'Lyfthöjd', unit: 'mm' },
    { key: 'buildHeight', label: 'Bygghöjd', unit: 'mm' },
    { key: 'forkLength', label: 'Gaffellängd', unit: 'mm' },
    { key: 'freeLift', label: 'Frilyft', unit: 'mm' },
    { key: 'maxReach', label: 'Max räckvidd', unit: 'mm' },
  ],
  teleskoplastare: [
    { key: 'liftHeight', label: 'Lyfthöjd', unit: 'mm' },
    { key: 'maxReach', label: 'Max räckvidd', unit: 'mm' },
    { key: 'workingWeight', label: 'Tjänstevikt', unit: 'kg' },
    { key: 'enginePower', label: 'Motoreffekt', unit: 'kW' },
  ],
  hjullastare: [
    { key: 'bucketVolume', label: 'Skopvolym', unit: 'liter' },
    { key: 'workingWeight', label: 'Tjänstevikt', unit: 'kg' },
    { key: 'enginePower', label: 'Motoreffekt', unit: 'kW' },
  ],
  gravmaskin: [
    { key: 'digDepth', label: 'Grävdjup', unit: 'mm' },
    { key: 'bucketVolume', label: 'Skopvolym', unit: 'liter' },
    { key: 'workingWeight', label: 'Tjänstevikt', unit: 'kg' },
    { key: 'enginePower', label: 'Motoreffekt', unit: 'kW' },
  ],
  kompaktlastare: [
    { key: 'bucketVolume', label: 'Skopvolym', unit: 'liter' },
    { key: 'workingWeight', label: 'Tjänstevikt', unit: 'kg' },
    { key: 'enginePower', label: 'Motoreffekt', unit: 'kW' },
  ],
  ovrig: [
    { key: 'liftHeight', label: 'Lyfthöjd', unit: 'mm' },
    { key: 'buildHeight', label: 'Bygghöjd', unit: 'mm' },
    { key: 'forkLength', label: 'Gaffellängd', unit: 'mm' },
  ],
};

// Text specs (not numeric) — only relevant for trucktyper
const TEXT_SPEC_FIELDS: Partial<Record<MachineCategory, { key: string; label: string }[]>> = {
  motviktstruck: [
    { key: 'mastType', label: 'Stativ' },
    { key: 'powerUnit', label: 'Aggregat' },
    { key: 'cabin', label: 'Hytt' },
  ],
  ledstaplare: [
    { key: 'mastType', label: 'Stativ' },
    { key: 'powerUnit', label: 'Aggregat' },
    { key: 'cabin', label: 'Hytt' },
  ],
  skjutstativtruck: [
    { key: 'mastType', label: 'Stativ' },
    { key: 'powerUnit', label: 'Aggregat' },
    { key: 'cabin', label: 'Hytt' },
  ],
};

export default function EditMachinePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { machines, updateMachine, organizationId } = useStore();
  const machine = machines.find((m) => m.id === id);
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '', model: '', brand: '', serialNumber: '', registrationNumber: '',
    internalCode: '', category: 'motviktstruck' as MachineCategory,
    capacity: 0, fuelType: 'diesel' as FuelType, year: 2020,
    operatingHours: 0, status: 'i_lager' as MachineStatus, notes: '', location: '',
    purchasePrice: 0, purchaseDate: '', leasingCost: 0, financingCost: 0,
    insuranceCost: 0, serviceCost: 0, otherCosts: 0,
    liftHeight: 0, buildHeight: 0, forkLength: 0, freeLift: 0,
    maxReach: 0, digDepth: 0, bucketVolume: 0, workingWeight: 0, enginePower: 0,
    mastType: '', powerUnit: '', cabin: '',
  });

  useEffect(() => {
    if (machine) {
      setImages(machine.images);
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
        liftHeight: machine.liftHeight ?? 0,
        buildHeight: machine.buildHeight ?? 0,
        forkLength: machine.forkLength ?? 0,
        freeLift: machine.freeLift ?? 0,
        maxReach: machine.maxReach ?? 0,
        digDepth: machine.digDepth ?? 0,
        bucketVolume: machine.bucketVolume ?? 0,
        workingWeight: machine.workingWeight ?? 0,
        enginePower: machine.enginePower ?? 0,
        mastType: machine.mastType ?? '',
        powerUnit: machine.powerUnit ?? '',
        cabin: machine.cabin ?? '',
      });
    }
  }, [machine]);

  if (!machine) return <div className="flex items-center justify-center flex-1 text-slate-400">Maskinen hittades inte</div>;

  const set = (field: string, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMachine(id, {
      ...form,
      liftHeight: form.liftHeight || undefined,
      buildHeight: form.buildHeight || undefined,
      forkLength: form.forkLength || undefined,
      freeLift: form.freeLift || undefined,
      maxReach: form.maxReach || undefined,
      digDepth: form.digDepth || undefined,
      bucketVolume: form.bucketVolume || undefined,
      workingWeight: form.workingWeight || undefined,
      enginePower: form.enginePower || undefined,
      mastType: form.mastType || undefined,
      powerUnit: form.powerUnit || undefined,
      cabin: form.cabin || undefined,
      images,
    });
    router.push(`/machines/${id}`);
  };

  const specFields = SPEC_FIELDS[form.category] ?? [];
  const textSpecFields = TEXT_SPEC_FIELDS[form.category] ?? [];

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
                <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
                  {(['i_lager', 'uthyrd', 'reserverad', 'service', 'skadad', 'utfasad'] as MachineStatus[]).map((s) => (
                    <option key={s} value={s}>{s === 'i_lager' ? 'I lager' : s === 'uthyrd' ? 'Uthyrd' : s === 'reserverad' ? 'Reserverad' : s === 'service' ? 'Service' : s === 'skadad' ? 'Skadad' : 'Utfasad'}</option>
                  ))}
                </select>
              </Field>
              <Field label="Intern kod">
                <input required value={form.internalCode} onChange={(e) => set('internalCode', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Fabrikat">
                <input value={form.brand} onChange={(e) => set('brand', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Modell">
                <input value={form.model} onChange={(e) => set('model', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Kategori">
                <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Drivmedel">
                <select value={form.fuelType} onChange={(e) => set('fuelType', e.target.value)} className={inputCls}>
                  {Object.entries(FUEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Kapacitet (kg)">
                <div className="relative">
                  <input
                    type="number"
                    value={form.capacity || ''}
                    onChange={(e) => set('capacity', e.target.value ? Number(e.target.value) : 0)}
                    className={`${inputCls} pr-10`}
                    placeholder="T.ex. 1500"
                    min={0}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">kg</span>
                </div>
              </Field>
              <Field label="Årsmodell">
                <input type="number" value={form.year} onChange={(e) => set('year', Number(e.target.value))} className={inputCls} />
              </Field>
              <Field label="Serienummer">
                <input value={form.serialNumber} onChange={(e) => set('serialNumber', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Registreringsnummer">
                <input value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Drifttimmar">
                <input type="number" value={form.operatingHours} onChange={(e) => set('operatingHours', Number(e.target.value))} className={inputCls} min={0} />
              </Field>
              <Field label="Placering">
                <input value={form.location} onChange={(e) => set('location', e.target.value)} className={inputCls} />
              </Field>
            </div>

            {specFields.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tekniska specifikationer</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specFields.map(({ key, label, unit }) => (
                    <Field key={key} label={`${label} (${unit})`}>
                      <div className="relative">
                        <input
                          type="number"
                          value={(form[key as keyof typeof form] as number) || ''}
                          onChange={(e) => set(key, e.target.value ? Number(e.target.value) : 0)}
                          className={`${inputCls} pr-14`}
                          placeholder="0 = ej angiven"
                          min={0}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">{unit}</span>
                      </div>
                    </Field>
                  ))}
                </div>
              </div>
            )}

            {textSpecFields.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Övriga specifikationer</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {textSpecFields.map(({ key, label }) => (
                    <Field key={key} label={label}>
                      <input
                        value={(form[key as keyof typeof form] as string) || ''}
                        onChange={(e) => set(key, e.target.value)}
                        className={inputCls}
                        placeholder={`T.ex. ${label}`}
                      />
                    </Field>
                  ))}
                </div>
              </div>
            )}

            <Field label="Anteckningar">
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className={`${inputCls} resize-none mt-4`} rows={3} />
            </Field>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Bilder</h2>
            {organizationId && (
              <PhotoCapture images={images} onChange={setImages} orgId={organizationId} folderId={id} />
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Ekonomi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Inköpspris (kr)">
                <input type="number" value={form.purchasePrice} onChange={(e) => set('purchasePrice', Number(e.target.value))} className={inputCls} min={0} />
              </Field>
              <Field label="Inköpsdatum">
                <input type="date" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Leasingkostnad/mån (kr)">
                <input type="number" value={form.leasingCost} onChange={(e) => set('leasingCost', Number(e.target.value))} className={inputCls} min={0} />
              </Field>
              <Field label="Finansieringskostnad/mån (kr)">
                <input type="number" value={form.financingCost} onChange={(e) => set('financingCost', Number(e.target.value))} className={inputCls} min={0} />
              </Field>
              <Field label="Försäkring/mån (kr)">
                <input type="number" value={form.insuranceCost} onChange={(e) => set('insuranceCost', Number(e.target.value))} className={inputCls} min={0} />
              </Field>
              <Field label="Övriga kostnader/mån (kr)">
                <input type="number" value={form.otherCosts} onChange={(e) => set('otherCosts', Number(e.target.value))} className={inputCls} min={0} />
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
