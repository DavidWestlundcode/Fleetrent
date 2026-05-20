'use client';
import { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';

const PLANS = [
  { value: 'basic',   label: 'Basic',   color: 'bg-slate-100 text-slate-700' },
  { value: 'premium', label: 'Premium', color: 'bg-blue-100 text-blue-700' },
  { value: 'enterprise', label: 'Enterprise', color: 'bg-purple-100 text-purple-700' },
];

type Props = {
  orgId: string;
  currentPlan: string;
  currentMaxUsers: number;
  currentMaxMachines: number;
};

export function PlanEditor({ orgId, currentPlan, currentMaxUsers, currentMaxMachines }: Props) {
  const [plan, setPlan] = useState(currentPlan ?? 'basic');
  const [maxUsers, setMaxUsers] = useState(currentMaxUsers ?? 5);
  const [maxMachines, setMaxMachines] = useState(currentMaxMachines ?? 15);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch('/api/admin/update-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, plan, max_users: maxUsers, max_machines: maxMachines }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-slate-900">Plan & gränser</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Styr vad kunden har tillgång till</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? 'Sparat!' : saving ? 'Sparar...' : 'Spara'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Plan</label>
          <select value={plan} onChange={e => setPlan(e.target.value)} className={inputClass}>
            {PLANS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Max användare</label>
          <input
            type="number"
            min={1}
            max={999}
            value={maxUsers}
            onChange={e => setMaxUsers(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Max maskiner</label>
          <input
            type="number"
            min={1}
            max={9999}
            value={maxMachines}
            onChange={e => setMaxMachines(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <p className="text-[12px] text-slate-500">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold mr-2 ${PLANS.find(p => p.value === plan)?.color}`}>
            {PLANS.find(p => p.value === plan)?.label}
          </span>
          Upp till <strong>{maxUsers} användare</strong> och <strong>{maxMachines} maskiner</strong>
        </p>
      </div>
    </div>
  );
}
