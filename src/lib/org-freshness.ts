import { createClient } from '@/lib/supabase/client';

// Detects a device/tab whose in-memory app state was loaded under a
// different active organization than the account currently has — e.g. a
// tablet left open in a workshop for days while someone switches the
// account's active org elsewhere (via "byt bolag" on another device).
// initialize() only ever runs once per page load, so a stale tab would
// otherwise keep showing (or risk acting on) another org's data until
// someone happens to reload it manually. Reload proactively instead.
export async function checkOrgFreshness(loadedOrgId: string | null): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (profile && profile.organization_id !== loadedOrgId) {
    window.location.reload();
  }
}
