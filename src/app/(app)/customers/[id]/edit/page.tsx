'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, User, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import type { ContactPerson, CustomerFacility } from '@/lib/types';

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

function parseAddress(addr: string) {
  if (!addr) return { street: '', zip: '', city: '' };
  if (addr.includes('\n')) {
    const [street = '', rest = ''] = addr.split('\n');
    const match = rest.trim().match(/^(\d[\d\s]*)\s+(.+)$/);
    return { street, zip: match?.[1]?.trim() ?? '', city: match?.[2] ?? rest.trim() };
  }
  const parts = addr.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 3) return { street: parts[0], zip: parts[1], city: parts[2] };
  if (parts.length === 2) return { street: parts[0], zip: '', city: parts[1] };
  return { street: addr, zip: '', city: '' };
}

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { customers, updateCustomer } = useStore();
  const customer = customers.find((c) => c.id === id);

  if (!customer) {
    return (
      <div className="flex items-center justify-center flex-1 text-slate-400">
        <p>Kunden hittades inte</p>
      </div>
    );
  }

  const invParsed = parseAddress(customer.invoiceAddress);
  const delParsed = parseAddress(customer.deliveryAddress);
  const sameAddr = customer.invoiceAddress === customer.deliveryAddress;

  const [form, setForm] = useState({
    companyName: customer.companyName,
    orgNumber: customer.orgNumber,
    email: customer.email,
    phone: customer.phone,
    fortnoxCustomerNumber: customer.fortnoxCustomerNumber ?? '',
    invoiceStreet: invParsed.street,
    invoiceZip: invParsed.zip,
    invoiceCity: invParsed.city,
    deliveryStreet: delParsed.street,
    deliveryZip: delParsed.zip,
    deliveryCity: delParsed.city,
    notes: customer.notes,
  });

  const [contacts, setContacts] = useState<ContactPerson[]>(
    customer.contacts.length > 0 ? customer.contacts : [{ name: '', phone: '', email: '' }]
  );
  const [facilities, setFacilities] = useState<CustomerFacility[]>(customer.facilities ?? []);
  const [sameAsInvoice, setSameAsInvoice] = useState(sameAddr);
  const [openFacility, setOpenFacility] = useState<number | null>(null);

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  // Contacts
  const setContact = (i: number, field: keyof ContactPerson, value: string) =>
    setContacts((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  const addContact = () => setContacts((prev) => [...prev, { name: '', phone: '', email: '' }]);
  const removeContact = (i: number) => setContacts((prev) => prev.filter((_, idx) => idx !== i));

  // Facilities
  const setFacility = (i: number, field: keyof CustomerFacility, value: string) =>
    setFacilities((prev) => prev.map((f, idx) => idx === i ? { ...f, [field]: value } : f));
  const addFacility = () => {
    setFacilities((prev) => [...prev, { name: '', address: '', city: '', zip: '', contacts: [] }]);
    setOpenFacility(facilities.length);
  };
  const removeFacility = (i: number) => {
    setFacilities((prev) => prev.filter((_, idx) => idx !== i));
    setOpenFacility(null);
  };

  // Facility contacts
  const setFacilityContact = (fi: number, ci: number, field: keyof ContactPerson, value: string) =>
    setFacilities((prev) => prev.map((f, i) => {
      if (i !== fi) return f;
      const contacts = (f.contacts ?? []).map((c, j) => j === ci ? { ...c, [field]: value } : c);
      return { ...f, contacts };
    }));
  const addFacilityContact = (fi: number) =>
    setFacilities((prev) => prev.map((f, i) => i === fi ? { ...f, contacts: [...(f.contacts ?? []), { name: '', phone: '', email: '' }] } : f));
  const removeFacilityContact = (fi: number, ci: number) =>
    setFacilities((prev) => prev.map((f, i) => i === fi ? { ...f, contacts: (f.contacts ?? []).filter((_, j) => j !== ci) } : f));

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

    updateCustomer(id, {
      companyName: form.companyName,
      orgNumber: form.orgNumber,
      contactPerson: primary.name,
      phone: form.phone || primary.phone,
      email: form.email,
      invoiceAddress,
      deliveryAddress,
      notes: form.notes,
      fortnoxCustomerNumber: form.fortnoxCustomerNumber || undefined,
      contacts: validContacts,
      facilities: facilities.filter((f) => f.name.trim()),
    });

    router.push(`/customers/${id}`);
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-50/60">
      <Header title={`Redigera — ${customer.companyName}`} />
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <Link href={`/customers/${id}`} className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Tillbaka
        </Link>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Företagsinformation */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Företagsinformation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Företagsnamn" required>
                <input required value={form.companyName} onChange={(e) => set('companyName', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Organisationsnummer">
                <input value={form.orgNumber} onChange={(e) => set('orgNumber', e.target.value)} className={inputClass} placeholder="556000-0000" />
              </Field>
              <Field label="E-post">
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Telefon">
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Kundnummer">
                <input value={form.fortnoxCustomerNumber} onChange={(e) => set('fortnoxCustomerNumber', e.target.value)} className={inputClass} placeholder="T.ex. 1042" />
              </Field>
            </div>
          </div>

          {/* Kontaktpersoner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-slate-900">Kontaktpersoner</h2>
              <button type="button" onClick={addContact} className="flex items-center gap-1.5 text-[12px] font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Namn">
                      <input value={contact.name} onChange={(e) => setContact(i, 'name', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Titel">
                      <input value={contact.title ?? ''} onChange={(e) => setContact(i, 'title', e.target.value)} className={inputClass} placeholder="T.ex. Inköpschef" />
                    </Field>
                    <Field label="Telefon">
                      <input value={contact.phone} onChange={(e) => setContact(i, 'phone', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="E-post">
                      <input type="email" value={contact.email} onChange={(e) => setContact(i, 'email', e.target.value)} className={inputClass} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anläggningar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-slate-900">Anläggningar</h2>
              <button type="button" onClick={addFacility} className="flex items-center gap-1.5 text-[12px] font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Lägg till anläggning
              </button>
            </div>
            {facilities.length === 0 ? (
              <p className="text-[12px] text-slate-400 italic">Inga anläggningar tillagda</p>
            ) : (
              <div className="space-y-3">
                {facilities.map((f, fi) => {
                  const isOpen = openFacility === fi;
                  return (
                    <div key={fi} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-3 p-3 bg-slate-50">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <input
                          value={f.name}
                          onChange={(e) => setFacility(fi, 'name', e.target.value)}
                          className="flex-1 text-[13px] font-medium bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400"
                          placeholder="Anläggningsnamn"
                        />
                        <button
                          type="button"
                          onClick={() => setOpenFacility(isOpen ? null : fi)}
                          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                        >
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <button type="button" onClick={() => removeFacility(fi)} className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {isOpen && (
                        <div className="p-4 space-y-4 border-t border-slate-100">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-3">
                              <Field label="Adress">
                                <input value={f.address} onChange={(e) => setFacility(fi, 'address', e.target.value)} className={inputClass} placeholder="Storgatan 1" />
                              </Field>
                            </div>
                            <Field label="Postnummer">
                              <input value={f.zip ?? ''} onChange={(e) => setFacility(fi, 'zip', e.target.value)} className={inputClass} placeholder="123 45" />
                            </Field>
                            <div className="md:col-span-2">
                              <Field label="Ort">
                                <input value={f.city} onChange={(e) => setFacility(fi, 'city', e.target.value)} className={inputClass} placeholder="Stockholm" />
                              </Field>
                            </div>
                          </div>

                          {/* Kontakter för denna anläggning */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Kontakter</p>
                              <button type="button" onClick={() => addFacilityContact(fi)} className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                                <Plus className="w-3 h-3" /> Lägg till
                              </button>
                            </div>
                            {(f.contacts ?? []).length === 0 ? (
                              <p className="text-[12px] text-slate-400 italic">Inga kontakter</p>
                            ) : (
                              <div className="space-y-2">
                                {(f.contacts ?? []).map((c, ci) => (
                                  <div key={ci} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start bg-slate-50 rounded-lg p-3">
                                    <Field label="Namn">
                                      <input value={c.name} onChange={(e) => setFacilityContact(fi, ci, 'name', e.target.value)} className={inputClass} />
                                    </Field>
                                    <Field label="Titel">
                                      <input value={c.title ?? ''} onChange={(e) => setFacilityContact(fi, ci, 'title', e.target.value)} className={inputClass} placeholder="Titel" />
                                    </Field>
                                    <Field label="Telefon">
                                      <input value={c.phone} onChange={(e) => setFacilityContact(fi, ci, 'phone', e.target.value)} className={inputClass} />
                                    </Field>
                                    <div className="flex gap-2 items-end">
                                      <div className="flex-1">
                                        <Field label="E-post">
                                          <input type="email" value={c.email} onChange={(e) => setFacilityContact(fi, ci, 'email', e.target.value)} className={inputClass} />
                                        </Field>
                                      </div>
                                      <button type="button" onClick={() => removeFacilityContact(fi, ci)} className="mb-0.5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer pb-2">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fakturaadress */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Fakturaadress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Adress">
                  <input value={form.invoiceStreet} onChange={(e) => set('invoiceStreet', e.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="Postnummer">
                <input value={form.invoiceZip} onChange={(e) => set('invoiceZip', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Ort">
                <input value={form.invoiceCity} onChange={(e) => set('invoiceCity', e.target.value)} className={inputClass} />
              </Field>
            </div>
          </div>

          {/* Leveransadress */}
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
                    <input value={form.deliveryStreet} onChange={(e) => set('deliveryStreet', e.target.value)} className={inputClass} />
                  </Field>
                </div>
                <Field label="Postnummer">
                  <input value={form.deliveryZip} onChange={(e) => set('deliveryZip', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Ort">
                  <input value={form.deliveryCity} onChange={(e) => set('deliveryCity', e.target.value)} className={inputClass} />
                </Field>
              </div>
            )}
          </div>

          {/* Anteckningar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Anteckningar</h2>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="Interna anteckningar om kunden..." />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link href={`/customers/${id}`} className="px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Avbryt
            </Link>
            <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
              <Save className="w-4 h-4" /> Spara ändringar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
