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
    const organizationId = user.user_metadata?.organization_id;
    const companyName = user.user_metadata?.company_name;

    if (organizationId) {
      // Invited user — join existing organization
      await admin
        .from('profiles')
        .update({
          organization_id: organizationId,
          role: 'member',
          full_name: user.user_metadata?.full_name ?? null,
        })
        .eq('id', user.id);
    } else if (companyName) {
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
