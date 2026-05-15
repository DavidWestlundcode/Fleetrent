import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Creates a profile row + organization for users who signed up before the schema was in place,
// or when the email confirmation callback was never triggered.
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Check if profile + org already exists
    const { data: profile } = await admin
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profile?.organization_id) {
      return NextResponse.json({ organization_id: profile.organization_id });
    }

    // Create organization from user metadata
    const companyName =
      user.user_metadata?.company_name ??
      user.email?.split('@')[0] ??
      'Min organisation';

    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({ name: companyName })
      .select()
      .single();

    if (orgError || !org) {
      console.error('Failed to create organization:', orgError);
      return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
    }

    // Upsert profile with the new org
    const { error: profileError } = await admin
      .from('profiles')
      .upsert({
        id: user.id,
        organization_id: org.id,
        role: 'admin',
        full_name: user.user_metadata?.full_name ?? null,
      });

    if (profileError) {
      console.error('Failed to upsert profile:', profileError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ organization_id: org.id });
  } catch (e) {
    console.error('ensure-org error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
