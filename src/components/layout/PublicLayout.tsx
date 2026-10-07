import Link from 'next/link';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import JsonLd from '@/components/public/JsonLd';
import { breadcrumbJsonLd, type Crumb } from '@/lib/seo';

// The H1 and body use a CSS-only entrance (not <AnimateIn>) so they're visible in the
// server-rendered HTML without waiting for hydration — this content is usually the LCP element.
export default function PublicLayout({
  title,
  children,
  narrow = false,
  breadcrumbs,
}: {
  title: string;
  children: React.ReactNode;
  narrow?: boolean;
  /** Trail after "Start", e.g. [{ name: 'Truckar', path: '/uthyrning/truckar' }]. Rendered visibly and as BreadcrumbList JSON-LD. */
  breadcrumbs?: Crumb[];
}) {
  const trail = breadcrumbs ? [{ name: 'Start', path: '/' }, ...breadcrumbs] : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />

      <main className="flex-1 w-full pt-32 pb-20 px-6">
        <div className={narrow ? 'max-w-2xl mx-auto' : 'max-w-4xl mx-auto'}>
          {trail && (
            <>
              <JsonLd data={breadcrumbJsonLd(trail)} />
              <nav aria-label="Brödsmulor" className="mb-5 text-[13px] text-slate-400">
                <ol className="flex flex-wrap items-center gap-1.5">
                  {trail.map((c, i) => (
                    <li key={c.path} className="flex items-center gap-1.5">
                      {i > 0 && <span aria-hidden="true">/</span>}
                      {i < trail.length - 1
                        ? <Link href={c.path} className="hover:text-slate-700 transition-colors">{c.name}</Link>
                        : <span aria-current="page" className="text-slate-600">{c.name}</span>}
                    </li>
                  ))}
                </ol>
              </nav>
            </>
          )}
          <h1 className="animate-fade-up text-[34px] sm:text-[40px] font-bold text-slate-900 tracking-tight leading-tight mb-10 pb-8 border-b border-slate-100">
            {title}
          </h1>
          <div className="animate-fade-up-delayed prose prose-slate max-w-none text-slate-600 leading-relaxed">
            {children}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
