'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'signup' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

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
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setInfo('Kontrollera din e-post för att verifiera ditt konto.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Något gick fel. Försök igen.';
      setError(
        msg === 'Invalid login credentials'
          ? 'Felaktig e-post eller lösenord.'
          : msg === 'Email not confirmed'
          ? 'Verifiera din e-post innan du loggar in.'
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
          {/* Mobile logo */}
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
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="namn@foretag.se"
                    />
                  </div>
                </div>
                {info && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">{info}</div>
                )}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Skickar...' : 'Skicka återställningslänk'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {mode === 'login' ? 'Välkommen tillbaka' : 'Skapa konto'}
                </h2>
                <p className="text-slate-500 text-sm">
                  {mode === 'login'
                    ? 'Logga in på ditt FleetRent-konto'
                    : 'Kom igång – det tar under en minut'}
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
                {(['login', 'signup'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); setInfo(''); }}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {m === 'login' ? 'Logga in' : 'Skapa konto'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Namn</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="För- och efternamn"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">E-postadress</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="namn@foretag.se"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate-700">Lösenord</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Glömt lösenord?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={mode === 'signup' ? 'Minst 8 tecken' : '••••••••'}
                      minLength={mode === 'signup' ? 8 : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {info && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">{info}</div>
                )}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? (mode === 'login' ? 'Loggar in...' : 'Skapar konto...')
                    : (mode === 'login' ? 'Logga in' : 'Skapa konto')}
                </button>

                {mode === 'signup' && (
                  <p className="text-xs text-slate-400 text-center">
                    Genom att skapa ett konto godkänner du våra{' '}
                    <a href="#" className="text-blue-600 hover:underline">villkor</a> och{' '}
                    <a href="#" className="text-blue-600 hover:underline">integritetspolicy</a>.
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
