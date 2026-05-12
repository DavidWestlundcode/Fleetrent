'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Calculator, Shield, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency, daysBetween, getMatchingTemplate } from '@/lib/utils';
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
  const { machines, customers, templates, addOrder, currentUser } = useStore();

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
    internalNotes: '',
    customerNotes: '',
    accessories: '',
  });
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [autoMatchedTemplate, setAutoMatchedTemplate] = useState<string | null>(null);

  const set = (field: string, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setForm((p) => ({
        ...p,
        templateId,
        dailyPrice: template.dailyPrice,
        weeklyPrice: template.weeklyPrice,
        monthlyPrice: template.monthlyPrice,
        transportCost: template.transportCost,
        deposit: template.deposit,
      }));
    } else {
      set('templateId', templateId);
    }
  };

  // Auto-match template when machine changes
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

  const insurancePrice = (() => {
    if (!includeInsurance || !selectedTemplate) return 0;
    if (rentalDays() >= 28) return Math.ceil(rentalDays() / 30) * selectedTemplate.insuranceMonthlyPrice;
    if (rentalDays() >= 7) return Math.ceil(rentalDays() / 7) * selectedTemplate.insuranceWeeklyPrice;
    return rentalDays() * selectedTemplate.insuranceDailyPrice;
  });

  function rentalDays() {
    return form.startDate && form.plannedReturnDate
      ? Math.max(0, daysBetween(form.startDate, form.plannedReturnDate))
      : 0;
  }

  const days = rentalDays();

  const calculatedPrice = days >= 28
    ? Math.ceil(days / 30) * form.monthlyPrice
    : days >= 7
    ? Math.ceil(days / 7) * form.weeklyPrice
    : days * form.dailyPrice;

  const insuranceCost = includeInsurance && selectedTemplate
    ? days >= 28
      ? Math.ceil(days / 30) * selectedTemplate.insuranceMonthlyPrice
      : days >= 7
      ? Math.ceil(days / 7) * selectedTemplate.insuranceWeeklyPrice
      : days * selectedTemplate.insuranceDailyPrice
    : 0;

  const totalPrice = calculatedPrice + form.transportCost + insuranceCost;

  const availableMachines = machines.filter(
    (m) => m.status === 'i_lager' || m.id === form.machineId
  );

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
      plannedReturnDate: form.plannedReturnDate,
      dailyPrice: form.dailyPrice,
      weeklyPrice: form.weeklyPrice,
      monthlyPrice: form.monthlyPrice,
      transportCost: form.transportCost,
      deposit: form.deposit,
      insuranceCost: insuranceCost || undefined,
      totalPrice,
      status: 'aktiv',
      internalNotes: form.internalNotes,
      customerNotes: form.customerNotes,
      accessories: form.accessories ? form.accessories.split(',').map((s) => s.trim()).filter(Boolean) : [],
      createdBy: currentUser?.id ?? 'u1',
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
                        <option disabled>Inga tillgängliga maskiner</option>
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
                <Field label="Planerat returdatum *" required>
                  <input required type="date" value={form.plannedReturnDate} min={form.startDate} onChange={(e) => set('plannedReturnDate', e.target.value)} className={inputClass} />
                </Field>
              </div>
              {days > 0 && (
                <p className="mt-3 text-[13px] text-slate-600 bg-blue-50 px-3 py-2 rounded-xl">
                  Hyresperiod: <strong>{days} dagar</strong>
                </p>
              )}
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
                      {includeInsurance && days > 0 && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatCurrency(insuranceCost)} ({days >= 28 ? `${Math.ceil(days / 30)} mån à ${formatCurrency(selectedTemplate!.insuranceMonthlyPrice)}` : days >= 7 ? `${Math.ceil(days / 7)} veckor à ${formatCurrency(selectedTemplate!.insuranceWeeklyPrice)}` : `${days} dagar à ${formatCurrency(selectedTemplate!.insuranceDailyPrice)}`})
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Anteckningar och tillbehör</h2>
              <div className="space-y-4">
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
                {days > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Hyresperiod</p>
                    <p className="text-[13px] font-medium text-slate-800 mt-0.5">{days} dagar</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500">Hyra ({days} dagar)</span>
                  <span className="font-medium">{formatCurrency(calculatedPrice)}</span>
                </div>
                {form.transportCost > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500">Transport</span>
                    <span className="font-medium">{formatCurrency(form.transportCost)}</span>
                  </div>
                )}
                {includeInsurance && insuranceCost > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="flex items-center gap-1 text-slate-500"><Shield className="w-3 h-3 text-blue-400" />Försäkring</span>
                    <span className="font-medium">{formatCurrency(insuranceCost)}</span>
                  </div>
                )}
                {form.deposit > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500">Deposition</span>
                    <span className="font-medium">{formatCurrency(form.deposit)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-[13px] font-semibold text-slate-800">Totalt</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {days > 0 && form.dailyPrice > 0 && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                  Beräknat som: {days >= 28 ? `${Math.ceil(days / 30)} mån à ${formatCurrency(form.monthlyPrice)}` : days >= 7 ? `${Math.ceil(days / 7)} veckor à ${formatCurrency(form.weeklyPrice)}` : `${days} dagar à ${formatCurrency(form.dailyPrice)}`}
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
