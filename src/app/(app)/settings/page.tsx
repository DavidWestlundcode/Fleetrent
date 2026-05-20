'use client';
import { useState, useEffect, useCallback } from 'react';
import { Save, User, Building2, Bell, Globe, Mail, Loader2, CheckCircle2, XCircle, Link2, Link2Off, Shield } from 'lucide-react';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useStore } from '@/store';

const inputClass = 'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white';

const TABS = [
  { id: 'company', label: 'Företagsinformation', icon: Building2 },
  { id: 'users', label: 'Användare', icon: User },
  { id: 'notifications', label: 'Notiser', icon: Bell },
  { id: 'integrations', label: 'Integrationer', icon: Globe },
] as const;

type Tab = (typeof TABS)[number]['id'];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  saljare: 'Säljare',
  verkstad: 'Verkstad',
};

function FortnoxCard() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [connectedAt, setConnectedAt] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadStatus = useCallback(async () => {
    const res = await fetch('/api/fortnox/status');
    const data = await res.json();
    setStatus(data.connected ? 'connected' : 'disconnected');
    setConnectedAt(data.connectedAt);
  }, []);

  useEffect(() => {
    loadStatus();
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    if (success === 'fortnox_connected') setFeedback({ type: 'success', msg: 'Fortnox ansluten!' });
    if (error === 'fortnox_denied') setFeedback({ type: 'error', msg: 'Åtkomst nekad av Fortnox.' });
    if (error === 'token_exchange') setFeedback({ type: 'error', msg: 'Kunde inte hämta token från Fortnox.' });
    if (error === 'fortnox_not_configured') setFeedback({ type: 'error', msg: 'FORTNOX_CLIENT_ID saknas i miljövariabler.' });
  }, [loadStatus, searchParams]);

  const handleDisconnect = async () => {
    if (!confirm('Koppla bort Fortnox-integrationen?')) return;
    setDisconnecting(true);
    await fetch('/api/fortnox/disconnect', { method: 'POST' });
    setStatus('disconnected');
    setConnectedAt(null);
    setDisconnecting(false);
    setFeedback({ type: 'success', msg: 'Fortnox frånkopplat.' });
  };

  return (
    <div className="border border-slate-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00a651]/10 flex items-center justify-center shrink-0">
            <span className="text-[#00a651] font-bold text-sm">FX</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Fortnox</p>
            <p className="text-xs text-slate-500">Skapa ordrar automatiskt i Fortnox vid fakturering</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          {status === 'connected' && (
            <>
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Ansluten
              </span>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Link2Off className="w-3.5 h-3.5" />
                {disconnecting ? 'Kopplar bort...' : 'Koppla bort'}
              </button>
            </>
          )}
          {status === 'disconnected' && (
            <a
              href="/api/fortnox/auth"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#00a651] rounded-lg hover:bg-[#009046] transition-colors cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5" />
              Anslut Fortnox
            </a>
          )}
        </div>
      </div>
      {status === 'connected' && connectedAt && (
        <p className="mt-3 text-xs text-slate-400">
          Ansluten {new Date(connectedAt).toLocaleDateString('sv-SE', { dateStyle: 'long' })}
        </p>
      )}
      {feedback && (
        <div className={`mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {feedback.msg}
        </div>
      )}
    </div>
  );
}

type OrgForm = {
  name: string;
  orgNumber: string;
  email: string;
  phone: string;
  address: string;
  postalCity: string;
  standardTerms: string;
};

type Member = {
  id: string;
  fullName: string;
  role: string;
};

function SettingsInner() {
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [inviteError, setInviteError] = useState('');

  const { userId } = useStore();

  const [org, setOrg] = useState<OrgForm>({
    name: '',
    orgNumber: '',
    email: '',
    phone: '',
    address: '',
    postalCity: '',
    standardTerms: '',
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('tab') === 'integrations') setActiveTab('integrations');
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (!user) { setOrgLoading(false); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      const oid = profile?.organization_id as string | null;
      setOrgId(oid);

      if (oid) {
        const [orgRes, membersRes] = await Promise.all([
          supabase.from('organizations').select('*').eq('id', oid).single(),
          supabase.from('profiles').select('id, full_name, role').eq('organization_id', oid),
        ]);

        if (orgRes.data) {
          const d = orgRes.data as Record<string, string>;
          setOrg({
            name: d.name ?? '',
            orgNumber: d.org_number ?? '',
            email: d.email ?? '',
            phone: d.phone ?? '',
            address: d.address ?? '',
            postalCity: d.postal_city ?? '',
            standardTerms: d.standard_terms ?? '',
          });
        }

        setMembers(
          (membersRes.data ?? []).map((r) => ({
            id: r.id as string,
            fullName: (r.full_name as string) || 'Okänd användare',
            role: (r.role as string) || 'saljare',
          }))
        );
      }

      setOrgLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!orgId) return;
    setSaving(true);
    setSaveError('');
    const supabase = createClient();
    const { error } = await supabase
      .from('organizations')
      .update({
        name: org.name,
        org_number: org.orgNumber,
        email: org.email,
        phone: org.phone,
        address: org.address,
        postal_city: org.postalCity,
        standard_terms: org.standardTerms,
      })
      .eq('id', orgId);

    setSaving(false);
    if (error) {
      setSaveError('Kunde inte spara. Försök igen.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatus('loading');
    setInviteError('');
    try {
      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInviteStatus('success');
      setInviteEmail('');
      setTimeout(() => setInviteStatus('idle'), 4000);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Något gick fel');
      setInviteStatus('error');
    }
  };

  const setField = (field: keyof OrgForm, value: string) =>
    setOrg((p) => ({ ...p, [field]: value }));

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Inställningar" />

      <div className="flex-1 p-6">
        <div className="flex gap-6 max-w-5xl mx-auto">
          {/* Sidebar Nav */}
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">

            {/* ---- FÖRETAGSINFORMATION ---- */}
            {activeTab === 'company' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Företagsinformation</h2>

                {orgLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Laddar...
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Företagsnamn</label>
                        <input value={org.name} onChange={(e) => setField('name', e.target.value)} className={inputClass} placeholder="Ert företagsnamn" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Organisationsnummer</label>
                        <input value={org.orgNumber} onChange={(e) => setField('orgNumber', e.target.value)} className={inputClass} placeholder="556000-0000" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">E-post</label>
                        <input type="email" value={org.email} onChange={(e) => setField('email', e.target.value)} className={inputClass} placeholder="info@ertforetag.se" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Telefon</label>
                        <input value={org.phone} onChange={(e) => setField('phone', e.target.value)} className={inputClass} placeholder="08-123 45 67" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Adress</label>
                        <input value={org.address} onChange={(e) => setField('address', e.target.value)} className={inputClass} placeholder="Industrivägen 1" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Postnummer och ort</label>
                        <input value={org.postalCity} onChange={(e) => setField('postalCity', e.target.value)} className={inputClass} placeholder="141 50 Huddinge" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Standardvillkor</label>
                      <textarea
                        value={org.standardTerms}
                        onChange={(e) => setField('standardTerms', e.target.value)}
                        className={`${inputClass} resize-none`}
                        rows={4}
                        placeholder="Era standardvillkor för maskinuthyrning..."
                      />
                    </div>
                    {saveError && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                        <XCircle className="w-4 h-4 shrink-0" /> {saveError}
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saved ? 'Sparat!' : saving ? 'Sparar...' : 'Spara ändringar'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ---- ANVÄNDARE ---- */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="font-semibold text-slate-900 mb-4">Teammedlemmar</h2>
                  {members.length === 0 ? (
                    <p className="text-sm text-slate-400">Inga medlemmar hittades.</p>
                  ) : (
                    <div className="space-y-2">
                      {members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                              {m.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {m.fullName}
                                {m.id === (userId ?? currentUser?.id) && (
                                  <span className="ml-2 text-xs text-blue-600">(Du)</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {m.role === 'admin' && (
                              <Shield className="w-3.5 h-3.5 text-blue-500" />
                            )}
                            <span className={`text-xs px-2.5 py-1 rounded-full border ${
                              m.role === 'admin'
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : m.role === 'verkstad'
                                ? 'bg-orange-50 border-orange-200 text-orange-700'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}>
                              {ROLE_LABELS[m.role] ?? m.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="font-semibold text-slate-900 mb-1">Bjud in medarbetare</h2>
                  <p className="text-sm text-slate-500 mb-4">De får ett e-postmeddelande med en länk för att skapa sitt konto och ansluta till ditt företag.</p>
                  <form onSubmit={handleInvite} className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="medarbetare@foretag.se"
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={inviteStatus === 'loading'}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      {inviteStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Skicka inbjudan
                    </button>
                  </form>
                  {inviteStatus === 'success' && (
                    <div className="flex items-center gap-2 mt-3 text-emerald-700 text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Inbjudan skickad!
                    </div>
                  )}
                  {inviteStatus === 'error' && (
                    <div className="flex items-center gap-2 mt-3 text-red-600 text-sm">
                      <XCircle className="w-4 h-4" /> {inviteError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---- NOTISER ---- */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Notifikationer</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Försenade returer', desc: 'Notis när en maskin inte returneras i tid', enabled: true },
                    { label: 'Kommande returer', desc: 'Påminnelse 3 dagar innan planerad retur', enabled: true },
                    { label: 'Service påminnelse', desc: 'Notis när service är planerad om 7 dagar', enabled: true },
                    { label: 'Ny order', desc: 'E-post vid ny order skapad', enabled: false },
                    { label: 'Maskinskada', desc: 'Omedelbar notis vid registrerad skada', enabled: true },
                  ].map((setting) => (
                    <div key={setting.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{setting.label}</p>
                        <p className="text-xs text-slate-500">{setting.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---- INTEGRATIONER ---- */}
            {activeTab === 'integrations' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-1">Integrationer</h2>
                <p className="text-sm text-slate-500 mb-6">Anslut FleetOS till externa system</p>
                <div className="space-y-4">
                  <Suspense fallback={<div className="h-20 bg-slate-50 rounded-xl animate-pulse" />}>
                    <FortnoxCard />
                  </Suspense>
                  {[
                    { name: 'Visma', desc: 'Bokföring och fakturahantering' },
                    { name: 'SMS-tjänst', desc: 'Automatiska SMS-påminnelser till kunder' },
                    { name: 'GPS/IoT', desc: 'Realtidsspårning av maskinernas position' },
                    { name: 'Digital signering', desc: 'Elektronisk signering av hyresavtal' },
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-5 border border-slate-200 rounded-xl opacity-50">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{integration.name}</p>
                        <p className="text-xs text-slate-500">{integration.desc}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">Kommer snart</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsInner />
    </Suspense>
  );
}
