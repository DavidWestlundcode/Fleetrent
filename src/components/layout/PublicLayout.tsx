import Link from 'next/link';

export default function PublicLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-900">FleetRent</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">← Tillbaka till startsidan</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">{title}</h1>
        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-100 px-6 py-6">
        <div className="max-w-4xl mx-auto text-center text-xs text-slate-400">
          © {new Date().getFullYear()} DSE ENTERPRISE AB. Alla rättigheter förbehållna.
        </div>
      </footer>
    </div>
  );
}
