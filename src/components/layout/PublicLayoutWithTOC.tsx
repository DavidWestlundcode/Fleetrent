import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import { AnimateIn } from '@/components/ui/AnimateIn';

interface TocSection {
  id: string;
  label: string;
}

export default function PublicLayoutWithTOC({
  title,
  updated,
  sections,
  children,
}: {
  title: string;
  updated?: string;
  sections: TocSection[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />

      <main className="flex-1 w-full pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimateIn>
            <h1 className="text-[34px] sm:text-[40px] font-bold text-slate-900 tracking-tight leading-tight mb-3">
              {title}
            </h1>
            {updated && <p className="text-sm text-slate-400 mb-10">{updated}</p>}
          </AnimateIn>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-12 pt-8 border-t border-slate-100">
            <nav className="lg:sticky lg:top-28 lg:self-start" aria-label="Innehållsförteckning">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Innehåll</p>
              <ul className="space-y-0.5">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block text-[13px] text-slate-500 hover:text-blue-600 py-1.5 transition-colors"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <AnimateIn delay={80}>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed [&_h2]:scroll-mt-24">
                {children}
              </div>
            </AnimateIn>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
