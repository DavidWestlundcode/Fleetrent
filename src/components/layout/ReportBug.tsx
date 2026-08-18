'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bug, X, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function ReportBug() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const reset = () => {
    setOpen(false);
    setTimeout(() => { setMessage(''); setSent(false); setError(null); }, 200);
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/report-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, pageUrl: typeof window !== 'undefined' ? window.location.href : pathname }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Något gick fel'); return; }
      setSent(true);
      setTimeout(reset, 1800);
    } catch {
      setError('Något gick fel. Försök igen.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Felanmäl något"
        className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <Bug className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-[13px] font-semibold text-slate-900">Felanmälan</p>
            <button
              onClick={reset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-[13px] font-medium text-slate-700">Skickat, tack!</p>
              </div>
            ) : (
              <>
                <textarea
                  autoFocus
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Beskriv vad som är fel..."
                  rows={4}
                  className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all resize-none"
                />
                {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Skicka
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
