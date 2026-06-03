'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, User } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import type { ContactPerson } from '@/lib/types';

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

export default function NewCustomerPage() {
  const router = useRouter();
  const { addCustomer } = useStore();

  const [form, setForm] = useState({
    companyName: '',
    orgNumber: '',
    invoiceEmail: '',
    fortnoxCustomerNumber: '',
    invoiceStreet: '',
    invoiceZip: '',
    invoiceCity: '',
    deliveryStreet: '',
    deliveryZip: '',
    deliveryCity: '',
    notes: '',
  });

  const [contacts, setContacts] = useState<ContactPerson[]>([{ name: '', phone: '', email: '' }]);
  const [sameAsInvoice, setSameAsInvoice] = useState(false);

  const set = (field: string, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  const setContact = (index: number, field: keyof ContactPerson, value: string) =>
    setContacts((prev) => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));

  const addContact = () => setContacts((prev) => [...prev, { name: '', phone: '', email: '' }]);
  const removeContact = (index: number) => setContacts((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const invoiceAddress = [
      form.invoiceStreet,
      [form.invoiceZip, form.invoiceCity].filter(Boolean).join(' '),
    ].filter(Boolean).join('\n');

    const deliveryAddress = sameAsInvoice ? invoiceAddress : [
      form.deliveryStreet,
      [form.deliveryZip, form.deliveryCity].filter(Boolean).join(' '),
    ].filter(Boolean).join('\n');

    const validContacts = contacts.filter((c) => c.name.trim());
    const primary = validContacts[0] ?? { name: '', phone: '', email: '' };

    const id = addCustomer({
      companyName: form.companyName,
      orgNumber: form.orgNumber,
      contactPerson: primary.name,
      phone: primary.phone,
      email: form.invoiceEmail,
      invoiceAddress,
      deliveryAddress,
      notes: form.notes,
      creditLimit: 0,
      fortnoxCustomerNumber: form.fortnoxCustomerNumber || undefined,
      totalSpent: 0,
      activeOrders: 0,
      contacts: validContacts,
      facilities: [],
    });
    router.push(`/customers/${id}`);
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-50/60">
      <Header title="Ny kund" />
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <Link href="/customers" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Tillbaka
        </Link>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Företagsinformation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Företagsnamn" required>
                <input required value={form.companyName} onChange={(e) => set('companyName', e.target.value)} className={inputClass} placeholder="AB Exempel" />
              </Field>
              <Field label="Organisationsnummer">
                <input value={form.orgNumber} onChange={(e) => set('orgNumber', e.target.value)} className={inputClass} placeholder="556000-0000" />
              </Field>
              <Field label="Faktureringse-post">
                <input type="email" value={form.invoiceEmail} onChange={(e) => set('invoiceEmail', e.target.value)} className={inputClass} placeholder="faktura@foretag.se" />
              </Field>
              <Field label="Kundnummer">
                <input value={form.fortnoxCustomerNumber} onChange={(e) => set('fortnoxCustomerNumber', e.target.value)} className={inputClass} placeholder="T.ex. 1042" />
              </Field>
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-slate-900">Kontaktpersoner</h2>
              <button
                type="button"
                onClick={addContact}
                className="flex items-center gap-1.5 text-[12px] font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Lägg till kontakt
              </button>
            </div>
            <div className="space-y-3">
              {contacts.map((contact, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <User className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        {i === 0 ? 'Primär kontakt' : `Kontakt ${i + 1}`}
                      </span>
                    </div>
                    {i > 0 && (
                      <button type="button" onClick={() => removeContact(i)} className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Field label="Namn" required={i === 0}>
                      <input
                        required={i === 0}
                        value={contact.name}
                        onChange={(e) => setContact(i, 'name', e.target.value)}
                        className={inputClass}
                        placeholder="Anna Svensson"
                      />
                    </Field>
                    <Field label="Telefon">
                      <input
                        value={contact.phone}
                        onChange={(e) => setContact(i, 'phone', e.target.value)}
                        className={inputClass}
                        placeholder="070-000 00 00"
                      />
                    </Field>
                    <Field label="E-post">
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => setContact(i, 'email', e.target.value)}
                        className={inputClass}
                        placeholder="anna@foretag.se"
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice address */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Fakturaadress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Adress">
                  <input value={form.invoiceStreet} onChange={(e) => set('invoiceStreet', e.target.value)} className={inputClass} placeholder="Storgatan 1" />
                </Field>
              </div>
              <Field label="Postnummer">
                <input value={form.invoiceZip} onChange={(e) => set('invoiceZip', e.target.value)} className={inputClass} placeholder="123 45" />
              </Field>
              <Field label="Ort">
                <input value={form.invoiceCity} onChange={(e) => set('invoiceCity', e.target.value)} className={inputClass} placeholder="Stockholm" />
              </Field>
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-slate-900">Leveransadress</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsInvoice}
                  onChange={(e) => setSameAsInvoice(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[12px] text-slate-500">Samma som fakturaadress</span>
              </label>
            </div>
            {sameAsInvoice ? (
              <p className="text-[12px] text-slate-400 italic">Samma adress som fakturaadressen används</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Adress">
                    <input value={form.deliveryStreet} onChange={(e) => set('deliveryStreet', e.target.value)} className={inputClass} placeholder="Storgatan 1" />
                  </Field>
                </div>
                <Field label="Postnummer">
                  <input value={form.deliveryZip} onChange={(e) => set('deliveryZip', e.target.value)} className={inputClass} placeholder="123 45" />
                </Field>
                <Field label="Ort">
                  <input value={form.deliveryCity} onChange={(e) => set('deliveryCity', e.target.value)} className={inputClass} placeholder="Stockholm" />
                </Field>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Anteckningar</h2>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="Interna anteckningar om kunden..." />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href="/customers" className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Avbryt</Link>
            <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              <Save className="w-4 h-4" /> Spara kund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
