import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AnimateIn } from '@/components/ui/AnimateIn';

export default async function LatestEventsSection() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('landing_events')
    .select('id, title, description, category, event_date')
    .eq('is_published', true)
    .order('event_date', { ascending: false })
    .limit(3);

  if (!events || events.length === 0) return null;

  return (
    <section className="py-16 sm:py-28 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
      <div className="max-w-5xl mx-auto">
        <AnimateIn className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-blue-600 text-[12px] font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Senaste händelserna
          </div>
          <h2 className="text-2xl sm:text-[40px] font-bold text-slate-900 tracking-tight mb-4">Vad som händer hos FleetOS</h2>
          <p className="text-[16px] text-slate-500 max-w-xl mx-auto">Nya kunder, funktioner och milstolpar – i realtid.</p>
        </AnimateIn>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {events.map((event, i) => (
            <AnimateIn key={event.id} delay={i * 80} className="h-full">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {event.category && (
                    <span className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">{event.category}</span>
                  )}
                  <span className="text-[12px] text-slate-400">
                    {new Date(event.event_date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 leading-snug">{event.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{event.description}</p>
              </div>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn className="text-center mt-10">
          <Link
            href="/handelser"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Visa alla händelser <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </AnimateIn>
      </div>
    </section>
  );
}
