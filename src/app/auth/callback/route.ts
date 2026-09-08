import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) {
    // Invited users already have organization_id + role set server-side by the
    // handle_new_user DB trigger at account-creation time (from admin-supplied
    // metadata in invite-user/create-user), so this branch never applies to them.
    //
    // Deliberately NOT trusting user.user_metadata.organization_id here: unlike
    // app_metadata, user_metadata is freely editable by the signed-in user via
    // `supabase.auth.updateUser()` — trusting it to join an *existing* org would
    // let anyone assign themselves to any organization by UUID.
    const companyName = user.user_metadata?.company_name;

    if (companyName) {
      // New signup — create organization and set user as admin
      const { data: org } = await admin
        .from('organizations')
        .insert({ name: companyName })
        .select()
        .single();

      if (org) {
        await admin
          .from('profiles')
          .update({ organization_id: org.id, role: 'admin' })
          .eq('id', user.id);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
