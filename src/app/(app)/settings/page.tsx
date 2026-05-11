'use client';
import { useState } from 'react';
import { Save, User, Building2, Bell, Shield, Globe } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useStore } from '@/store';

const inputClass = 'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white';

const TABS = [
  { id: 'company', label: 'Företagsinformation', icon: Building2 },
  { id: 'users', label: 'Användare', icon: User },
  { id: 'notifications', label: 'Notiser', icon: Bell },
  { id: 'integrations', label: 'Integrationer', icon: Globe },
] as const;

type Tab = (typeof TABS)[number]['id'];

export default function SettingsPage() {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Användare och behörigheter</h2>
                <div className="space-y-3">
                  {[
                    { name: 'Anna Lindström', email: 'anna@fleetrent.se', role: 'Administratör', active: true },
                    { name: 'Erik Johansson', email: 'erik@fleetrent.se', role: 'Säljare', active: true },
                    { name: 'Lars Petersson', email: 'lars@fleetrent.se', role: 'Verkstad', active: true },
                  ].map((user) => (
                    <div key={user.email} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{user.name}
                            {user.email === currentUser?.email && <span className="ml-2 text-xs text-blue-600">(Du)</span>}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-full">{user.role}</span>
                        <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Aktiv</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full py-2.5 border border-dashed border-slate-300 text-slate-500 text-sm rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors">
                  + Bjud in användare
                </button>
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
