'use client';
import { useState, useRef } from 'react';
import { Plus, Tag, Edit, Trash2, Shield, Truck, Clock, CalendarDays, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency, getMatchingTemplate } from '@/lib/utils';
import { CATEGORY_LABELS, ARTICLE_TYPE_LABELS, type MachineCategory } from '@/lib/types';

const inputClass = 'w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all';

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function PriceField({
  label, priceValue, discountValue, onPriceChange, onDiscountChange, placeholder,
}: {
  label: string;
  priceValue: number;
  discountValue: number;
  onPriceChange: (v: number) => void;
  onDiscountChange: (v: number) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <div className="flex gap-1.5">
        <div className="flex-1 relative">
          <input
            type="number" min={0}
            value={placeholder !== undefined ? (priceValue || '') : priceValue}
            onChange={(e) => onPriceChange(e.target.value ? Number(e.target.value) : 0)}
            className={`${inputClass} pr-7`}
            placeholder={placeholder ?? '0'}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">kr</span>
        </div>
        <div className="w-[68px] relative">
          <input
            type="number" min={0} max={100} step={0.1}
            value={discountValue || ''}
            onChange={(e) => onDiscountChange(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
            className={`${inputClass} pr-6`}
            placeholder="0"
            title="Rabatt %"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">%</span>
        </div>
      </div>
    </div>
  );
}

const emptyForm = {
  name: '', description: '', category: 'motviktstruck' as MachineCategory,
  capacityMin: 0, capacityMax: 0,
  dailyPrice: 0, dailyPriceDiscount: 0,
  weeklyPrice: 0, weeklyPriceDiscount: 0,
  monthlyPrice: 0, monthlyPriceDiscount: 0,
  longTermDailyPrice: 0, longTermDailyDiscount: 0,
  longTermWeeklyPrice: 0, longTermWeeklyDiscount: 0,
  longTermMonthlyPrice: 0, longTermMonthlyDiscount: 0,
  insuranceDailyPrice: 0, insuranceDailyDiscount: 0,
  insuranceWeeklyPrice: 0, insuranceWeeklyDiscount: 0,
  insuranceMonthlyPrice: 0, insuranceMonthlyDiscount: 0,
  startFee: 0, startFeeDiscount: 0,
  transportCost: 0, transportDiscount: 0,
  deposit: 0, minRentalDays: 1,
  standardTerms: '', internalNote: '',
  rentalArticleId: '', insuranceArticleId: '', transportArticleId: '', depositArticleId: '',
};

export default function TemplatesPage() {
  const { templates, machines, customers, articles, addTemplate, updateTemplate, deleteTemplate } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  const editIdRef = useRef<string | null>(null);
  const formRef = useRef(emptyForm);

  const set = (field: string, value: string | number) => {
    const next = { ...formRef.current, [field]: value };
    formRef.current = next;
    setForm(next);
  };

  const openEdit = (id: string) => {
    const t = templates.find((t) => t.id === id);
    if (!t) return;
    const next = {
      name: t.name, description: t.description, category: t.category,
      capacityMin: t.capacityMin, capacityMax: t.capacityMax,
      dailyPrice: t.dailyPrice, dailyPriceDiscount: t.dailyPriceDiscount ?? 0,
      weeklyPrice: t.weeklyPrice, weeklyPriceDiscount: t.weeklyPriceDiscount ?? 0,
      monthlyPrice: t.monthlyPrice, monthlyPriceDiscount: t.monthlyPriceDiscount ?? 0,
      longTermDailyPrice: t.longTermDailyPrice ?? 0, longTermDailyDiscount: t.longTermDailyDiscount ?? 0,
      longTermWeeklyPrice: t.longTermWeeklyPrice ?? 0, longTermWeeklyDiscount: t.longTermWeeklyDiscount ?? 0,
      longTermMonthlyPrice: t.longTermMonthlyPrice ?? 0, longTermMonthlyDiscount: t.longTermMonthlyDiscount ?? 0,
      insuranceDailyPrice: t.insuranceDailyPrice, insuranceDailyDiscount: t.insuranceDailyDiscount ?? 0,
      insuranceWeeklyPrice: t.insuranceWeeklyPrice, insuranceWeeklyDiscount: t.insuranceWeeklyDiscount ?? 0,
      insuranceMonthlyPrice: t.insuranceMonthlyPrice, insuranceMonthlyDiscount: t.insuranceMonthlyDiscount ?? 0,
      startFee: t.startFee, startFeeDiscount: t.startFeeDiscount ?? 0,
      transportCost: t.transportCost, transportDiscount: t.transportDiscount ?? 0,
      deposit: t.deposit, minRentalDays: t.minRentalDays,
      standardTerms: t.standardTerms, internalNote: t.internalNote,
      rentalArticleId: t.rentalArticleId ?? '', insuranceArticleId: t.insuranceArticleId ?? '',
      transportArticleId: t.transportArticleId ?? '', depositArticleId: t.depositArticleId ?? '',
    };
    formRef.current = next;
    editIdRef.current = id;
    setForm(next);
    setEditId(id);
    setSelectedCustomerIds(t.customerIds ?? []);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentId = editIdRef.current;
    const currentForm = { ...formRef.current, customerIds: selectedCustomerIds };
    if (currentId) {
      updateTemplate(currentId, currentForm);
    } else {
      addTemplate(currentForm);
    }
    editIdRef.current = null;
    formRef.current = emptyForm;
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    setSelectedCustomerIds([]);
  };

  const toggleCustomer = (id: string) =>
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const resetForm = () => {
    editIdRef.current = null;
    formRef.current = emptyForm;
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    setSelectedCustomerIds([]);
  };

  const getMatchCount = (templateId: string) => {
    const t = templates.find((t) => t.id === templateId);
    if (!t) return 0;
    return machines.filter((m) => getMatchingTemplate(m, [t]) !== undefined).length;
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-50/60">
      <Header
        title="Prismallar"
        subtitle="Mallar matchas automatiskt till maskiner baserat på typ och kapacitet"
        actions={
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-1.5 px-3.5 py-[7px] bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Ny prismall
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-5">
        {showForm && (
          <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-5">{editId ? 'Redigera prismall' : 'Ny prismall'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Basic info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Mallnamn *">
                  <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} placeholder="T.ex. Motviktstruck 1–1,9 ton" />
                </Field>
                <Field label="Maskintyp">
                  <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Beskrivning">
                    <input value={form.description} onChange={(e) => set('description', e.target.value)} className={inputClass} placeholder="Valfri beskrivning" />
                  </Field>
                </div>
              </div>

              {/* Capacity range */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Kapacitetsintervall</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Min kapacitet (kg)" hint="Ange 0 för ingen undre gräns">
                    <div className="relative">
                      <input type="number" step="1" min="0" value={form.capacityMin || ''} onChange={(e) => set('capacityMin', e.target.value ? Number(e.target.value) : 0)} className={inputClass} placeholder="0" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">kg</span>
                    </div>
                  </Field>
                  <Field label="Max kapacitet (kg)" hint="Ange 0 för ingen övre gräns">
                    <div className="relative">
                      <input type="number" step="1" min="0" value={form.capacityMax || ''} onChange={(e) => set('capacityMax', e.target.value ? Number(e.target.value) : 0)} className={inputClass} placeholder="0" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">kg</span>
                    </div>
                  </Field>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 bg-slate-50 px-3 py-2 rounded-lg">
                  Mallen tillämpas automatiskt på maskiner av typen <strong>{CATEGORY_LABELS[form.category]}</strong>
                  {form.capacityMin > 0 || form.capacityMax > 0 ? ` med kapacitet ${form.capacityMin > 0 ? `från ${form.capacityMin.toLocaleString('sv-SE')} kg` : ''}${form.capacityMin > 0 && form.capacityMax > 0 ? ' till ' : ''}${form.capacityMax > 0 ? `${form.capacityMax.toLocaleString('sv-SE')} kg` : ''}` : ' (alla kapaciteter)'}
                  .
                </p>
              </div>

              {/* Short-term prices */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Korttidspriser</p>
                  </div>
                  <p className="text-[10px] text-slate-400">Pris (kr) + Rabatt (%)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PriceField
                    label="Dagspris"
                    priceValue={form.dailyPrice} discountValue={form.dailyPriceDiscount}
                    onPriceChange={(v) => set('dailyPrice', v)} onDiscountChange={(v) => set('dailyPriceDiscount', v)}
                  />
                  <PriceField
                    label="Veckopris"
                    priceValue={form.weeklyPrice} discountValue={form.weeklyPriceDiscount}
                    onPriceChange={(v) => set('weeklyPrice', v)} onDiscountChange={(v) => set('weeklyPriceDiscount', v)}
                  />
                  <PriceField
                    label="Månadspris"
                    priceValue={form.monthlyPrice} discountValue={form.monthlyPriceDiscount}
                    onPriceChange={(v) => set('monthlyPrice', v)} onDiscountChange={(v) => set('monthlyPriceDiscount', v)}
                  />
                </div>
              </div>

              {/* Long-term prices */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                    <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Långtidspriser</p>
                    <span className="text-[10px] text-blue-400 ml-1">— lämna tomt om ej aktuellt</span>
                  </div>
                  <p className="text-[10px] text-blue-400">Pris (kr) + Rabatt (%)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PriceField
                    label="Dagspris lång" placeholder="0"
                    priceValue={form.longTermDailyPrice} discountValue={form.longTermDailyDiscount}
                    onPriceChange={(v) => set('longTermDailyPrice', v)} onDiscountChange={(v) => set('longTermDailyDiscount', v)}
                  />
                  <PriceField
                    label="Veckopris lång" placeholder="0"
                    priceValue={form.longTermWeeklyPrice} discountValue={form.longTermWeeklyDiscount}
                    onPriceChange={(v) => set('longTermWeeklyPrice', v)} onDiscountChange={(v) => set('longTermWeeklyDiscount', v)}
                  />
                  <PriceField
                    label="Månadspris lång" placeholder="0"
                    priceValue={form.longTermMonthlyPrice} discountValue={form.longTermMonthlyDiscount}
                    onPriceChange={(v) => set('longTermMonthlyPrice', v)} onDiscountChange={(v) => set('longTermMonthlyDiscount', v)}
                  />
                </div>
              </div>

              {/* Insurance prices */}
              <div className="p-4 bg-violet-50/40 rounded-xl border border-violet-100">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-violet-500" />
                    <p className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider">Försäkringspriser (tillval)</p>
                  </div>
                  <p className="text-[10px] text-violet-400">Pris (kr) + Rabatt (%)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PriceField
                    label="Försäkring dag"
                    priceValue={form.insuranceDailyPrice} discountValue={form.insuranceDailyDiscount}
                    onPriceChange={(v) => set('insuranceDailyPrice', v)} onDiscountChange={(v) => set('insuranceDailyDiscount', v)}
                  />
                  <PriceField
                    label="Försäkring vecka"
                    priceValue={form.insuranceWeeklyPrice} discountValue={form.insuranceWeeklyDiscount}
                    onPriceChange={(v) => set('insuranceWeeklyPrice', v)} onDiscountChange={(v) => set('insuranceWeeklyDiscount', v)}
                  />
                  <PriceField
                    label="Försäkring månad"
                    priceValue={form.insuranceMonthlyPrice} discountValue={form.insuranceMonthlyDiscount}
                    onPriceChange={(v) => set('insuranceMonthlyPrice', v)} onDiscountChange={(v) => set('insuranceMonthlyDiscount', v)}
                  />
                </div>
              </div>

              {/* Extra fees */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Övriga avgifter</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <PriceField
                    label="Startavgift"
                    priceValue={form.startFee} discountValue={form.startFeeDiscount}
                    onPriceChange={(v) => set('startFee', v)} onDiscountChange={(v) => set('startFeeDiscount', v)}
                  />
                  <PriceField
                    label="Transport"
                    priceValue={form.transportCost} discountValue={form.transportDiscount}
                    onPriceChange={(v) => set('transportCost', v)} onDiscountChange={(v) => set('transportDiscount', v)}
                  />
                  <Field label="Deposition (kr)">
                    <input type="number" value={form.deposit} onChange={(e) => set('deposit', Number(e.target.value))} className={inputClass} min={0} />
                  </Field>
                  <Field label="Min. hyresperiod (dagar)">
                    <input type="number" value={form.minRentalDays} onChange={(e) => set('minRentalDays', Number(e.target.value))} className={inputClass} min={1} />
                  </Field>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Standardvillkor">
                  <textarea value={form.standardTerms} onChange={(e) => set('standardTerms', e.target.value)} className={`${inputClass} resize-none`} rows={3} />
                </Field>
                <Field label="Intern anteckning">
                  <textarea value={form.internalNote} onChange={(e) => set('internalNote', e.target.value)} className={`${inputClass} resize-none`} rows={3} />
                </Field>
              </div>

              {/* Article links */}
              {articles.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Artikelkopplingar (Fortnox m.fl.)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {([
                      { field: 'rentalArticleId', label: 'Artikel – Hyra', types: ['hyra', 'övrigt'] },
                      { field: 'insuranceArticleId', label: 'Artikel – Försäkring', types: ['försäkring', 'övrigt'] },
                      { field: 'transportArticleId', label: 'Artikel – Transport', types: ['transport', 'övrigt'] },
                      { field: 'depositArticleId', label: 'Artikel – Deposition', types: ['deposition', 'övrigt'] },
                    ] as const).map(({ field, label, types }) => (
                      <Field key={field} label={label}>
                        <select
                          value={(form as unknown as Record<string, string>)[field]}
                          onChange={(e) => set(field, e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Ingen artikel kopplad</option>
                          {articles
                            .filter((a) => a.isActive && (types as readonly string[]).includes(a.type))
                            .map((a) => (
                              <option key={a.id} value={a.id}>
                                #{a.articleNumber} – {a.name}
                              </option>
                            ))}
                          {articles.filter((a) => a.isActive && !(types as readonly string[]).includes(a.type)).length > 0 && (
                            <>
                              <option disabled>──────────</option>
                              {articles
                                .filter((a) => a.isActive && !(types as readonly string[]).includes(a.type))
                                .map((a) => (
                                  <option key={a.id} value={a.id}>
                                    #{a.articleNumber} – {a.name} ({ARTICLE_TYPE_LABELS[a.type]})
                                  </option>
                                ))}
                            </>
                          )}
                        </select>
                      </Field>
                    ))}
                  </div>
                </div>
              )}

              {/* Kopplade kunder */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kopplade kunder</p>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  {selectedCustomerIds.length === 0
                    ? 'Inga kunder valda — mallen är tillgänglig för alla kunder.'
                    : `${selectedCustomerIds.length} kund${selectedCustomerIds.length > 1 ? 'er' : ''} vald${selectedCustomerIds.length > 1 ? 'a' : ''} — mallen visas bara för dessa.`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {customers.filter((c) => c.isActive !== false).sort((a, b) => a.companyName.localeCompare(b.companyName)).map((c) => (
                    <label key={c.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                      selectedCustomerIds.includes(c.id)
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 accent-blue-600"
                        checked={selectedCustomerIds.includes(c.id)}
                        onChange={() => toggleCustomer(c.id)}
                      />
                      <span className="text-[12.5px] font-medium truncate">{c.companyName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Avbryt</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-xl hover:bg-blue-700 transition-colors">
                  {editId ? 'Spara ändringar' : 'Skapa mall'}
                </button>
              </div>
            </form>
          </div>
        )}

        {templates.length === 0 && !showForm && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm py-16 text-center">
            <Tag className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-[13px] text-slate-400">Inga prismallar skapade ännu</p>
            <p className="text-[11px] text-slate-300 mt-1">Klicka på "Ny prismall" för att komma igång</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((template) => {
            const matchCount = getMatchCount(template.id);
            const hasInsurance = template.insuranceDailyPrice > 0 || template.insuranceWeeklyPrice > 0 || template.insuranceMonthlyPrice > 0;
            const hasLongTerm = (template.longTermDailyPrice ?? 0) > 0 || (template.longTermWeeklyPrice ?? 0) > 0 || (template.longTermMonthlyPrice ?? 0) > 0;

            const priceWithDiscount = (price: number, discount?: number) => {
              if (!discount || discount <= 0) return formatCurrency(price);
              return (
                <span className="flex items-center gap-1">
                  {formatCurrency(price)}
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">-{discount}%</span>
                </span>
              );
            };

            return (
              <div key={template.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
                <div className="flex items-start justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 rounded-xl">
                      <Tag className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold text-slate-800">{template.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{CATEGORY_LABELS[template.category]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(template.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if (confirm('Radera mall?')) deleteTemplate(template.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Capacity badge */}
                <div className="flex items-center gap-1.5 mb-3.5 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">
                    <Truck className="w-3 h-3 text-slate-500" />
                    <span className="text-[11px] font-medium text-slate-600">
                      {template.capacityMin === 0 && template.capacityMax === 0
                        ? 'Alla kapaciteter'
                        : template.capacityMin === 0
                        ? `Max ${template.capacityMax.toLocaleString('sv-SE')} kg`
                        : template.capacityMax === 0
                        ? `Min ${template.capacityMin.toLocaleString('sv-SE')} kg`
                        : `${template.capacityMin.toLocaleString('sv-SE')}–${template.capacityMax.toLocaleString('sv-SE')} kg`}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium ${matchCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {matchCount} maskin{matchCount !== 1 ? 'er' : ''}
                  </div>
                  {hasLongTerm && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-violet-50 rounded-lg">
                      <CalendarDays className="w-3 h-3 text-violet-500" />
                      <span className="text-[11px] font-medium text-violet-600">Långtid</span>
                    </div>
                  )}
                  {hasInsurance && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
                      <Shield className="w-3 h-3 text-blue-500" />
                      <span className="text-[11px] font-medium text-blue-600">Försäkring</span>
                    </div>
                  )}
                  {(template.customerIds?.length ?? 0) > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg">
                      <Users className="w-3 h-3 text-amber-500" />
                      <span className="text-[11px] font-medium text-amber-600">
                        {template.customerIds.length} kund{template.customerIds.length > 1 ? 'er' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {template.description && (
                  <p className="text-[11px] text-slate-500 mb-3">{template.description}</p>
                )}

                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pt-0.5">Korttid</p>
                  {[
                    { label: 'Dagspris', value: priceWithDiscount(template.dailyPrice, template.dailyPriceDiscount), suffix: '/dag' },
                    { label: 'Veckopris', value: priceWithDiscount(template.weeklyPrice, template.weeklyPriceDiscount), suffix: '/vecka' },
                    { label: 'Månadspris', value: priceWithDiscount(template.monthlyPrice, template.monthlyPriceDiscount), suffix: '/mån' },
                  ].map(({ label, value, suffix }) => (
                    <div key={label} className="flex justify-between items-center text-[12px]">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-medium text-slate-700 flex items-center gap-1">{value}<span className="text-slate-400 font-normal">{suffix}</span></span>
                    </div>
                  ))}
                  {hasLongTerm && (
                    <>
                      <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider pt-1.5">Långtid</p>
                      {[
                        { label: 'Dagspris', value: priceWithDiscount(template.longTermDailyPrice ?? 0, template.longTermDailyDiscount), suffix: '/dag' },
                        { label: 'Veckopris', value: priceWithDiscount(template.longTermWeeklyPrice ?? 0, template.longTermWeeklyDiscount), suffix: '/vecka' },
                        { label: 'Månadspris', value: priceWithDiscount(template.longTermMonthlyPrice ?? 0, template.longTermMonthlyDiscount), suffix: '/mån' },
                      ].map(({ label, value, suffix }) => (
                        <div key={`lt-${label}`} className="flex justify-between items-center text-[12px]">
                          <span className="text-violet-400">{label}</span>
                          <span className="font-medium text-violet-700 flex items-center gap-1">{value}<span className="text-violet-400 font-normal">{suffix}</span></span>
                        </div>
                      ))}
                    </>
                  )}
                  {[
                    ...(hasInsurance ? [{
                      label: 'Försäkring/dag',
                      value: priceWithDiscount(template.insuranceDailyPrice, template.insuranceDailyDiscount),
                      suffix: '/dag',
                    }] : []),
                    { label: 'Transport', value: priceWithDiscount(template.transportCost, template.transportDiscount), suffix: '' },
                    { label: 'Deposition', value: formatCurrency(template.deposit), suffix: '' },
                    { label: 'Min. period', value: `${template.minRentalDays} dag${template.minRentalDays !== 1 ? 'ar' : ''}`, suffix: '' },
                  ].map(({ label, value, suffix }) => (
                    <div key={label} className="flex justify-between items-center text-[12px] pt-0.5">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-medium text-slate-700 flex items-center gap-1">{value}{suffix && <span className="text-slate-400 font-normal">{suffix}</span>}</span>
                    </div>
                  ))}
                </div>

                {template.internalNote && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400 italic">{template.internalNote}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
