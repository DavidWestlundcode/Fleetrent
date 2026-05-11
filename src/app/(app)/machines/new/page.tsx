'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Sparkles, Camera, X, Loader2, CheckCircle2, PenLine } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { CATEGORY_LABELS, FUEL_LABELS, type MachineCategory, type FuelType } from '@/lib/types';

type Mode = 'choose' | 'ai' | 'manual';

const emptyForm = {
  name: '', model: '', brand: '', serialNumber: '', registrationNumber: '',
  internalCode: '', category: 'motviktstruck' as MachineCategory,
  capacity: '', fuelType: 'diesel' as FuelType, year: new Date().getFullYear(),
  operatingHours: 0, notes: '', location: '',
  purchasePrice: 0, purchaseDate: '', leasingCost: 0, financingCost: 0,
  insuranceCost: 0, serviceCost: 0, otherCosts: 0,
};

export default function NewMachinePage() {
  const router = useRouter();
  const { addMachine } = useStore();

  const [mode, setMode] = useState<Mode>('choose');
  const [form, setForm] = useState(emptyForm);
  const [aiFields, setAiFields] = useState<Set<string>>(new Set());

  const [nameplateImage, setNameplateImage] = useState<string | null>(null);
  const [machineImage, setMachineImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [aiError, setAiError] = useState('');

  const nameplateRef = useRef<HTMLInputElement>(null);
  const machineRef = useRef<HTMLInputElement>(null);

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

  const handleNameplateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNameplateImage(await readFile(file));
  };

  const handleMachineChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMachineImage(await readFile(file));
  };

  const analyze = async () => {
    if (!nameplateImage && !machineImage) return;
    setAnalyzing(true);
    setAiError('');
    try {
      const res = await fetch('/api/analyze-machine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameplateImage, machineImage }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const filled = new Set<string>();
      const updates: Partial<typeof emptyForm> = {};

      if (data.brand) { updates.brand = data.brand; filled.add('brand'); }
      if (data.model) { updates.model = data.model; filled.add('model'); }
      if (data.name) { updates.name = data.name; filled.add('name'); }
      if (data.serialNumber) { updates.serialNumber = data.serialNumber; filled.add('serialNumber'); }
      if (data.year && data.year > 1990) { updates.year = data.year; filled.add('year'); }
      if (data.capacity) { updates.capacity = data.capacity; filled.add('capacity'); }
      if (data.notes) { updates.notes = data.notes; filled.add('notes'); }
      if (data.category && Object.keys(CATEGORY_LABELS).includes(data.category)) {
        updates.category = data.category as MachineCategory; filled.add('category');
      }
      if (data.fuelType && Object.keys(FUEL_LABELS).includes(data.fuelType)) {
        updates.fuelType = data.fuelType as FuelType; filled.add('fuelType');
      }

      setForm((prev) => ({ ...prev, ...updates }));
      setAiFields(filled);
      setAnalyzed(true);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Analys misslyckades');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addMachine({
      ...form,
      status: 'i_lager',
      images: [], documents: [],
      qrCode: Math.random().toString(36).substring(2, 11),
      totalRevenue: 0, totalRentals: 0, totalRentalDays: 0, totalServiceCost: 0,
    });
    router.push(`/machines/${id}`);
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Lägg till maskin" />
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <Link href="/machines" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Tillbaka
        </Link>

        {/* Mode chooser */}
        {mode === 'choose' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <button
              onClick={() => setMode('ai')}
              className="group flex flex-col items-start gap-4 p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-lg">Analysera med AI</p>
                <p className="text-slate-500 text-sm mt-1">Ta bild på typskylten och/eller maskinen — AI fyller i formuläret åt dig.</p>
              </div>
            </button>

            <button
              onClick={() => setMode('manual')}
              className="group flex flex-col items-start gap-4 p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-slate-400 hover:shadow-md transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
                <PenLine className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-lg">Manuell inmatning</p>
                <p className="text-slate-500 text-sm mt-1">Fyll i maskinkortet manuellt fält för fält.</p>
              </div>
            </button>
          </div>
        )}

        {/* AI photo step */}
        {mode === 'ai' && !analyzed && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-900">Fotografera maskinen</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">Ladda upp minst en bild. Typskylten ger bäst resultat för tekniska data.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PhotoUpload
                  label="Typskylt"
                  hint="Fabrikat, modell, serienummer, årsmodell"
                  image={nameplateImage}
                  inputRef={nameplateRef}
                  onChange={handleNameplateChange}
                  onClear={() => setNameplateImage(null)}
                />
                <PhotoUpload
                  label="Maskinbild"
                  hint="Hjälper AI att identifiera maskintyp"
                  image={machineImage}
                  inputRef={machineRef}
                  onChange={handleMachineChange}
                  onClear={() => setMachineImage(null)}
                />
              </div>

              {aiError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{aiError}</div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setMode('choose')} className="text-sm text-slate-500 hover:text-slate-700">
                ← Tillbaka
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('manual')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Fyll i manuellt istället
                </button>
                <button
                  onClick={analyze}
                  disabled={(!nameplateImage && !machineImage) || analyzing}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {analyzing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyserar...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Analysera</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form (manual or after AI) */}
        {(mode === 'manual' || analyzed) && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {analyzed && (
              <div className="flex items-center gap-2.5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">AI-analys klar</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {aiFields.size} fält fylldes i automatiskt. Granska och komplettera nedan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setAnalyzed(false); setMode('ai'); }}
                  className="ml-auto text-xs text-emerald-700 underline hover:no-underline"
                >
                  Analysera om
                </button>
              </div>
            )}

            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Grundinformation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Maskinnamn *" ai={aiFields.has('name')}>
                  <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass(aiFields.has('name'))} placeholder="T.ex. Motviktstruck 1.5T" />
                </Field>
                <Field label="Intern kod *">
                  <input required value={form.internalCode} onChange={(e) => set('internalCode', e.target.value)} className={inputClass(false)} placeholder="T.ex. MT-001" />
                </Field>
                <Field label="Fabrikat *" ai={aiFields.has('brand')}>
                  <input required value={form.brand} onChange={(e) => set('brand', e.target.value)} className={inputClass(aiFields.has('brand'))} placeholder="T.ex. Toyota" />
                </Field>
                <Field label="Modell *" ai={aiFields.has('model')}>
                  <input required value={form.model} onChange={(e) => set('model', e.target.value)} className={inputClass(aiFields.has('model'))} placeholder="T.ex. 8FGF25" />
                </Field>
                <Field label="Kategori" ai={aiFields.has('category')}>
                  <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass(aiFields.has('category'))}>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Drivmedel" ai={aiFields.has('fuelType')}>
                  <select value={form.fuelType} onChange={(e) => set('fuelType', e.target.value)} className={inputClass(aiFields.has('fuelType'))}>
                    {Object.entries(FUEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Kapacitet" ai={aiFields.has('capacity')}>
                  <input value={form.capacity} onChange={(e) => set('capacity', e.target.value)} className={inputClass(aiFields.has('capacity'))} placeholder="T.ex. 1,5 ton" />
                </Field>
                <Field label="Årsmodell" ai={aiFields.has('year')}>
                  <input type="number" value={form.year} onChange={(e) => set('year', Number(e.target.value))} className={inputClass(aiFields.has('year'))} min={1990} max={2030} />
                </Field>
                <Field label="Serienummer" ai={aiFields.has('serialNumber')}>
                  <input value={form.serialNumber} onChange={(e) => set('serialNumber', e.target.value)} className={inputClass(aiFields.has('serialNumber'))} />
                </Field>
                <Field label="Registreringsnummer">
                  <input value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} className={inputClass(false)} />
                </Field>
                <Field label="Drifttimmar">
                  <input type="number" value={form.operatingHours} onChange={(e) => set('operatingHours', Number(e.target.value))} className={inputClass(false)} min={0} />
                </Field>
                <Field label="Placering/lagerplats">
                  <input value={form.location} onChange={(e) => set('location', e.target.value)} className={inputClass(false)} placeholder="T.ex. Lager A - Plats 3" />
                </Field>
              </div>
              <Field label="Anteckningar" ai={aiFields.has('notes')} className="mt-4">
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className={`${inputClass(aiFields.has('notes'))} resize-none`} rows={3} />
              </Field>
            </div>

            {/* Financial */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Ekonomi och kostnader</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Inköpspris (kr)">
                  <input type="number" value={form.purchasePrice} onChange={(e) => set('purchasePrice', Number(e.target.value))} className={inputClass(false)} min={0} />
                </Field>
                <Field label="Inköpsdatum">
                  <input type="date" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} className={inputClass(false)} />
                </Field>
                <Field label="Leasingkostnad/mån (kr)">
                  <input type="number" value={form.leasingCost} onChange={(e) => set('leasingCost', Number(e.target.value))} className={inputClass(false)} min={0} />
                </Field>
                <Field label="Finansieringskostnad/mån (kr)">
                  <input type="number" value={form.financingCost} onChange={(e) => set('financingCost', Number(e.target.value))} className={inputClass(false)} min={0} />
                </Field>
                <Field label="Försäkring/mån (kr)">
                  <input type="number" value={form.insuranceCost} onChange={(e) => set('insuranceCost', Number(e.target.value))} className={inputClass(false)} min={0} />
                </Field>
                <Field label="Servicekostnad/år (kr)">
                  <input type="number" value={form.serviceCost} onChange={(e) => set('serviceCost', Number(e.target.value))} className={inputClass(false)} min={0} />
                </Field>
                <Field label="Övriga kostnader/mån (kr)">
                  <input type="number" value={form.otherCosts} onChange={(e) => set('otherCosts', Number(e.target.value))} className={inputClass(false)} min={0} />
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode('choose')}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                ← Tillbaka
              </button>
              <div className="flex items-center gap-3">
                <Link href="/machines" className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                  Avbryt
                </Link>
                <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  <Save className="w-4 h-4" />
                  Spara maskin
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PhotoUpload({
  label, hint, image, inputRef, onChange, onClear,
}: {
  label: string;
  hint: string;
  image: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-1">{label}</p>
      <p className="text-xs text-slate-400 mb-2">{hint}</p>
      {image ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white"
          >
            <X className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-video border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
        >
          <Camera className="w-8 h-8 text-slate-300" />
          <span className="text-sm text-slate-400">Klicka för att välja bild</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}

const inputClass = (isAi: boolean) =>
  `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
    isAi
      ? 'bg-blue-50 border-blue-200 focus:bg-white'
      : 'bg-slate-50 border-slate-200 focus:bg-white'
  }`;

function Field({
  label, children, ai, className,
}: {
  label: string;
  children: React.ReactNode;
  ai?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="block text-xs font-medium text-slate-600">{label}</label>
        {ai && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-medium rounded-full">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
