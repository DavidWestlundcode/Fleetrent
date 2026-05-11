'use client';
import { useState } from 'react';
import { Plus, Tag, Edit, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils';
import { CATEGORY_LABELS, type MachineCategory } from '@/lib/types';

const inputClass = 'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function TemplatesPage() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', category: 'motviktstruck' as MachineCategory,
    dailyPrice: 0, weeklyPrice: 0, monthlyPrice: 0,
    startFee: 0, transportCost: 0, deposit: 0, minRentalDays: 1,
    standardTerms: '', internalNote: '',
  });

  const set = (field: string, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  const openEdit = (id: string) => {
    const t = templates.find((t) => t.id === id);
    if (!t) return;
    setForm({
      name: t.name, description: t.description, category: t.category,
      dailyPrice: t.dailyPrice, weeklyPrice: t.weeklyPrice, monthlyPrice: t.monthlyPrice,
      startFee: t.startFee, transportCost: t.transportCost, deposit: t.deposit,
      minRentalDays: t.minRentalDays, standardTerms: t.standardTerms, internalNote: t.internalNote,
    });
    setEditId(id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateTemplate(editId, form);
    } else {
      addTemplate(form);
    }
    setShowForm(false);
    setEditId(null);
    setForm({ name: '', description: '', category: 'motviktstruck', dailyPrice: 0, weeklyPrice: 0, monthlyPrice: 0, startFee: 0, transportCost: 0, deposit: 0, minRentalDays: 1, standardTerms: '', internalNote: '' });
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header
        title="Prismallar"
        subtitle="Hantera uthyrningsmallar och standardpriser"
        actions={
          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ny prismall
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {showForm && (
          <div className="bg-white rounded-xl border border-blue-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">{editId ? 'Redigera prismall' : 'Ny prismall'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Namn *">
                  <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} placeholder="T.ex. Motviktstruck 1–1,9 ton" />
                </Field>
                <Field label="Kategori">
                  <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Beskrivning">
                    <input value={form.description} onChange={(e) => set('description', e.target.value)} className={inputClass} />
                  </Field>
                </div>
                <Field label="Dagspris (kr)">
                  <input type="number" value={form.dailyPrice} onChange={(e) => set('dailyPrice', Number(e.target.value))} className={inputClass} min={0} />
                </Field>
                <Field label="Veckopris (kr)">
                  <input type="number" value={form.weeklyPrice} onChange={(e) => set('weeklyPrice', Number(e.target.value))} className={inputClass} min={0} />
                </Field>
                <Field label="Månadspris (kr)">
                  <input type="number" value={form.monthlyPrice} onChange={(e) => set('monthlyPrice', Number(e.target.value))} className={inputClass} min={0} />
                </Field>
                <Field label="Startavgift (kr)">
                  <input type="number" value={form.startFee} onChange={(e) => set('startFee', Number(e.target.value))} className={inputClass} min={0} />
                </Field>
                <Field label="Transportkostnad (kr)">
                  <input type="number" value={form.transportCost} onChange={(e) => set('transportCost', Number(e.target.value))} className={inputClass} min={0} />
                </Field>
                <Field label="Deposition (kr)">
                  <input type="number" value={form.deposit} onChange={(e) => set('deposit', Number(e.target.value))} className={inputClass} min={0} />
                </Field>
                <Field label="Min. hyresperiod (dagar)">
                  <input type="number" value={form.minRentalDays} onChange={(e) => set('minRentalDays', Number(e.target.value))} className={inputClass} min={1} />
                </Field>
              </div>
              <Field label="Standardvillkor">
                <textarea value={form.standardTerms} onChange={(e) => set('standardTerms', e.target.value)} className={`${inputClass} resize-none`} rows={3} />
              </Field>
              <Field label="Intern anteckning">
                <textarea value={form.internalNote} onChange={(e) => set('internalNote', e.target.value)} className={`${inputClass} resize-none`} rows={2} />
              </Field>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Avbryt</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  {editId ? 'Spara ändringar' : 'Skapa mall'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Tag className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{template.name}</h3>
                    <p className="text-xs text-slate-500">{CATEGORY_LABELS[template.category]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(template.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => { if (confirm('Radera mall?')) deleteTemplate(template.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {template.description && (
                <p className="text-xs text-slate-500 mb-3">{template.description}</p>
              )}

              <div className="space-y-2">
                {[
                  { label: 'Dagspris', value: `${formatCurrency(template.dailyPrice)}/dag` },
                  { label: 'Veckopris', value: `${formatCurrency(template.weeklyPrice)}/vecka` },
                  { label: 'Månadspris', value: `${formatCurrency(template.monthlyPrice)}/mån` },
                  { label: 'Transport', value: formatCurrency(template.transportCost) },
                  { label: 'Deposition', value: formatCurrency(template.deposit) },
                  { label: 'Min. period', value: `${template.minRentalDays} dag${template.minRentalDays !== 1 ? 'ar' : ''}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-700">{value}</span>
                  </div>
                ))}
              </div>

              {template.internalNote && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 italic">{template.internalNote}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
