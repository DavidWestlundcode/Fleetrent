'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';

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

export default function NewCustomerPage() {
  const router = useRouter();
  const { addCustomer } = useStore();
  const [form, setForm] = useState({
    companyName: '', orgNumber: '', contactPerson: '', phone: '', email: '',
    invoiceAddress: '', deliveryAddress: '', notes: '', creditLimit: 100000,
  });

  const set = (field: string, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = addCustomer({ ...form, totalSpent: 0, activeOrders: 0 });
    router.push(`/customers/${id}`);
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Ny kund" />
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Tillbaka
        </Link>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Företagsinformation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Företagsnamn *" required>
                <input required value={form.companyName} onChange={(e) => set('companyName', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Organisationsnummer">
                <input value={form.orgNumber} onChange={(e) => set('orgNumber', e.target.value)} className={inputClass} placeholder="556000-0000" />
              </Field>
              <Field label="Kontaktperson *" required>
                <input required value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Telefon *" required>
                <input required value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
              </Field>
              <Field label="E-post *" required>
                <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Kreditgräns (kr)">
                <input type="number" value={form.creditLimit} onChange={(e) => set('creditLimit', Number(e.target.value))} className={inputClass} min={0} />
              </Field>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Adresser</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Fakturaadress">
                <textarea value={form.invoiceAddress} onChange={(e) => set('invoiceAddress', e.target.value)} className={`${inputClass} resize-none`} rows={3} />
              </Field>
              <Field label="Leveransadress">
                <textarea value={form.deliveryAddress} onChange={(e) => set('deliveryAddress', e.target.value)} className={`${inputClass} resize-none`} rows={3} />
              </Field>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Anteckningar</h2>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className={`${inputClass} resize-none`} rows={4} placeholder="Interna anteckningar om kunden..." />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href="/customers" className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Avbryt</Link>
            <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4" /> Spara kund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
