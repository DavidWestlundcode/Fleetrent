import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { Resend } from 'resend';
import { LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'E-post krävs' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

    if (!await LIMITS.userAdmin(user.id)) {
      return NextResponse.json({ error: 'För många förfrågningar. Försök igen om en minut.' }, { status: 429 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role, full_name')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) return NextResponse.json({ error: 'Ingen organisation kopplad' }, { status: 400 });
    if (profile.role !== 'admin') return NextResponse.json({ error: 'Endast admins kan bjuda in' }, { status: 403 });

    const admin = createAdminClient();
    const origin = request.nextUrl.origin;

    // Create user if not exists
    const { data: { users: existingUsers } } = await admin.auth.admin.listUsers();
    const alreadyExists = existingUsers?.some((u) => u.email === email);

    let userId: string | null = null;

    if (!alreadyExists) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        // Include role in metadata so the DB trigger sets it correctly on profile creation
        user_metadata: { organization_id: profile.organization_id, role: 'saljare' },
      });
      if (createErr) throw createErr;
      userId = created.user.id;
    } else {
      userId = existingUsers?.find((u) => u.email === email)?.id ?? null;
    }

    if (userId) {
      const { error: upsertErr } = await admin.from('profiles').upsert({
        id: userId,
        organization_id: profile.organization_id,
        full_name: '',
        role: 'saljare',
      });
      if (upsertErr) throw new Error(`Kunde inte sätta roll på inbjuden användare: ${upsertErr.message}`);
    }

    // Generate recovery link — get the hashed_token directly
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${origin}/auth/reset-password` },
    });

    if (linkErr) throw linkErr;

    const hashedToken = linkData?.properties?.hashed_token;
    if (!hashedToken) throw new Error('Kunde inte generera länk');

    // Build a direct link to our confirm page — bypasses PKCE completely
    const link = `${origin}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`;

    // Email the invite directly — the admin no longer has to copy/paste the link themselves.
    let emailSent = false;
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const { data: org } = await admin.from('organizations').select('name').eq('id', profile.organization_id).single();
      const inviterName = profile.full_name || user.email || 'En kollega';
      const orgName = org?.name ?? 'företaget';
      const resend = new Resend(apiKey);
      const { error: emailError } = await resend.emails.send({
        from: 'FleetOS <inbjudan@fleetos.se>',
        to: email,
        subject: `${inviterName} har bjudit in dig till ${orgName} på FleetOS`,
        text: [
          `${inviterName} har bjudit in dig att ansluta till ${orgName} på FleetOS.`,
          '',
          `Klicka på länken nedan för att skapa ditt lösenord och komma igång:`,
          link,
          '',
          'Länken är giltig i 24 timmar.',
        ].join('\n'),
      });
      if (emailError) console.error('[invite-user] Failed to send invite email:', emailError);
      else emailSent = true;
    }

    return NextResponse.json({ success: true, link, emailSent });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Okänt fel';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
