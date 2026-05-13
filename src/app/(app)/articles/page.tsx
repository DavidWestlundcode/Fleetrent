'use client';
import { useState, useRef } from 'react';
import { Plus, Package, Edit, Trash2, Hash } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils';
import {
  ARTICLE_TYPE_LABELS,
  ARTICLE_TYPE_COLORS,
  ARTICLE_UNIT_LABELS,
  type ArticleType,
  type ArticleUnit,
} from '@/lib/types';

const inputClass =
  'w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all';

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
  articleNumber: '',
  name: '',
  description: '',
  type: 'hyra' as ArticleType,
  unit: 'dag' as ArticleUnit,
  defaultPrice: 0,
  accountNumber: '',
  vatRate: 25,
  isActive: true,
};

export default function ArticlesPage() {
  const { articles, templates, addArticle, updateArticle, deleteArticle } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const editIdRef = useRef<string | null>(null);
  const formRef = useRef(emptyForm);

  const set = (field: string, value: string | number | boolean) => {
    const next = { ...formRef.current, [field]: value };
    formRef.current = next;
    setForm(next);
  };

  const openCreate = () => {
    editIdRef.current = null;
    formRef.current = emptyForm;
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    const a = articles.find((a) => a.id === id);
    if (!a) return;
    const next = {
      articleNumber: a.articleNumber,
      name: a.name,
      description: a.description,
      type: a.type,
      unit: a.unit,
      defaultPrice: a.defaultPrice,
      accountNumber: a.accountNumber,
      vatRate: a.vatRate,
      isActive: a.isActive,
    };
    formRef.current = next;
    editIdRef.current = id;
    setForm(next);
    setEditId(id);
    setShowForm(true);
  };

  const closeForm = () => {
    editIdRef.current = null;
    formRef.current = emptyForm;
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentId = editIdRef.current;
    const currentForm = formRef.current;
    if (currentId) {
      updateArticle(currentId, currentForm);
    } else {
      addArticle(currentForm);
    }
    closeForm();
  };

  const getTemplateUsage = (articleId: string) => {
    return templates.filter(
      (t) =>
        t.rentalArticleId === articleId ||
        t.insuranceArticleId === articleId ||
        t.transportArticleId === articleId ||
        t.depositArticleId === articleId
    ).length;
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-slate-50/60">
      <Header
        title="Artikelregister"
        subtitle="Koppla artiklar till prismallar för fakturamatchning mot t.ex. Fortnox"
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-[7px] bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Ny artikel
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-5">
        {showForm && (
          <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-5">
              {editId ? 'Redigera artikel' : 'Ny artikel'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Identity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Artikelnummer *" hint="Matchar artikelnummer i t.ex. Fortnox">
                  <input
                    required
                    value={form.articleNumber}
                    onChange={(e) => set('articleNumber', e.target.value)}
                    className={inputClass}
                    placeholder="T.ex. 1001 eller HYRA-01"
                  />
                </Field>
                <Field label="Artikelnamn *">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className={inputClass}
                    placeholder="T.ex. Maskinuthyrning"
                  />
                </Field>
                <Field label="Typ">
                  <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputClass}>
                    {Object.entries(ARTICLE_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Pricing */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Prissättning</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Enhet">
                    <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className={inputClass}>
                      {Object.entries(ARTICLE_UNIT_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Standardpris (kr)" hint="Kan åsidosättas i prismall">
                    <input
                      type="number"
                      value={form.defaultPrice}
                      onChange={(e) => set('defaultPrice', Number(e.target.value))}
                      className={inputClass}
                      min={0}
                    />
                  </Field>
                  <Field label="Momssats (%)">
                    <select
                      value={form.vatRate}
                      onChange={(e) => set('vatRate', Number(e.target.value))}
                      className={inputClass}
                    >
                      <option value={0}>0%</option>
                      <option value={6}>6%</option>
                      <option value={12}>12%</option>
                      <option value={25}>25%</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* Accounting */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Bokföringskonto" hint="T.ex. 3050 för hyresintäkter">
                  <input
                    value={form.accountNumber}
                    onChange={(e) => set('accountNumber', e.target.value)}
                    className={inputClass}
                    placeholder="3050"
                  />
                </Field>
                <Field label="Beskrivning">
                  <input
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    className={inputClass}
                    placeholder="Valfri intern beskrivning"
                  />
                </Field>
              </div>

              {/* Active */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => set('isActive', !form.isActive)}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${form.isActive ? 'bg-blue-500' : 'bg-slate-200'}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form.isActive ? 'translate-x-4' : ''}`}
                  />
                </div>
                <span className="text-[13px] font-medium text-slate-700">Aktiv artikel</span>
              </label>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-[13px] text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {editId ? 'Spara ändringar' : 'Skapa artikel'}
                </button>
              </div>
            </form>
          </div>
        )}

        {articles.length === 0 && !showForm && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm py-16 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-[13px] text-slate-400">Inga artiklar skapade ännu</p>
            <p className="text-[11px] text-slate-300 mt-1">
              Skapa artiklar och koppla dem till prismallar för fakturaexport
            </p>
          </div>
        )}

        {articles.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-4 items-center px-5 py-2.5 border-b border-slate-100 bg-slate-50/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Art.nr</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Namn</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Typ</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Enhet</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pris</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Konto</span>
              <span />
            </div>
            <div className="divide-y divide-slate-100">
              {articles.map((article) => {
                const usage = getTemplateUsage(article.id);
                return (
                  <div
                    key={article.id}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-4 items-center px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Article number */}
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3 h-3 text-slate-300" />
                      <span className="text-[13px] font-mono font-semibold text-slate-700">
                        {article.articleNumber}
                      </span>
                    </div>

                    {/* Name + description */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-slate-800 truncate">{article.name}</span>
                        {!article.isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-md">
                            Inaktiv
                          </span>
                        )}
                      </div>
                      {article.description && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{article.description}</p>
                      )}
                      {usage > 0 && (
                        <p className="text-[11px] text-blue-500 mt-0.5">
                          Används i {usage} prismall{usage !== 1 ? 'ar' : ''}
                        </p>
                      )}
                    </div>

                    {/* Type badge */}
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${ARTICLE_TYPE_COLORS[article.type]}`}
                    >
                      {ARTICLE_TYPE_LABELS[article.type]}
                    </span>

                    {/* Unit */}
                    <span className="text-[12px] text-slate-500">{ARTICLE_UNIT_LABELS[article.unit]}</span>

                    {/* Price */}
                    <span className="text-[12px] font-medium text-slate-700 text-right">
                      {article.defaultPrice > 0 ? formatCurrency(article.defaultPrice) : '–'}
                    </span>

                    {/* Account */}
                    <span className="text-[12px] text-slate-500 font-mono">
                      {article.accountNumber || '–'}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(article.id)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Radera artikel?')) deleteArticle(article.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
