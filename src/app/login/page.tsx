'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Zap, Lock, Mail, Eye, EyeOff, ArrowLeft, X, User, Building2, Phone, MessageSquare, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function LoginPageInner() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') ?? '/dashboard';
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const [showLead, setShowLead] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState('');
  const [lead, setLead] = useState({ name: '', company: '', email: '', phone: '', machines: '', message: '' });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        setInfo('Återställningslänk skickad! Kontrollera din e-post.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = window.location.origin + nextUrl;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Något gick fel. Försök igen.';
      setError(
        msg === 'Invalid login credentials' ? 'Felaktig e-post eller lösenord.'
        : msg === 'Email not confirmed' ? 'Verifiera din e-post innan du loggar in.'
        : msg
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadLoading(true);
    setLeadError('');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error('Kunde inte skicka formuläret.');
      setLeadSent(true);
    } catch (err: unknown) {
      setLeadError(err instanceof Error ? err.message : 'Något gick fel. Försök igen.');
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Left panel */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-xl">FleetRent</span>
          </Link>

          <div className="max-w-md">
            <blockquote className="text-2xl font-medium text-white leading-relaxed mb-6">
              "FleetRent gav oss full kontroll över flottan på första dagen. Allt på ett ställe."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">M</div>
              <div>
                <p className="text-white font-medium">Magnus Eriksson</p>
                <p className="text-slate-400 text-sm">VD, Eriksson Maskinuthyrning AB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Maskiner spårade', value: '500+' },
              { label: 'Order per år', value: '10 000+' },
              { label: 'Nöjda kunder', value: '98%' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-slate-400 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between mb-8 lg:hidden">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">FleetRent</span>
              </Link>
            </div>

            {mode === 'forgot' ? (
              <>
                <button
                  onClick={() => { setMode('login'); setError(''); setInfo(''); }}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
                >
                  <ArrowLeft className="w-4 h-4" /> Tillbaka till inloggning
                </button>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Glömt lösenord?</h2>
                <p className="text-slate-500 mb-8 text-sm">Vi skickar en länk för att återställa ditt lösenord.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">E-postadress</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email" required value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="namn@foretag.se"
                      />
                    </div>
                  </div>
                  {info && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">{info}</div>}
                  {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
                    {loading ? 'Skickar...' : 'Skicka återställningslänk'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Välkommen tillbaka</h2>
                  <p className="text-slate-500 text-sm">Logga in på ditt FleetRent-konto</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">E-postadress</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email" required value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="namn@foretag.se"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-slate-700">Lösenord</label>
                      <button type="button" onClick={() => setMode('forgot')} className="text-xs text-blue-600 hover:text-blue-700">
                        Glömt lösenord?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPass ? 'text' : 'password'} required value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {info && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">{info}</div>}
                  {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>}

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? 'Loggar in...' : 'Logga in'}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-200 text-center">
                  <p className="text-sm text-slate-500 mb-3">Inte kund än?</p>
                  <button
                    onClick={() => { setShowLead(true); setLeadSent(false); setLeadError(''); }}
                    className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all"
                  >
                    Kom igång med FleetRent
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lead modal */}
      {showLead && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 py-8">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Kom igång med FleetRent</h2>
                <p className="text-sm text-slate-500 mt-0.5">Vi hör av oss inom 24 timmar</p>
              </div>
              <button onClick={() => setShowLead(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {leadSent ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Tack för ditt intresse!</h3>
                <p className="text-slate-500 text-sm mb-6">Vi har tagit emot din förfrågan och återkommer inom 24 timmar.</p>
                <button onClick={() => setShowLead(false)}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                  Stäng
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Ditt namn *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" required value={lead.name}
                        onChange={(e) => setLead({ ...lead, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="För- och efternamn" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Företag *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" required value={lead.company}
                        onChange={(e) => setLead({ ...lead, company: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Företagsnamn" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">E-post *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" required value={lead.email}
                        onChange={(e) => setLead({ ...lead, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="namn@foretag.se" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="tel" required value={lead.phone}
                        onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="070-000 00 00" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Antal maskiner i flottan</label>
                  <select value={lead.machines} onChange={(e) => setLead({ ...lead, machines: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Välj intervall</option>
                    <option value="1-10">1–10 maskiner</option>
                    <option value="11-25">11–25 maskiner</option>
                    <option value="26-50">26–50 maskiner</option>
                    <option value="51-100">51–100 maskiner</option>
                    <option value="100+">100+ maskiner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Meddelande</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea value={lead.message}
                      onChange={(e) => setLead({ ...lead, message: e.target.value })}
                      rows={3}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Berätta kort om er verksamhet och vad ni letar efter..." />
                  </div>
                </div>

                {leadError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{leadError}</div>}

                <button type="submit" disabled={leadLoading}
                  className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  {leadLoading ? 'Skickar...' : 'Skicka förfrågan'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginPageInner />
    </Suspense>
  );
}
