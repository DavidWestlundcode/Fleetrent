import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-()]{6,20}$/;

export async function POST(request: NextRequest) {
  // Rate limit: 5 submissions per 10 minutes per IP
  const ip = getClientIp(request);
  if (!await rateLimit(`lead:${ip}`, 5, 600_000)) {
    return NextResponse.json({ error: 'För många försök. Försök igen senare.' }, { status: 429 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Ogiltig förfrågan' }, { status: 400 });

    const { name, company, email, phone, machines, message } = body;

    if (!name || !company || !email || !phone) {
      return NextResponse.json({ error: 'Obligatoriska fält saknas' }, { status: 400 });
    }

    // Validate formats
    if (!EMAIL_RE.test(String(email))) {
      return NextResponse.json({ error: 'Ogiltig e-postadress' }, { status: 400 });
    }
    if (!PHONE_RE.test(String(phone))) {
      return NextResponse.json({ error: 'Ogiltigt telefonnummer' }, { status: 400 });
    }

    // Sanitize string lengths
    const sanitized = {
      name:     String(name).slice(0, 120),
      company:  String(company).slice(0, 200),
      email:    String(email).slice(0, 200).toLowerCase(),
      phone:    String(phone).slice(0, 30),
      machines: machines ? String(machines).slice(0, 500) : '',
      message:  message ? String(message).slice(0, 2000) : '',
    };

    const admin = createAdminClient();
    const { error } = await admin.from('leads').insert(sanitized);

    if (error) {
      return NextResponse.json({ error: 'Kunde inte spara förfrågan' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Något gick fel' }, { status: 500 });
  }
}
