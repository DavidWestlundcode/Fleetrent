'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, X, CheckCircle2, AlertTriangle } from 'lucide-react';

const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

export function CreateOrgForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState('');

  const reset = () => {
    setName('');
    setAdminEmail('');
    setError('');
    setWarning('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Organisationsnamn krävs');
      return;
    }
    setSaving(true);
    setError('');
    setWarning('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/create-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, adminEmail: adminEmail.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Något gick fel');
        return;
      }
      setSuccess(`"${data.organization.name}" skapad.`);
      if (data.warning) setWarning(data.warning);
      setName('');
      setAdminEmail('');
      router.refresh();
    } catch {
      setError('Något gick fel');
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); reset(); }}
        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Ny organisation
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900 text-sm">Ny organisation</h2>
        <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Organisationsnamn</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="T.ex. WTS Nord"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Admin-e-post (valfri)</label>
          <input
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="namn@företag.se"
            className={inputClass}
          />
          <p className="text-[11px] text-slate-400 mt-1">Måste vara ett befintligt konto — får medlemskap i den nya organisationen och kan byta dit via bolagsväljaren.</p>
        </div>
      </div>

      {error && <p className="mb-3 text-[13px] text-red-600">{error}</p>}
      {warning && (
        <p className="mb-3 flex items-start gap-1.5 text-[13px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {warning}
        </p>
      )}
      {success && !warning && (
        <p className="mb-3 flex items-center gap-1.5 text-[13px] text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" /> {success}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {saving ? 'Skapar...' : 'Skapa organisation'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg border border-slate-200 transition-colors"
        >
          Stäng
        </button>
      </div>
    </div>
  );
}
