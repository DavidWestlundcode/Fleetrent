'use client';
import { useState, useRef } from 'react';
import { Plus, Tag, Edit, Trash2, Shield, Truck, Clock, CalendarDays } from 'lucide-react';
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

const emptyForm = {
  name: '', description: '', category: 'motviktstruck' as MachineCategory,
  capacityMin: 0, capacityMax: 0,
  dailyPrice: 0, weeklyPrice: 0, monthlyPrice: 0,
  longTermDailyPrice: 0, longTermWeeklyPrice: 0, longTermMonthlyPrice: 0,
  insuranceDailyPrice: 0, insuranceWeeklyPrice: 0, insuranceMonthlyPrice: 0,
  startFee: 0, transportCost: 0, deposit: 0, minRentalDays: 1,
  standardTerms: '', internalNote: '',
  rentalArticleId: '', insuranceArticleId: '', transportArticleId: '', depositArticleId: '',
};

export default function TemplatesPage() {
  const { templates, machines, articles, addTemplate, updateTemplate, deleteTemplate } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Refs ensure handleSubmit always reads the latest values regardless of render timing
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
      dailyPrice: t.dailyPrice, weeklyPrice: t.weeklyPrice, monthlyPrice: t.monthlyPrice,
      longTermDailyPrice: t.longTermDailyPrice ?? 0, longTermWeeklyPrice: t.longTermWeeklyPrice ?? 0, longTermMonthlyPrice: t.longTermMonthlyPrice ?? 0,
      insuranceDailyPrice: t.insuranceDailyPrice, insuranceWeeklyPrice: t.insuranceWeeklyPrice, insuranceMonthlyPrice: t.insuranceMonthlyPrice,
      startFee: t.startFee, transportCost: t.transportCost, deposit: t.deposit,
      minRentalDays: t.minRentalDays, standardTerms: t.standardTerms, internalNote: t.internalNote,
      rentalArticleId: t.rentalArticleId ?? '', insuranceArticleId: t.insuranceArticleId ?? '',
      transportArticleId: t.transportArticleId ?? '', depositArticleId: t.depositArticleId ?? '',
    };
    formRef.current = next;
    editIdRef.current = id;
    setForm(next);
    setEditId(id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentId = editIdRef.current;
    const currentForm = formRef.current;
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
            onClick={() => { editIdRef.current = null; formRef.current = emptyForm; setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
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
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Korttidspriser</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Dagspris (kr)">
                    <input type="number" value={form.dailyPrice} onChange={(e) => set('dailyPrice', Number(e.target.value))} className={inputClass} min={0} />
                  </Field>
                  <Field label="Veckopris (kr)">
                    <input type="number" value={form.weeklyPrice} onChange={(e) => set('weeklyPrice', Number(e.target.value))} className={inputClass} min={0} />
                  </Field>
                  <Field label="Månadspris (kr)">
                    <input type="number" value={form.monthlyPrice} onChange={(e) => set('monthlyPrice', Number(e.target.value))} className={inputClass} min={0} />
                  </Field>
                </div>
              </div>

              {/* Long-term prices */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">Långtidspriser</p>
                  <span className="text-[10px] text-blue-400 ml-1">— lämna tomt om ej aktuellt</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Dagspris lång (kr)">
                    <input type="number" value={form.longTermDailyPrice || ''} onChange={(e) => set('longTermDailyPrice', e.target.value ? Number(e.target.value) : 0)} className={inputClass} min={0} placeholder="0" />
                  </Field>
                  <Field label="Veckopris lång (kr)">
                    <input type="number" value={form.longTermWeeklyPrice || ''} onChange={(e) => set('longTermWeeklyPrice', e.target.value ? Number(e.target.value) : 0)} className={inputClass} min={0} placeholder="0" />
                  </Field>
                  <Field label="Månadspris lång (kr)">
                    <input type="number" value={form.longTermMonthlyPrice || ''} onChange={(e) => set('longTermMonthlyPrice', e.target.value ? Number(e.target.value) : 0)} className={inputClass} min={0} placeholder="0" />
                  </Field>
                </div>
              </div>

              {/* Insurance prices */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Försäkringspriser (tillval)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Försäkring dag (kr)">
                    <input type="number" value={form.insuranceDailyPrice} onChange={(e) => set('insuranceDailyPrice', Number(e.target.value))} className={inputClass} min={0} />
                  </Field>
                  <Field label="Försäkring vecka (kr)">
                    <input type="number" value={form.insuranceWeeklyPrice} onChange={(e) => set('insuranceWeeklyPrice', Number(e.target.value))} className={inputClass} min={0} />
                  </Field>
                  <Field label="Försäkring månad (kr)">
                    <input type="number" value={form.insuranceMonthlyPrice} onChange={(e) => set('insuranceMonthlyPrice', Number(e.target.value))} className={inputClass} min={0} />
                  </Field>
                </div>
              </div>

              {/* Extra fees */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Övriga avgifter</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Field label="Startavgift (kr)">
                    <input type="number" value={form.startFee} onChange={(e) => set('startFee', Number(e.target.value))} className={inputClass} min={0} />
                  </Field>
                  <Field label="Transport (kr)">
                    <input type="number" value={form.transportCost} onChange={(e) => set('transportCost', Number(e.target.value))} className={inputClass} min={0} />
                  </Field>
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

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => { editIdRef.current = null; formRef.current = emptyForm; setShowForm(false); setEditId(null); setForm(emptyForm); }} className="px-4 py-2 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Avbryt</button>
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
                <div className="flex items-center gap-1.5 mb-3.5">
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
                </div>

                {template.description && (
                  <p className="text-[11px] text-slate-500 mb-3">{template.description}</p>
                )}

                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pt-0.5">Korttid</p>
                  {[
                    { label: 'Dagspris', value: `${formatCurrency(template.dailyPrice)}/dag` },
                    { label: 'Veckopris', value: `${formatCurrency(template.weeklyPrice)}/vecka` },
                    { label: 'Månadspris', value: `${formatCurrency(template.monthlyPrice)}/mån` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-[12px]">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-medium text-slate-700">{value}</span>
                    </div>
                  ))}
                  {hasLongTerm && (
                    <>
                      <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider pt-1.5">Långtid</p>
                      {[
                        { label: 'Dagspris', value: `${formatCurrency(template.longTermDailyPrice ?? 0)}/dag` },
                        { label: 'Veckopris', value: `${formatCurrency(template.longTermWeeklyPrice ?? 0)}/vecka` },
                        { label: 'Månadspris', value: `${formatCurrency(template.longTermMonthlyPrice ?? 0)}/mån` },
                      ].map(({ label, value }) => (
                        <div key={`lt-${label}`} className="flex justify-between text-[12px]">
                          <span className="text-violet-400">{label}</span>
                          <span className="font-medium text-violet-700">{value}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {[
                    ...(hasInsurance ? [{ label: 'Försäkring/dag', value: `${formatCurrency(template.insuranceDailyPrice)}/dag` }] : []),
                    { label: 'Transport', value: formatCurrency(template.transportCost) },
                    { label: 'Deposition', value: formatCurrency(template.deposit) },
                    { label: 'Min. period', value: `${template.minRentalDays} dag${template.minRentalDays !== 1 ? 'ar' : ''}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-[12px] pt-0.5">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-medium text-slate-700">{value}</span>
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
