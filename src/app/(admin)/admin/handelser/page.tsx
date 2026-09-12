import { createAdminClient } from '@/lib/supabase/admin';
import { LandingEventsManager } from './LandingEventsManager';

export default async function AdminLandingEventsPage() {
  const admin = createAdminClient();
  const { data: events } = await admin
    .from('landing_events')
    .select('*')
    .order('event_date', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Senaste händelserna</h1>
        <p className="text-slate-500 text-sm mt-1">Visas på landningssidan (fleetos.se) och på /handelser</p>
      </div>

      <LandingEventsManager events={events ?? []} />
    </div>
  );
}
