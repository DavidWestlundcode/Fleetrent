import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';
import { Resend } from 'resend';
import { LIMITS } from '@/lib/rate-limit';

const REPORT_RECIPIENTS = ['david@fleetos.se', 'elias@fleetos.se'];

export async function POST(request: NextRequest) {
  try {
    const { message, pageUrl } = await request.json().catch(() => ({}));
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Skriv en beskrivning innan du skickar' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

    if (!await LIMITS.bugReport(user.id)) {
      return NextResponse.json({ error: 'För många felanmälningar. Försök igen om en stund.' }, { status: 429 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'E-post inte konfigurerat' }, { status: 500 });

    const { data: profile } = await supabase.from('profiles').select('organization_id, full_name').eq('id', user.id).single();
    const admin = createAdminClient();
    const { data: org } = profile?.organization_id
      ? await admin.from('organizations').select('name').eq('id', profile.organization_id).single()
      : { data: null };

    const reporterName = profile?.full_name || user.email || 'Okänd användare';
    const orgName = org?.name ?? 'Okänd organisation';
    const sanitizedMessage = String(message).trim().slice(0, 5000);
    const sanitizedPageUrl = pageUrl ? String(pageUrl).slice(0, 500) : '';

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: 'FleetOS Felanmälan <felanmalan@fleetos.se>',
      to: REPORT_RECIPIENTS,
      replyTo: user.email,
      subject: `Felanmälan från ${reporterName} (${orgName})`,
      text: [
        `Felanmälan från: ${reporterName} (${user.email})`,
        `Organisation: ${orgName}`,
        sanitizedPageUrl ? `Sida: ${sanitizedPageUrl}` : null,
        '',
        sanitizedMessage,
      ].filter((line) => line !== null).join('\n'),
    });

    if (error) {
      return NextResponse.json({ error: 'Kunde inte skicka felanmälan' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Något gick fel' }, { status: 500 });
  }
}
