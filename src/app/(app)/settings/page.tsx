'use client';
import { useState, useEffect } from 'react';
import { Save, User, Building2, Bell, Globe, Mail, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const inputClass = 'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white';

const TABS = [
  { id: 'company', label: 'Företagsinformation', icon: Building2 },
  { id: 'users', label: 'Användare', icon: User },
  { id: 'notifications', label: 'Notiser', icon: Bell },
  { id: 'integrations', label: 'Integrationer', icon: Globe },
] as const;

type Tab = (typeof TABS)[number]['id'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [saved, setSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
            {activeTab === 'company' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Företagsinformation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Företagsnamn', value: 'FleetRent Sverige AB', placeholder: '' },
                    { label: 'Organisationsnummer', value: '556000-1234', placeholder: '' },
                    { label: 'E-post', value: 'info@fleetrent.se', placeholder: '' },
                    { label: 'Telefon', value: '08-123 45 67', placeholder: '' },
                    { label: 'Adress', value: 'Industrivägen 1', placeholder: '' },
                    { label: 'Postnummer och ort', value: '141 50 Huddinge', placeholder: '' },
                  ].map(({ label, value, placeholder }) => (
                    <div key={label}>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
                      <input defaultValue={value} placeholder={placeholder} className={inputClass} />
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Standardvillkor</label>
                  <textarea className={`${inputClass} resize-none`} rows={4} defaultValue="Hyrestagaren ansvarar för att maskinen hanteras på ett säkert och korrekt sätt. Eventuella skador på maskinen debiteras hyrestagaren. Hyrestiden räknas från leveransdatum till returdatum." />
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    <Save className="w-4 h-4" />
                    {saved ? 'Sparat!' : 'Spara ändringar'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                {/* Current user */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="font-semibold text-slate-900 mb-4">Teammedlemmar</h2>
                  {currentUser && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                          {(currentUser.user_metadata?.full_name || currentUser.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {currentUser.user_metadata?.full_name || currentUser.email}
                            <span className="ml-2 text-xs text-blue-600">(Du)</span>
                          </p>
                          <p className="text-xs text-slate-500">{currentUser.email}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full">Admin</span>
                    </div>
                  )}
                </div>

                {/* Invite */}
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
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
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

            {activeTab === 'integrations' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-1">Integrationer</h2>
                <p className="text-sm text-slate-500 mb-6">Anslut FleetRent till externa system</p>
                <div className="space-y-4">
                  {[
                    { name: 'Fortnox', desc: 'Automatisk fakturaexport och synkronisering', status: 'Kommer snart' },
                    { name: 'Visma', desc: 'Bokföring och fakturahantering', status: 'Kommer snart' },
                    { name: 'SMS-tjänst', desc: 'Automatiska SMS-påminnelser till kunder', status: 'Kommer snart' },
                    { name: 'GPS/IoT', desc: 'Realtidsspårning av maskinernas position', status: 'Kommande' },
                    { name: 'Digital signering', desc: 'Elektronisk signering av hyresavtal', status: 'Kommande' },
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{integration.name}</p>
                        <p className="text-xs text-slate-500">{integration.desc}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">{integration.status}</span>
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
