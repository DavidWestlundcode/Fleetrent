'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Calculator, Shield, Sparkles, Clock, CalendarDays, Infinity, Plus, Trash2 } from 'lucide-react';
import type { OrderArticle } from '@/lib/types';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency, daysBetween, getMatchingTemplate, calcBreakdown } from '@/lib/utils';
import { MachineStatusBadge } from '@/components/ui/StatusBadge';

const inputClass = 'w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all';

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { machines, customers, templates, articles, addOrder } = useStore();

  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    machineId: '',
    customerId: searchParams.get('customer') ?? '',
    templateId: '',
    startDate: today,
    plannedReturnDate: nextMonth,
    dailyPrice: 0,
    weeklyPrice: 0,
    monthlyPrice: 0,
    transportCost: 0,
    deposit: 0,
    orderReference: '',
    internalNotes: '',
    customerNotes: '',
    accessories: '',
    rentalArticleId: '',
    insuranceArticleId: '',
    transportArticleId: '',
    depositArticleId: '',
  });
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [rentalType, setRentalType] = useState<'short' | 'long'>('short');
  const [autoMatchedTemplate, setAutoMatchedTemplate] = useState<string | null>(null);
  const [openEnded, setOpenEnded] = useState(false);
  const [orderArticles, setOrderArticles] = useState<OrderArticle[]>([]);
  const [newArticleId, setNewArticleId] = useState('');
  const [newArticleQty, setNewArticleQty] = useState(1);
  const [newArticlePrice, setNewArticlePrice] = useState(0);

  const set = (field: string, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  const machineMatchesTemplate = (machineId: string, template: typeof templates[number]) => {
    const m = machines.find((x) => x.id === machineId);
    if (!m) return true;
    if (template.category !== m.category) return false;
    const minOk = template.capacityMin === 0 || m.capacity >= template.capacityMin;
    const maxOk = template.capacityMax === 0 || m.capacity <= template.capacityMax;
    return minOk && maxOk;
  };

  const applyTemplate = (templateId: string, type?: 'short' | 'long') => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    const effectiveType = type ?? rentalType;
    const isLong = effectiveType === 'long';
    if (type) setRentalType(type);
    setForm((p) => ({
      ...p,
      templateId,
      machineId: p.machineId && !machineMatchesTemplate(p.machineId, template) ? '' : p.machineId,
      dailyPrice: isLong ? (template.longTermDailyPrice ?? 0) : template.dailyPrice,
      weeklyPrice: isLong ? (template.longTermWeeklyPrice ?? 0) : template.weeklyPrice,
      monthlyPrice: isLong ? (template.longTermMonthlyPrice ?? 0) : template.monthlyPrice,
      transportCost: template.transportCost,
      deposit: template.deposit,
      rentalArticleId: template.rentalArticleId ?? '',
      insuranceArticleId: template.insuranceArticleId ?? '',
      transportArticleId: template.transportArticleId ?? '',
      depositArticleId: template.depositArticleId ?? '',
    }));
  };

  useEffect(() => {
    if (!form.machineId) { setAutoMatchedTemplate(null); return; }
    const machine = machines.find((m) => m.id === form.machineId);
    if (!machine) { setAutoMatchedTemplate(null); return; }
    const matched = getMatchingTemplate(machine, templates);
    if (matched && matched.id !== form.templateId) {
      setAutoMatchedTemplate(matched.id);
    } else if (!matched) {
      setAutoMatchedTemplate(null);
    }
  }, [form.machineId, machines, templates]);

  const selectedTemplate = templates.find((t) => t.id === form.templateId);
  const hasLongTermOption = selectedTemplate && (
    (selectedTemplate.longTermDailyPrice ?? 0) > 0 ||
    (selectedTemplate.longTermWeeklyPrice ?? 0) > 0 ||
    (selectedTemplate.longTermMonthlyPrice ?? 0) > 0
  );

  function rentalDays() {
    if (openEnded) return 0;
    return form.startDate && form.plannedReturnDate
      ? Math.max(0, daysBetween(form.startDate, form.plannedReturnDate))
      : 0;
  }

  const days = rentalDays();
  const priceBreakdown = calcBreakdown(days, form.dailyPrice, form.weeklyPrice, form.monthlyPrice);
  const calculatedPrice = priceBreakdown.total;

  const insuranceMonths = days > 0 ? Math.ceil(days / 30) : 0;
  const insuranceCost = !openEnded && includeInsurance && selectedTemplate
    ? insuranceMonths * selectedTemplate.insuranceMonthlyPrice
    : 0;

  const extraArticlesTotal = orderArticles.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0);
  const totalPrice = openEnded
    ? form.transportCost + form.deposit + extraArticlesTotal
    : calculatedPrice + form.transportCost + insuranceCost + extraArticlesTotal;

  const availableMachines = machines.filter((m) => {
    if (m.status !== 'i_lager' && m.id !== form.machineId) return false;
    if (!selectedTemplate) return true;
    return machineMatchesTemplate(m.id, selectedTemplate);
  });

  const hasInsuranceOption = selectedTemplate && (
    selectedTemplate.insuranceDailyPrice > 0 ||
    selectedTemplate.insuranceWeeklyPrice > 0 ||
    selectedTemplate.insuranceMonthlyPrice > 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.machineId || !form.customerId) return;
    const id = addOrder({
      machineId: form.machineId,
      customerId: form.customerId,
      templateId: form.templateId || undefined,
      startDate: form.startDate,
      plannedReturnDate: openEnded ? '' : form.plannedReturnDate,
      dailyPrice: form.dailyPrice,
      weeklyPrice: form.weeklyPrice,
      monthlyPrice: form.monthlyPrice,
      transportCost: form.transportCost,
      deposit: form.deposit,
      insuranceCost: (!openEnded && includeInsurance && insuranceCost) ? insuranceCost : undefined,
      totalPrice,
      status: 'aktiv',
      orderReference: form.orderReference,
      internalNotes: form.internalNotes,
      customerNotes: form.customerNotes,
      accessories: form.accessories ? form.accessories.split(',').map((s) => s.trim()).filter(Boolean) : [],
      createdBy: '',
      rentalArticleId: form.rentalArticleId || undefined,
      insuranceArticleId: form.insuranceArticleId || undefined,
      transportArticleId: form.transportArticleId || undefined,
      depositArticleId: form.depositArticleId || undefined,
      openEnded: openEnded || undefined,
      insuranceMonthlyRate: (includeInsurance && openEnded && selectedTemplate)
        ? selectedTemplate.insuranceMonthlyPrice
        : undefined,
      orderArticles,
    });
    router.push(`/orders/${id}`);
  };

  const selectedMachine = machines.find((m) => m.id === form.machineId);
  const selectedCustomer = customers.find((c) => c.id === form.customerId);

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-50/60">
      <Header title="Skapa uthyrningsorder" />
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Tillbaka
        </Link>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Customer & Machine */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Kund och maskin</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Kund *" required>
                  <select required value={form.customerId} onChange={(e) => set('customerId', e.target.value)} className={inputClass}>
                    <option value="">Välj kund...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.companyName}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Prismall">
                  <select value={form.templateId} onChange={(e) => { applyTemplate(e.target.value); setAutoMatchedTemplate(null); }} className={inputClass}>
                    <option value="">Välj mall (valfritt)...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Maskin *" required>
                    <select required value={form.machineId} onChange={(e) => set('machineId', e.target.value)} className={inputClass}>
                      <option value="">Välj maskin...</option>
                      {availableMachines.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} – {m.brand} {m.model} ({m.internalCode})</option>
                      ))}
                      {availableMachines.length === 0 && (
                        <option disabled>Inga maskiner matchar prismallens krav</option>
                      )}
                    </select>
                  </Field>
                  {selectedMachine && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                      <MachineStatusBadge status={selectedMachine.status} />
                      <span className="text-[12px] text-slate-600">
                        {selectedMachine.brand} {selectedMachine.model} · {selectedMachine.capacity.toLocaleString('sv-SE')} kg · {selectedMachine.location}
                      </span>
                    </div>
                  )}
                  {/* Rental type toggle */}
                  {hasLongTermOption && form.templateId && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                      <p className="text-[11px] font-medium text-slate-500 mb-2">Hyrestyp</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => applyTemplate(form.templateId, 'short')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-medium rounded-lg border transition-all cursor-pointer ${
                            rentalType === 'short'
                              ? 'bg-white border-blue-400 text-blue-700 shadow-sm'
                              : 'bg-transparent border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Korttidshyra
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplate(form.templateId, 'long')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-medium rounded-lg border transition-all cursor-pointer ${
                            rentalType === 'long'
                              ? 'bg-white border-violet-400 text-violet-700 shadow-sm'
                              : 'bg-transparent border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                          Långtidshyra
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Auto-match suggestion */}
                  {autoMatchedTemplate && !form.templateId && (() => {
                    const t = templates.find((t) => t.id === autoMatchedTemplate);
                    return t ? (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200/80 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-[12px] text-blue-700">
                            Matchad mall: <strong>{t.name}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { applyTemplate(autoMatchedTemplate); setAutoMatchedTemplate(null); }}
                          className="text-[12px] font-medium text-blue-600 hover:text-blue-800 shrink-0 cursor-pointer transition-colors"
                        >
                          Tillämpa →
                        </button>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Hyresperiod</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Startdatum *" required>
                  <input required type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Planerat returdatum">
                  {openEnded ? (
                    <div className="px-3 py-2 text-[13px] text-slate-400 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2">
                      <Infinity className="w-3.5 h-3.5 shrink-0" />
                      Beräknas vid retur
                    </div>
                  ) : (
                    <input required={!openEnded} type="date" value={form.plannedReturnDate} min={form.startDate} onChange={(e) => set('plannedReturnDate', e.target.value)} className={inputClass} />
                  )}
                </Field>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openEnded}
                    onChange={(e) => setOpenEnded(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[13px] text-slate-600 font-medium">Inget slutdatum</span>
                </label>
                {!openEnded && days > 0 && (
                  <span className="text-[13px] text-slate-600 bg-blue-50 px-3 py-1.5 rounded-xl">
                    Hyresperiod: <strong>{days} dagar</strong>
                  </span>
                )}
                {openEnded && (
                  <span className="text-[12px] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">
                    Pris beräknas när retur registreras
                  </span>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Prissättning</h2>
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
                <Field label="Transportkostnad (kr)">
                  <input type="number" value={form.transportCost} onChange={(e) => set('transportCost', Number(e.target.value))} className={inputClass} min={0} />
                </Field>
                <Field label="Deposition (kr)">
                  <input type="number" value={form.deposit} onChange={(e) => set('deposit', Number(e.target.value))} className={inputClass} min={0} />
                </Field>
              </div>

              {/* Insurance toggle */}
              {hasInsuranceOption && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setIncludeInsurance(!includeInsurance)}
                      className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${includeInsurance ? 'bg-blue-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${includeInsurance ? 'translate-x-4' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[13px] font-medium text-slate-700">Inkludera försäkring</span>
                      </div>
                      {includeInsurance && selectedTemplate && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {openEnded
                            ? `Beräknas vid retur (${formatCurrency(selectedTemplate.insuranceMonthlyPrice)}/mån)`
                            : `${formatCurrency(insuranceCost)} (${insuranceMonths} påbörjad${insuranceMonths !== 1 ? 'e' : ''} mån à ${formatCurrency(selectedTemplate.insuranceMonthlyPrice)})`}
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Extra articles */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Artiklar</h2>

              {orderArticles.length > 0 && (
                <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Artikel</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-16">Antal</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-24">À-pris</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-24">Totalt</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orderArticles.map((row, i) => {
                        const art = articles.find((a) => a.id === row.articleId);
                        return (
                          <tr key={i} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2.5 text-[13px] text-slate-700">
                              <span className="text-slate-400 font-mono text-[11px] mr-1.5">{art?.articleNumber}</span>
                              {art?.name}
                            </td>
                            <td className="px-3 py-2.5 text-[13px] text-right text-slate-700">{row.quantity} {art?.unit}</td>
                            <td className="px-3 py-2.5 text-[13px] text-right text-slate-700">{formatCurrency(row.unitPrice)}</td>
                            <td className="px-3 py-2.5 text-[13px] text-right font-medium text-slate-800">{formatCurrency(row.quantity * row.unitPrice)}</td>
                            <td className="px-3 py-2.5 text-right">
                              <button type="button" onClick={() => setOrderArticles((p) => p.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add row */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Välj artikel</label>
                  <select
                    value={newArticleId}
                    onChange={(e) => {
                      const art = articles.find((a) => a.id === e.target.value);
                      setNewArticleId(e.target.value);
                      setNewArticlePrice(art?.defaultPrice ?? 0);
                    }}
                    className={inputClass}
                  >
                    <option value="">Välj artikel...</option>
                    {articles.filter((a) => a.isActive).map((a) => (
                      <option key={a.id} value={a.id}>{a.articleNumber} – {a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Antal</label>
                  <input type="number" min={1} value={newArticleQty} onChange={(e) => setNewArticleQty(Number(e.target.value))} className={inputClass} />
                </div>
                <div className="w-28">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">À-pris (kr)</label>
                  <input type="number" min={0} value={newArticlePrice} onChange={(e) => setNewArticlePrice(Number(e.target.value))} className={inputClass} />
                </div>
                <button
                  type="button"
                  disabled={!newArticleId}
                  onClick={() => {
                    if (!newArticleId) return;
                    setOrderArticles((p) => [...p, { articleId: newArticleId, quantity: newArticleQty, unitPrice: newArticlePrice }]);
                    setNewArticleId('');
                    setNewArticleQty(1);
                    setNewArticlePrice(0);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Lägg till
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Anteckningar och tillbehör</h2>
              <div className="space-y-4">
                <Field label="Ordermärkning">
                  <input value={form.orderReference} onChange={(e) => set('orderReference', e.target.value)} className={inputClass} placeholder="T.ex. PO-12345 eller kundreferens" />
                </Field>
                <Field label="Tillbehör (kommaseparerade)">
                  <input value={form.accessories} onChange={(e) => set('accessories', e.target.value)} className={inputClass} placeholder="T.ex. Sidoskift, Slirskydd" />
                </Field>
                <Field label="Kundanteckningar">
                  <textarea value={form.customerNotes} onChange={(e) => set('customerNotes', e.target.value)} className={`${inputClass} resize-none`} rows={2} />
                </Field>
                <Field label="Interna anteckningar">
                  <textarea value={form.internalNotes} onChange={(e) => set('internalNotes', e.target.value)} className={`${inputClass} resize-none`} rows={2} />
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link href="/orders" className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Avbryt</Link>
              <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                <Save className="w-4 h-4" /> Skapa order
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-4 h-4 text-slate-400" />
                <h3 className="text-[14px] font-semibold text-slate-900">Ordersammanfattning</h3>
              </div>
              <div className="space-y-3">
                {selectedCustomer && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Kund</p>
                    <p className="text-[13px] font-medium text-slate-800 mt-0.5">{selectedCustomer.companyName}</p>
                  </div>
                )}
                {selectedMachine && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Maskin</p>
                    <p className="text-[13px] font-medium text-slate-800 mt-0.5">{selectedMachine.name}</p>
                  </div>
                )}
                {selectedTemplate && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Prismall</p>
                    <p className="text-[13px] font-medium text-slate-800 mt-0.5">{selectedTemplate.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Hyresperiod</p>
                  <p className="text-[13px] font-medium text-slate-800 mt-0.5">
                    {openEnded ? 'Löpande' : days > 0 ? `${days} dagar` : '–'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {(() => {
                  const rentalArt = form.rentalArticleId ? articles.find(a => a.id === form.rentalArticleId) : null;
                  const insArt = form.insuranceArticleId ? articles.find(a => a.id === form.insuranceArticleId) : null;
                  const transArt = form.transportArticleId ? articles.find(a => a.id === form.transportArticleId) : null;
                  const depArt = form.depositArticleId ? articles.find(a => a.id === form.depositArticleId) : null;
                  return (
                    <>
                      <div>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-slate-500">Hyra {openEnded ? '(löpande)' : `(${days} dagar)`}</span>
                          <span className={`font-medium ${openEnded ? 'text-slate-400 text-[12px]' : ''}`}>
                            {openEnded ? 'Beräknas vid retur' : formatCurrency(calculatedPrice)}
                          </span>
                        </div>
                        {rentalArt && (
                          <p className="text-[11px] text-blue-500 mt-0.5">#{rentalArt.articleNumber} {rentalArt.name}</p>
                        )}
                      </div>
                      {form.transportCost > 0 && (
                        <div>
                          <div className="flex justify-between text-[13px]">
                            <span className="text-slate-500">Transport</span>
                            <span className="font-medium">{formatCurrency(form.transportCost)}</span>
                          </div>
                          {transArt && (
                            <p className="text-[11px] text-blue-500 mt-0.5">#{transArt.articleNumber} {transArt.name}</p>
                          )}
                        </div>
                      )}
                      {includeInsurance && (
                        <div>
                          <div className="flex justify-between text-[13px]">
                            <span className="flex items-center gap-1 text-slate-500"><Shield className="w-3 h-3 text-blue-400" />Försäkring</span>
                            <span className={`font-medium ${openEnded ? 'text-slate-400 text-[12px]' : ''}`}>
                              {openEnded ? 'Beräknas vid retur' : formatCurrency(insuranceCost)}
                            </span>
                          </div>
                          {insArt && (
                            <p className="text-[11px] text-blue-500 mt-0.5">#{insArt.articleNumber} {insArt.name}</p>
                          )}
                        </div>
                      )}
                      {form.deposit > 0 && (
                        <div>
                          <div className="flex justify-between text-[13px]">
                            <span className="text-slate-500">Deposition</span>
                            <span className="font-medium">{formatCurrency(form.deposit)}</span>
                          </div>
                          {depArt && (
                            <p className="text-[11px] text-blue-500 mt-0.5">#{depArt.articleNumber} {depArt.name}</p>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
                {extraArticlesTotal > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500">Artiklar ({orderArticles.length} st)</span>
                    <span className="font-medium">{formatCurrency(extraArticlesTotal)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-[13px] font-semibold text-slate-800">
                    {openEnded ? 'Delpris (ex. hyra)' : 'Totalt'}
                  </span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
                </div>
                {openEnded && (
                  <p className="text-[11px] text-slate-400">Hyra och försäkring beräknas vid retur</p>
                )}
              </div>

              {!openEnded && days > 0 && form.dailyPrice > 0 && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                  Beräknat som:{' '}
                  {[
                    priceBreakdown.months > 0 && `${priceBreakdown.months} mån à ${formatCurrency(form.monthlyPrice)}`,
                    priceBreakdown.weeks > 0 && `${priceBreakdown.weeks} veckor à ${formatCurrency(form.weeklyPrice)}`,
                    priceBreakdown.days > 0 && `${priceBreakdown.days} dagar à ${formatCurrency(form.dailyPrice)}`,
                  ].filter(Boolean).join(' + ') || `${days} dagar à ${formatCurrency(form.dailyPrice)}`}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center flex-1 text-slate-400">Laddar...</div>}>
      <NewOrderForm />
    </Suspense>
  );
}
