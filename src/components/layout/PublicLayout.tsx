import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import { AnimateIn } from '@/components/ui/AnimateIn';

export default function PublicLayout({ title, children, narrow = false }: { title: string; children: React.ReactNode; narrow?: boolean }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />

      <main className="flex-1 w-full pt-32 pb-20 px-6">
        <div className={narrow ? 'max-w-2xl mx-auto' : 'max-w-4xl mx-auto'}>
          <AnimateIn>
            <h1 className="text-[34px] sm:text-[40px] font-bold text-slate-900 tracking-tight leading-tight mb-10 pb-8 border-b border-slate-100">
              {title}
            </h1>
          </AnimateIn>
          <AnimateIn delay={80}>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
              {children}
            </div>
          </AnimateIn>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
