import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PublicLayout from '@/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: 'Senaste händelserna – FleetOS',
  description: 'Nyheter och händelser från FleetOS – nya kunder, funktioner och milstolpar.',
  alternates: { canonical: 'https://fleetos.se/handelser' },
};

export default async function HandelserPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('landing_events')
    .select('id, title, description, category, event_date')
    .eq('is_published', true)
    .order('event_date', { ascending: false });

  return (
    <PublicLayout title="Senaste händelserna">
      <p className="text-lg text-slate-500 mb-10">Nyheter, milstolpar och uppdateringar från FleetOS.</p>
      <div className="not-prose space-y-6">
        {(events ?? []).map((event) => (
          <div key={event.id} className="flex gap-6">
            <div className="shrink-0 w-28 text-right">
              <p className="text-xs text-slate-400 mt-1">
                {new Date(event.event_date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex-1 border-l border-slate-200 pl-6 pb-6">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <h3 className="font-semibold text-slate-900">{event.title}</h3>
                {event.category && (
                  <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{event.category}</span>
                )}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
        {(!events || events.length === 0) && (
          <p className="text-slate-400">Inga händelser publicerade ännu.</p>
        )}
      </div>
    </PublicLayout>
  );
}
