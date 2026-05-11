'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Calculator } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency, daysBetween } from '@/lib/utils';
import { MachineStatusBadge } from '@/components/ui/StatusBadge';

const inputClass = 'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white';

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

  const set = (field: string, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  // Auto-fill from template
  const handleTemplateChange = (templateId: string) => {
    set('templateId', templateId);
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
    }
  };

  const rentalDays = form.startDate && form.plannedReturnDate
    ? Math.max(0, daysBetween(form.startDate, form.plannedReturnDate))
    : 0;

  const calculatedPrice = rentalDays >= 28
    ? Math.ceil(rentalDays / 30) * form.monthlyPrice
    : rentalDays >= 7
    ? Math.ceil(rentalDays / 7) * form.weeklyPrice
    : rentalDays * form.dailyPrice;

  const totalPrice = calculatedPrice + form.transportCost;

  const availableMachines = machines.filter(
    (m) => m.status === 'i_lager' || m.id === form.machineId
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
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Skapa uthyrningsorder" />
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Tillbaka
        </Link>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Machine */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Kund och maskin</h2>
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
                  <select value={form.templateId} onChange={(e) => handleTemplateChange(e.target.value)} className={inputClass}>
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
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                      <MachineStatusBadge status={selectedMachine.status} />
                      <span className="text-xs text-slate-600">
                        {selectedMachine.brand} {selectedMachine.model} · {selectedMachine.capacity} · {selectedMachine.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Hyresperiod</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Startdatum *" required>
                  <input required type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Planerat returdatum *" required>
                  <input required type="date" value={form.plannedReturnDate} min={form.startDate} onChange={(e) => set('plannedReturnDate', e.target.value)} className={inputClass} />
                </Field>
              </div>
              {rentalDays > 0 && (
                <p className="mt-3 text-sm text-slate-600 bg-blue-50 px-3 py-2 rounded-lg">
                  Hyresperiod: <strong>{rentalDays} dagar</strong>
                </p>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Prissättning</h2>
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
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Anteckningar och tillbehör</h2>
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
              <Link href="/orders" className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Avbryt</Link>
              <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                <Save className="w-4 h-4" /> Skapa order
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-4 h-4 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Ordersammanfattning</h3>
              </div>
              <div className="space-y-3">
                {selectedCustomer && (
                  <div>
                    <p className="text-xs text-slate-400">Kund</p>
                    <p className="text-sm font-medium text-slate-800">{selectedCustomer.companyName}</p>
                  </div>
                )}
                {selectedMachine && (
                  <div>
                    <p className="text-xs text-slate-400">Maskin</p>
                    <p className="text-sm font-medium text-slate-800">{selectedMachine.name}</p>
                  </div>
                )}
                {rentalDays > 0 && (
                  <div>
                    <p className="text-xs text-slate-400">Hyresperiod</p>
                    <p className="text-sm font-medium text-slate-800">{rentalDays} dagar</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Hyra ({rentalDays} dagar)</span>
                  <span className="font-medium">{formatCurrency(calculatedPrice)}</span>
                </div>
                {form.transportCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Transport</span>
                    <span className="font-medium">{formatCurrency(form.transportCost)}</span>
                  </div>
                )}
                {form.deposit > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Deposition</span>
                    <span className="font-medium">{formatCurrency(form.deposit)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 flex justify-between">
                  <span className="font-semibold text-slate-800">Totalt</span>
                  <span className="font-bold text-lg text-blue-600">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {rentalDays > 0 && form.dailyPrice > 0 && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
                  <p>Beräknat som: {rentalDays >= 28 ? `${Math.ceil(rentalDays / 30)} mån à ${formatCurrency(form.monthlyPrice)}` : rentalDays >= 7 ? `${Math.ceil(rentalDays / 7)} veckor à ${formatCurrency(form.weeklyPrice)}` : `${rentalDays} dagar à ${formatCurrency(form.dailyPrice)}`}</p>
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
