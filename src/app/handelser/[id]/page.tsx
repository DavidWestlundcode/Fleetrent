import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

async function getEvent(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('landing_events')
    .select('id, title, description, category, event_date, image_url, meta_title, meta_description')
    .eq('id', id)
    .eq('is_published', true)
    .single();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return {};

  const title = `${event.meta_title || event.title} – FleetOS`;
  const description = event.meta_description || event.description;
  const url = `https://fleetos.se/handelser/${event.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      ...(event.image_url && { images: [{ url: event.image_url }] }),
    },
  };
}

export default async function HandelsePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/handelser" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-8">
            <ArrowLeft className="w-3.5 h-3.5" /> Alla händelser
          </Link>

          {event.image_url && (
            <img src={event.image_url} alt={event.title} className="w-full aspect-video object-cover rounded-2xl border border-slate-200 mb-8" />
          )}

          <div className="flex items-center gap-2 flex-wrap mb-3">
            {event.category && (
              <span className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">{event.category}</span>
            )}
            <span className="text-[13px] text-slate-400">
              {new Date(event.event_date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-[28px] sm:text-[34px] font-bold text-slate-900 tracking-tight leading-tight mb-6">
            {event.title}
          </h1>

          <p className="text-[16px] text-slate-600 leading-relaxed">{event.description}</p>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
