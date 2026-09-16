'use client';
import { useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Org = { id: string; name: string };

export default function OrgSwitcher({
  userId,
  activeOrgId,
  displayName,
  initials,
  roleLabel,
}: {
  userId: string;
  activeOrgId: string | null;
  displayName: string;
  initials: string;
  roleLabel: string;
}) {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [open, setOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('organization_members')
      .select('organization_id, organizations(name)')
      .eq('user_id', userId)
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as { organization_id: string; organizations: { name: string } | null }[];
        setOrgs(rows.map((r) => ({ id: r.organization_id, name: r.organizations?.name ?? 'Okänd organisation' })));
      });
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleSwitch = async (orgId: string) => {
    if (orgId === activeOrgId) { setOpen(false); return; }
    setSwitchingId(orgId);
    setError('');
    try {
      const res = await fetch('/api/switch-organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Något gick fel'); setSwitchingId(null); return; }
      // Hard reload — the store initializes exactly once and guards against
      // re-running, so a soft refresh would keep showing the previous org's
      // data. Same mechanism the logout button already uses.
      window.location.href = '/dashboard';
    } catch {
      setError('Något gick fel');
      setSwitchingId(null);
    }
  };

  const avatarRow = (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[11px] font-bold shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[12.5px] font-medium text-white truncate leading-[1.3]">{displayName}</p>
        <p className="text-[11px] text-[#4B5568] leading-[1.3]">{roleLabel}</p>
      </div>
    </div>
  );

  // Fewer than 2 orgs — no switcher needed, render exactly today's static block.
  if (orgs.length < 2) return <div className="mb-0.5">{avatarRow}</div>;

  return (
    <div className="relative mb-0.5" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0">{avatarRow}</div>
        <ChevronsUpDown className="w-3.5 h-3.5 text-[#4B5568] shrink-0 mr-2.5" />
      </button>

      {open && (
        <div className="absolute bottom-full left-2.5 right-2.5 mb-2 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 z-50 overflow-hidden">
          <p className="px-3.5 pt-3 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Byt bolag</p>
          <div className="py-1">
            {orgs.map((org) => {
              const isActive = org.id === activeOrgId;
              const isSwitching = switchingId === org.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  disabled={isActive || switchingId !== null}
                  onClick={() => handleSwitch(org.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] transition-colors ${
                    isActive ? 'text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
                  } disabled:cursor-default`}
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="flex-1 truncate">{org.name}</span>
                  {isSwitching ? (
                    <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin shrink-0" />
                  ) : isActive ? (
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>
          {error && <p className="px-3.5 pb-3 text-[11px] text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
