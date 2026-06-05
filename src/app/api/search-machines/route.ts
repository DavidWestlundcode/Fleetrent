import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export interface SearchCriteria {
  category?: string | null;
  fuelTypes?: string[] | null;
  capacityMin?: number | null;
  capacityMax?: number | null;
  liftHeightMin?: number | null;
  liftHeightMax?: number | null;
  buildHeightMin?: number | null;
  buildHeightMax?: number | null;
  forkLengthMin?: number | null;
  forkLengthMax?: number | null;
  freeLiftMin?: number | null;
  freeLiftMax?: number | null;
  maxReachMin?: number | null;
  maxReachMax?: number | null;
  digDepthMin?: number | null;
  digDepthMax?: number | null;
  bucketVolumeMin?: number | null;
  bucketVolumeMax?: number | null;
  workingWeightMin?: number | null;
  workingWeightMax?: number | null;
  enginePowerMin?: number | null;
  enginePowerMax?: number | null;
  yearMin?: number | null;
  yearMax?: number | null;
}

const SYSTEM_PROMPT = `Du är ett system som tolkar naturliga sökfrågor om maskiner för en uthyrningsportal och returnerar strukturerade filterkriterier.
Använd svenska termer. Enheter: kapacitet i kg, dimensioner (lyfthöjd, bygghöjd, etc.) i mm, skopvolym i liter, motoreffekt i kW, tjänstevikt i kg.
Om användaren skriver t.ex. "1,9 ton" konvertera till 1900 kg. Om de skriver "5 m" konvertera till 5000 mm.

Returnera ENBART ett JSON-objekt (ingen markdown, inga kommentarer):
{
  "category": "motviktstruck|ledstaplare|skjutstativtruck|teleskoplastare|hjullastare|gravmaskin|kompaktlastare|ovrig|null",
  "fuelTypes": ["el","diesel","gas","lithium","bensin"] eller null,
  "capacityMin": number kg eller null,
  "capacityMax": number kg eller null,
  "liftHeightMin": number mm eller null,
  "liftHeightMax": number mm eller null,
  "buildHeightMin": number mm eller null,
  "buildHeightMax": number mm eller null,
  "forkLengthMin": number mm eller null,
  "forkLengthMax": number mm eller null,
  "freeLiftMin": number mm eller null,
  "freeLiftMax": number mm eller null,
  "maxReachMin": number mm eller null,
  "maxReachMax": number mm eller null,
  "digDepthMin": number mm eller null,
  "digDepthMax": number mm eller null,
  "bucketVolumeMin": number liter eller null,
  "bucketVolumeMax": number liter eller null,
  "workingWeightMin": number kg eller null,
  "workingWeightMax": number kg eller null,
  "enginePowerMin": number kW eller null,
  "enginePowerMax": number kW eller null,
  "yearMin": number eller null,
  "yearMax": number eller null
}`;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

  // Rate limit: 30 AI search calls per minute per user
  if (!await rateLimit(`search:${user.id}`, 30, 60_000)) {
    return NextResponse.json({ error: 'För många sökningar. Försök igen om en minut.' }, { status: 429 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'API-nyckel saknas.' }, { status: 503 });
  }

  try {
    const { query } = await request.json();
    if (!query?.trim()) {
      return NextResponse.json({ criteria: {} });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
      max_tokens: 400,
      temperature: 0,
    });

    const text = response.choices[0]?.message?.content ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ criteria: {} });
    }

    const criteria: SearchCriteria = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ criteria });
  } catch (err) {
    console.error('search-machines error:', err);
    return NextResponse.json({ error: 'Sökning misslyckades' }, { status: 500 });
  }
}
