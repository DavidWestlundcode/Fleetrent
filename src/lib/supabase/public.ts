import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Cookie-less anon client for public, RLS-readable marketing data (landing_events).
// Unlike the cookie-based server client it doesn't opt the page into dynamic rendering,
// so the home page and /handelser can be statically cached and revalidated.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

// Call after any landing_events write so the cached public pages update immediately.
export function revalidateLandingEvents() {
  revalidatePath('/');
  revalidatePath('/handelser');
  revalidatePath('/handelser/[id]', 'page');
}
