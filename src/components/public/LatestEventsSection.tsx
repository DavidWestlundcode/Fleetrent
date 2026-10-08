import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createPublicClient } from '@/lib/supabase/public';
import { AnimateIn } from '@/components/ui/AnimateIn';

export default async function LatestEventsSection() {
  const supabase = createPublicClient();
  const { data: events } = await supabase
    .from('landing_events')
    .select('id, title, category, event_date, image_url')
    .eq('is_published', true)
    .order('event_date', { ascending: false })
    .limit(3);

  if (!events || events.length === 0) return null;

  return (
    <section aria-labelledby="events-heading" className="py-24 sm:py-28 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <h2 id="events-heading" className="text-[28px] sm:text-[34px] font-semibold text-slate-950 tracking-[-0.02em] leading-tight">
            Senaste nytt från FleetOS
          </h2>
          <Link href="/handelser" className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-slate-900">
            Alla händelser
            <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5" strokeWidth={1.75} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {events.map((event, i) => (
            <AnimateIn key={event.id} delay={i * 60} className="h-full">
              <Link
                href={`/handelser/${event.id}`}
                className="group flex flex-col h-full rounded-2xl bg-white ring-1 ring-slate-900/[0.06] overflow-hidden transition-shadow duration-200 hover:shadow-[0_12px_32px_-16px_rgba(15,23,42,0.25)]"
              >
                {event.image_url && (
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase storage URL */}
                    <img src={event.image_url} alt={event.title} loading="lazy" decoding="async" width={640} height={360} className="w-full h-full object-cover transition-transform duration-500 ease-out-strong group-hover:scale-[1.02]" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-[12.5px] text-slate-500 mb-2">
                    {event.category ? `${event.category}, ` : ''}
                    {new Date(event.event_date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h3 className="text-[16px] font-semibold text-slate-900 leading-snug text-pretty">{event.title}</h3>
                </div>
              </Link>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
