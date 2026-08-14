'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Calculator, Shield, Sparkles, Clock, CalendarDays, Infinity, Plus, Trash2, Search, FileSignature, CalendarOff, Repeat } from 'lucide-react';
import type { OrderArticle } from '@/lib/types';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency, daysBetween, getMatchingTemplate, calcBreakdown, countBusinessDays } from '@/lib/utils';
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

function PriceWithDiscount({ label, price, discount, onPriceChange, onDiscountChange }: {
  label: string;
  price: number;
  discount: number;
  onPriceChange: (v: number) => void;
  onDiscountChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <div className="flex gap-1.5">
        <div className="flex-1 relative">
          <input
            type="number" min={0} value={price}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className={`${inputClass} pr-7`} placeholder="0"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">kr</span>
        </div>
        <div className="w-[68px] relative">
          <input
            type="number" min={0} max={100} step={0.1}
            value={discount || ''}
            onChange={(e) => onDiscountChange(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
            className={`${inputClass} pr-6`} placeholder="0"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">%</span>
        </div>
      </div>
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
    machineId: searchParams.get('machine') ?? '',
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
    facilityName: '',
    ordererName: '',
    ordererPhone: '',
    ordererEmail: '',
  });
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [rentalType, setRentalType] = useState<'short' | 'long'>('short');
  const [autoMatchedTemplate, setAutoMatchedTemplate] = useState<string | null>(null);
  const [openEnded, setOpenEnded] = useState(false);
  const [chargeWeekends, setChargeWeekends] = useState(false);
  const [isLongTerm, setIsLongTerm] = useState(false);
  const [orderArticles, setOrderArticles] = useState<OrderArticle[]>([]);
  const [newArticleId, setNewArticleId] = useState('');
  const [newArticleQty, setNewArticleQty] = useState(1);
  const [newArticlePrice, setNewArticlePrice] = useState(0);
  const [newArticleDiscount, setNewArticleDiscount] = useState(0);
  const [newArticleDescription, setNewArticleDescription] = useState('');
  const [articleSearch, setArticleSearch] = useState('');
  const [showArticleDropdown, setShowArticleDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [machineSearch, setMachineSearch] = useState('');
  const [showMachineDropdown, setShowMachineDropdown] = useState(false);

  // Per-row discounts
  const [dailyDiscount, setDailyDiscount] = useState(0);
  const [weeklyDiscount, setWeeklyDiscount] = useState(0);
  const [monthlyDiscount, setMonthlyDiscount] = useState(0);
  const [transportDiscount, setTransportDiscount] = useState(0);
  const [insuranceDiscount, setInsuranceDiscount] = useState(0);

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
      transportCost: 0,
      deposit: 0,
      rentalArticleId: template.rentalArticleId ?? '',
      insuranceArticleId: template.insuranceArticleId ?? '',
      transportArticleId: template.transportArticleId ?? '',
      depositArticleId: template.depositArticleId ?? '',
    }));
    // Apply per-price discounts from template
    setDailyDiscount(isLong ? (template.longTermDailyDiscount ?? 0) : (template.dailyPriceDiscount ?? 0));
    setWeeklyDiscount(isLong ? (template.longTermWeeklyDiscount ?? 0) : (template.weeklyPriceDiscount ?? 0));
    setMonthlyDiscount(isLong ? (template.longTermMonthlyDiscount ?? 0) : (template.monthlyPriceDiscount ?? 0));
    setTransportDiscount(template.transportDiscount ?? 0);
    setInsuranceDiscount(template.insuranceDailyDiscount ?? 0);

  };

  // Pre-fill search fields from URL params
  useEffect(() => {
    if (form.machineId && !machineSearch) {
      const m = machines.find((x) => x.id === form.machineId);
      if (m) setMachineSearch(`${m.name}${m.internalCode ? ` (${m.internalCode})` : ''}`);
    }
    if (form.customerId && !customerSearch) {
      const c = customers.find((x) => x.id === form.customerId);
      if (c) setCustomerSearch(c.companyName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machines, customers]);

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
  const billableDays = (!openEnded && form.startDate && form.plannedReturnDate && days > 0)
    ? (chargeWeekends ? days : countBusinessDays(form.startDate, form.plannedReturnDate))
    : days;
  const priceBreakdown = calcBreakdown(billableDays, form.dailyPrice, form.weeklyPrice, form.monthlyPrice);
  const calculatedPrice = priceBreakdown.total;

  const insuranceMonths = billableDays > 0 ? Math.ceil(billableDays / 30) : 0;
  const insuranceCost = !openEnded && includeInsurance && selectedTemplate
    ? insuranceMonths * selectedTemplate.insuranceMonthlyPrice
    : 0;

  // Per-row totals after discounts (each rate period uses its own discount)
  const rentalTotal = openEnded ? 0 : (
    priceBreakdown.months * form.monthlyPrice * (1 - monthlyDiscount / 100) +
    priceBreakdown.weeks * form.weeklyPrice * (1 - weeklyDiscount / 100) +
    priceBreakdown.days * form.dailyPrice * (1 - dailyDiscount / 100)
  );
  const transportTotal = form.transportCost * (1 - transportDiscount / 100);
  const insuranceTotal = (includeInsurance && !openEnded) ? insuranceCost * (1 - insuranceDiscount / 100) : 0;
  const extraArticlesTotal = orderArticles.reduce((sum, r) => {
    const d = r.discountPercent ?? 0;
    return sum + r.quantity * r.unitPrice * (1 - d / 100);
  }, 0);
  const totalPrice = rentalTotal + insuranceTotal + extraArticlesTotal;

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
      status: form.startDate > today ? 'reserverad' : 'aktiv',
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
      chargeWeekends: chargeWeekends || undefined,
      isLongTerm: isLongTerm || undefined,
      insuranceMonthlyRate: (includeInsurance && openEnded && selectedTemplate)
        ? selectedTemplate.insuranceMonthlyPrice
        : undefined,
      orderArticles,
      rentalDiscount: dailyDiscount || undefined,
      transportDiscount: transportDiscount || undefined,
      insuranceDiscount: insuranceDiscount || undefined,
      facilityName: form.facilityName || undefined,
      ordererName: form.ordererName || undefined,
      ordererPhone: form.ordererPhone || undefined,
      ordererEmail: form.ordererEmail || undefined,
    });
    router.push(`/orders/${id}`);
  };

  const selectedMachine = machines.find((m) => m.id === form.machineId);
  const selectedCustomer = customers.find((c) => c.id === form.customerId);
  const selectedFacility = selectedCustomer?.facilities?.find((f) => f.name === form.facilityName);
  const availableContacts = form.facilityName
    ? (selectedFacility?.contacts ?? [])
    : (selectedCustomer?.contacts ?? []);

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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                        if (!e.target.value) {
                          set('customerId', '');
                          set('facilityName', '');
                          set('ordererName', '');
                          set('ordererPhone', '');
                          set('ordererEmail', '');
                        }
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 150)}
                      placeholder="Sök kund..."
                      className={`${inputClass} pl-8`}
                    />
                    {showCustomerDropdown && (
                      <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {customers
                          .filter(c => c.isActive !== false && (
                            !customerSearch ||
                            c.companyName.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            (c.orgNumber ?? '').includes(customerSearch)
                          ))
                          .map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onMouseDown={() => {
                                set('customerId', c.id);
                                set('facilityName', '');
                                set('ordererName', '');
                                set('ordererPhone', '');
                                set('ordererEmail', '');
                                setCustomerSearch(c.companyName);
                                setShowCustomerDropdown(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0 cursor-pointer"
                            >
                              <span className="text-[13px] text-slate-800">{c.companyName}</span>
                              {c.orgNumber && <span className="text-[11px] text-slate-400 ml-2 shrink-0">{c.orgNumber}</span>}
                            </button>
                          ))}
                        {customers.filter(c => c.isActive !== false && (!customerSearch || c.companyName.toLowerCase().includes(customerSearch.toLowerCase()) || (c.orgNumber ?? '').includes(customerSearch))).length === 0 && (
                          <p className="px-3 py-3 text-[12px] text-slate-400">Inga kunder hittades</p>
                        )}
                      </div>
                    )}
                  </div>
                </Field>

                <Field label="Prismall">
                  <select value={form.templateId} onChange={(e) => { applyTemplate(e.target.value); setAutoMatchedTemplate(null); }} className={inputClass}>
                    <option value="">Välj mall (valfritt)...</option>
                    {templates
                      .filter((t) => !t.customerIds?.length || t.customerIds.includes(form.customerId))
                      .map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                  </select>
                </Field>

                {selectedCustomer?.facilities && selectedCustomer.facilities.length > 0 && (
                  <Field label="Anläggning">
                    <select
                      value={form.facilityName}
                      onChange={(e) => {
                        set('facilityName', e.target.value);
                        set('ordererName', '');
                        set('ordererPhone', '');
                        set('ordererEmail', '');
                      }}
                      className={inputClass}
                    >
                      <option value="">Välj anläggning (valfritt)...</option>
                      {selectedCustomer.facilities.map((f, i) => (
                        <option key={i} value={f.name}>{f.name}{f.city ? ` – ${f.city}` : ''}</option>
                      ))}
                    </select>
                  </Field>
                )}

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Beställare">
                    <input
                      type="text"
                      list="orderer-suggestions-new"
                      value={form.ordererName}
                      onChange={(e) => {
                        const name = e.target.value;
                        const contact = availableContacts.find((c) => c.name === name);
                        set('ordererName', name);
                        if (contact) {
                          set('ordererPhone', contact.phone ?? '');
                          set('ordererEmail', contact.email ?? '');
                        }
                      }}
                      placeholder="Namn (valfritt)"
                      className={inputClass}
                    />
                    {availableContacts.length > 0 && (
                      <datalist id="orderer-suggestions-new">
                        {availableContacts.map((c, i) => <option key={i} value={c.name} />)}
                      </datalist>
                    )}
                  </Field>
                  <Field label="Telefon">
                    <input
                      type="tel"
                      value={form.ordererPhone}
                      onChange={(e) => set('ordererPhone', e.target.value)}
                      placeholder="Telefonnummer"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="E-post">
                    <input
                      type="email"
                      value={form.ordererEmail}
                      onChange={(e) => set('ordererEmail', e.target.value)}
                      placeholder="E-postadress"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field label="Maskin *" required>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={machineSearch}
                        onChange={(e) => {
                          setMachineSearch(e.target.value);
                          setShowMachineDropdown(true);
                          if (!e.target.value) set('machineId', '');
                        }}
                        onFocus={() => setShowMachineDropdown(true)}
                        onBlur={() => setTimeout(() => setShowMachineDropdown(false), 150)}
                        placeholder="Sök maskin, kod, serienr..."
                        className={`${inputClass} pl-8`}
                      />
                      {showMachineDropdown && (
                        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {availableMachines
                            .filter(m => !machineSearch ||
                              m.name.toLowerCase().includes(machineSearch.toLowerCase()) ||
                              (m.internalCode ?? '').toLowerCase().includes(machineSearch.toLowerCase()) ||
                              (m.serialNumber ?? '').toLowerCase().includes(machineSearch.toLowerCase()) ||
                              (m.brand ?? '').toLowerCase().includes(machineSearch.toLowerCase()) ||
                              (m.model ?? '').toLowerCase().includes(machineSearch.toLowerCase())
                            )
                            .map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onMouseDown={() => {
                                  set('machineId', m.id);
                                  setMachineSearch(`${m.name}${m.internalCode ? ` (${m.internalCode})` : ''}`);
                                  setShowMachineDropdown(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0 cursor-pointer"
                              >
                                <div>
                                  <span className="text-[13px] font-medium text-slate-800">{m.name}</span>
                                  <span className="ml-2 text-[11px] text-slate-400">{m.brand} {m.model}</span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">{m.internalCode}</span>
                              </button>
                            ))}
                          {availableMachines.filter(m => !machineSearch || m.name.toLowerCase().includes(machineSearch.toLowerCase()) || (m.internalCode ?? '').toLowerCase().includes(machineSearch.toLowerCase()) || (m.serialNumber ?? '').toLowerCase().includes(machineSearch.toLowerCase()) || (m.brand ?? '').toLowerCase().includes(machineSearch.toLowerCase()) || (m.model ?? '').toLowerCase().includes(machineSearch.toLowerCase())).length === 0 && (
                            <p className="px-3 py-3 text-[12px] text-slate-400">{availableMachines.length === 0 ? 'Inga maskiner matchar prismallens krav' : 'Inga maskiner hittades'}</p>
                          )}
                        </div>
                      )}
                    </div>
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
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openEnded}
                    onChange={(e) => setOpenEnded(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[13px] text-slate-600 font-medium">Inget slutdatum</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chargeWeekends}
                    onChange={(e) => setChargeWeekends(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[13px] text-slate-600 font-medium flex items-center gap-1.5">
                    <CalendarOff className="w-3.5 h-3.5 text-slate-400" />
                    Räkna med helgdagar
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLongTerm}
                    onChange={(e) => setIsLongTerm(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-[13px] text-slate-600 font-medium flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-slate-400" />
                    Avtalshyra
                  </span>
                </label>
                {isLongTerm && (
                  <span className="text-[12px] text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">
                    Delfaktura genereras automatiskt i slutet av varje månad
                  </span>
                )}
                {!openEnded && days > 0 && (
                  <span className="text-[13px] text-slate-600 bg-blue-50 px-3 py-1.5 rounded-xl">
                    {chargeWeekends || billableDays === days
                      ? <><strong>{days}</strong> dagar</>
                      : <><strong>{billableDays}</strong> fakturerbara dagar <span className="text-slate-400">({days} kalenderdagar)</span></>
                    }
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
              <h2 className="text-[14px] font-semibold text-slate-900 mb-1">Prissättning</h2>
              <p className="text-[11px] text-slate-400 mb-4">Pris (kr) + Rabatt (%)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PriceWithDiscount
                  label="Dagspris"
                  price={form.dailyPrice} discount={dailyDiscount}
                  onPriceChange={(v) => set('dailyPrice', v)} onDiscountChange={setDailyDiscount}
                />
                <PriceWithDiscount
                  label="Veckopris"
                  price={form.weeklyPrice} discount={weeklyDiscount}
                  onPriceChange={(v) => set('weeklyPrice', v)} onDiscountChange={setWeeklyDiscount}
                />
                <PriceWithDiscount
                  label="Månadspris"
                  price={form.monthlyPrice} discount={monthlyDiscount}
                  onPriceChange={(v) => set('monthlyPrice', v)} onDiscountChange={setMonthlyDiscount}
                />
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
                  <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Artikel</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-14">Antal</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-20">À-pris</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-16">Rabatt</th>
                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-20">Totalt</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orderArticles.map((row, i) => {
                        const art = articles.find((a) => a.id === row.articleId);
                        const d = row.discountPercent ?? 0;
                        const lineTotal = row.quantity * row.unitPrice * (1 - d / 100);
                        return (
                          <tr key={i} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2.5 text-[13px] text-slate-700">
                              <span className="text-slate-400 font-mono text-[11px] mr-1.5">{art?.articleNumber}</span>
                              {row.description ?? art?.name}
                            </td>
                            <td className="px-3 py-2.5 text-[13px] text-right text-slate-700">{row.quantity} {art?.unit}</td>
                            <td className="px-3 py-2.5 text-[13px] text-right text-slate-700">{formatCurrency(row.unitPrice)}</td>
                            <td className="px-3 py-2.5 text-right">
                              {d > 0
                                ? <span className="text-[12px] font-medium text-emerald-600">{d}%</span>
                                : <span className="text-[12px] text-slate-300">–</span>
                              }
                            </td>
                            <td className="px-3 py-2.5 text-[13px] text-right font-medium text-slate-800">{formatCurrency(lineTotal)}</td>
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
                </div>
              )}

              {/* Add row */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Lägg till artikel</p>
                <div className="flex gap-2 items-end flex-wrap">
                  {/* Searchable article picker */}
                  <div className="flex-1 min-w-[160px] relative">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Sök artikel</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={articleSearch}
                        onChange={(e) => {
                          setArticleSearch(e.target.value);
                          setShowArticleDropdown(true);
                          if (!e.target.value) { setNewArticleId(''); setNewArticlePrice(0); }
                        }}
                        onFocus={() => setShowArticleDropdown(true)}
                        onBlur={() => setTimeout(() => setShowArticleDropdown(false), 150)}
                        placeholder="Sök på namn eller art.nr..."
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                    {showArticleDropdown && articleSearch && (
                      <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                        {articles
                          .filter((a) => a.isActive && (
                            a.name.toLowerCase().includes(articleSearch.toLowerCase()) ||
                            a.articleNumber.toLowerCase().includes(articleSearch.toLowerCase())
                          ))
                          .map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onMouseDown={() => {
                                setNewArticleId(a.id);
                                const tmpl = selectedTemplate;
                                const isTemplateTransport = tmpl && tmpl.transportArticleId === a.id && (tmpl.transportCost ?? 0) > 0;
                                setNewArticlePrice(isTemplateTransport ? tmpl!.transportCost : a.defaultPrice);
                                setNewArticleDiscount(isTemplateTransport ? (tmpl!.transportDiscount ?? 0) : 0);
                                setNewArticleDescription(a.name);
                                setArticleSearch(`${a.articleNumber} – ${a.name}`);
                                setShowArticleDropdown(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0 cursor-pointer"
                            >
                              <div>
                                <span className="text-[12px] font-medium text-slate-800">{a.name}</span>
                                <span className="ml-2 text-[11px] text-slate-400 font-mono">{a.articleNumber}</span>
                              </div>
                              <span className="text-[12px] text-slate-500 shrink-0 ml-3">{a.defaultPrice.toLocaleString('sv-SE')} kr/{a.unit}</span>
                            </button>
                          ))}
                        {articles.filter((a) => a.isActive && (
                          a.name.toLowerCase().includes(articleSearch.toLowerCase()) ||
                          a.articleNumber.toLowerCase().includes(articleSearch.toLowerCase())
                        )).length === 0 && (
                          <p className="px-3 py-3 text-[12px] text-slate-400">Inga artiklar hittades</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Benämning</label>
                    <input
                      type="text"
                      value={newArticleDescription}
                      onChange={(e) => setNewArticleDescription(e.target.value)}
                      className={inputClass}
                      placeholder="Beskrivning på raden..."
                    />
                  </div>
                  <div className="w-16">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Antal</label>
                    <input type="number" min={1} value={newArticleQty} onChange={(e) => setNewArticleQty(Number(e.target.value))} className={inputClass} />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">À-pris (kr)</label>
                    <input type="number" min={0} value={newArticlePrice} onChange={(e) => setNewArticlePrice(Number(e.target.value))} className={inputClass} />
                  </div>
                  <div className="w-20">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Rabatt (%)</label>
                    <div className="relative">
                      <input
                        type="number" min={0} max={100} step={0.1}
                        value={newArticleDiscount || ''}
                        onChange={(e) => setNewArticleDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className={`${inputClass} pr-7`}
                        placeholder="0"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">%</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!newArticleId}
                    onClick={() => {
                      if (!newArticleId) return;
                      const art = articles.find((a) => a.id === newArticleId);
                      const finalDesc = newArticleDescription.trim() || art?.name || '';
                      setOrderArticles((p) => [...p, {
                        articleId: newArticleId,
                        quantity: newArticleQty,
                        unitPrice: newArticlePrice,
                        ...(newArticleDiscount > 0 ? { discountPercent: newArticleDiscount } : {}),
                        ...(finalDesc && finalDesc !== art?.name ? { description: finalDesc } : {}),
                      }]);
                      setNewArticleId('');
                      setNewArticleQty(1);
                      setNewArticlePrice(0);
                      setNewArticleDiscount(0);
                      setNewArticleDescription('');
                      setArticleSearch('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Lägg till
                  </button>
                </div>
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

            {form.startDate > today && (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-700">
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                Startdatum är i framtiden — ordern sparas som bokning och aktiveras automatiskt {form.startDate}.
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <Link href="/orders" className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Avbryt</Link>
              <button type="submit" className={`flex items-center gap-2 px-5 py-2 text-white text-[13px] font-medium rounded-xl transition-colors shadow-sm ${form.startDate > today ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                <Save className="w-4 h-4" />
                {form.startDate > today ? 'Skapa bokning' : 'Skapa order'}
              </button>
            </div>

            {/* Coming soon: e-signing */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                    <FileSignature className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-slate-700">Skicka avtal för signering</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Låt kunden signera hyresavtalet digitalt direkt från ordern</p>
                  </div>
                </div>
                <span className="shrink-0 ml-4 px-2.5 py-1 text-[11px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-full">
                  Kommer snart
                </span>
              </div>
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
                    {openEnded ? 'Löpande' : billableDays > 0 ? `${billableDays} fakturerbara dagar` : '–'}
                  </p>
                  {!openEnded && !chargeWeekends && days > 0 && billableDays !== days && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{days} kalenderdagar</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {/* Rental row */}
                <div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500 flex items-center gap-1 flex-wrap">
                      Hyra {openEnded ? '(löpande)' : billableDays > 0 ? `(${billableDays} dagar)` : ''}
                      {dailyDiscount > 0 && <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">-{dailyDiscount}% dag</span>}
                      {weeklyDiscount > 0 && <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">-{weeklyDiscount}% vec</span>}
                      {monthlyDiscount > 0 && <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">-{monthlyDiscount}% mån</span>}
                    </span>
                    <span className={`font-medium shrink-0 ml-2 ${openEnded ? 'text-slate-400 text-[12px]' : ''}`}>
                      {openEnded ? 'Beräknas vid retur' : formatCurrency(rentalTotal)}
                    </span>
                  </div>
                  {(dailyDiscount > 0 || weeklyDiscount > 0 || monthlyDiscount > 0) && !openEnded && (
                    <div className="flex justify-end">
                      <span className="text-[11px] text-slate-400 line-through">{formatCurrency(calculatedPrice)}</span>
                    </div>
                  )}
                  {(() => {
                    const rentalArt = form.rentalArticleId ? articles.find(a => a.id === form.rentalArticleId) : null;
                    return rentalArt ? <p className="text-[11px] text-blue-500 mt-0.5">#{rentalArt.articleNumber} {rentalArt.name}</p> : null;
                  })()}
                </div>

                {/* Insurance row */}
                {includeInsurance && (
                  <div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-400" />Försäkring
                        {insuranceDiscount > 0 && <span className="ml-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">-{insuranceDiscount}%</span>}
                      </span>
                      <span className={`font-medium ${openEnded ? 'text-slate-400 text-[12px]' : ''}`}>
                        {openEnded ? 'Beräknas vid retur' : formatCurrency(insuranceTotal)}
                      </span>
                    </div>
                    {insuranceDiscount > 0 && !openEnded && (
                      <div className="flex justify-end">
                        <span className="text-[11px] text-slate-400 line-through">{formatCurrency(insuranceCost)}</span>
                      </div>
                    )}
                    {(() => {
                      const insArt = form.insuranceArticleId ? articles.find(a => a.id === form.insuranceArticleId) : null;
                      return insArt ? <p className="text-[11px] text-blue-500 mt-0.5">#{insArt.articleNumber} {insArt.name}</p> : null;
                    })()}
                  </div>
                )}

                {/* Extra articles */}
                {orderArticles.length > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500">Artiklar ({orderArticles.length} st)</span>
                    <span className="font-medium">{formatCurrency(extraArticlesTotal)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-[13px] font-semibold text-slate-800">
                    {openEnded ? 'Delpris (ex. hyra och försäkring)' : 'Totalt'}
                  </span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
                </div>
                {openEnded && (
                  <p className="text-[11px] text-slate-400">Hyra och försäkring beräknas vid retur</p>
                )}
              </div>

              {!openEnded && billableDays > 0 && form.dailyPrice > 0 && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                  Beräknat som:{' '}
                  {[
                    priceBreakdown.months > 0 && `${priceBreakdown.months} mån à ${formatCurrency(form.monthlyPrice)}`,
                    priceBreakdown.weeks > 0 && `${priceBreakdown.weeks} veckor à ${formatCurrency(form.weeklyPrice)}`,
                    priceBreakdown.days > 0 && `${priceBreakdown.days} dagar à ${formatCurrency(form.dailyPrice)}`,
                  ].filter(Boolean).join(' + ') || `${billableDays} dagar à ${formatCurrency(form.dailyPrice)}`}
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
