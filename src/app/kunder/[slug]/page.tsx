import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import JsonLd from '@/components/public/JsonLd';
import { LinkCards } from '@/components/public/PageCta';
import { CUSTOMER_CASES } from '@/lib/customer-cases';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return CUSTOMER_CASES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = CUSTOMER_CASES.find((c) => c.slug === slug);
  if (!c) return {};
  return pageMetadata({ path: `/kunder/${c.slug}`, title: `${c.name} – kundcase`, description: c.summary });
}

export default async function KundCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CUSTOMER_CASES.find((c) => c.slug === slug);
  if (!c) notFound();

  const crumbs = [
    { name: 'Start', path: '/' },
    { name: 'Kunder', path: '/kunder' },
    { name: c.name, path: `/kunder/${c.slug}` },
  ];

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PublicHeader />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Brödsmulor" className="mb-8 text-[13px] text-slate-400">
            <ol className="flex flex-wrap items-center gap-1.5">
              {crumbs.map((cr, i) => (
                <li key={cr.path} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {i < crumbs.length - 1
                    ? <Link href={cr.path} className="hover:text-slate-700 transition-colors">{cr.name}</Link>
                    : <span aria-current="page" className="text-slate-600">{cr.name}</span>}
                </li>
              ))}
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-center h-14 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element -- small local logo */}
              <img src={c.logo} alt={c.name} width={200} height={56} className="max-h-10 w-auto max-w-[220px] object-contain" />
            </div>
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-widest text-center mb-3">Kundcase · {c.industry}</p>
            <h1 className="text-[32px] sm:text-[36px] font-bold text-slate-900 tracking-tight leading-tight text-center mb-4">
              Så använder {c.name} FleetOS
            </h1>
            <p className="text-[17px] text-slate-500 max-w-xl mx-auto leading-relaxed text-center">
              {c.summary}
            </p>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {c.highlights.map((h) => (
              <div key={h} className="flex items-start gap-2.5 bg-slate-50 rounded-xl p-4">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-[13px] text-slate-700 leading-relaxed">{h}</span>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="space-y-10 mb-14">
            {c.sections.map(({ heading, paragraphs }) => (
              <section key={heading}>
                <h2 className="text-[22px] font-bold text-slate-900 tracking-tight mb-3">{heading}</h2>
                <div className="space-y-4">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-[15px] text-slate-600 leading-relaxed">{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <h2 className="text-[18px] font-bold text-slate-900 mb-4">Läs mer</h2>
          <LinkCards links={c.related} />

          {/* CTA */}
          <div className="mt-16 text-center border-t border-slate-100 pt-12">
            <p className="text-slate-500 text-[14px] mb-6">Vill ni se hur samma flöde fungerar för er maskinuthyrning?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/kom-igang" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-[14px]">
                Boka demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/kontakt" className="flex items-center gap-2 px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-colors text-[14px]">
                Kontakta oss
              </Link>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
