import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Ej inloggad' }, { status: 401 });

  // Rate limit: 10 AI calls per minute per user
  if (!rateLimit(`ai:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: 'För många AI-anrop. Försök igen om en minut.' }, { status: 429 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'API-nyckel för AI saknas.' }, { status: 503 });
  }

  try {
    const { nameplateImage, machineImage } = await request.json();

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const imageContent: OpenAI.Chat.ChatCompletionContentPart[] = [];

    if (nameplateImage) {
      imageContent.push({ type: 'image_url', image_url: { url: nameplateImage, detail: 'high' } });
    }
    if (machineImage) {
      imageContent.push({ type: 'image_url', image_url: { url: machineImage, detail: 'high' } });
    }

    const prompt = `Analysera bilden/bilderna av denna maskin. Den första bilden (om den finns) är typskylten, den andra är maskinen.

Returnera ENBART ett JSON-objekt (ingen markdown, inga kommentarer):
{
  "brand": "fabrikat, t.ex. Toyota, eller tom sträng",
  "model": "modellbeteckning, t.ex. 8FBN25, eller tom sträng",
  "name": "föreslaget maskinnamn, t.ex. Toyota Motviktstruck 2.5T, eller tom sträng",
  "serialNumber": "serienummer eller tom sträng – gissa aldrig",
  "year": 2018,
  "category": "ett av: motviktstruck, ledstaplare, skjutstativtruck, teleskoplastare, hjullastare, gravmaskin, kompaktlastare, ovrig",
  "fuelType": "ett av: el, diesel, gas, lithium, bensin",
  "capacityKg": 2500,
  "notes": "övrig relevant info från typskylten eller tom sträng"
}

Regler:
- capacityKg: heltal i kg (t.ex. 2500 för 2,5 ton), 0 om okänd
- year: 0 om okänd
- Gissa aldrig serienummer – lämna tom sträng om osäker`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: prompt }, ...imageContent],
        },
      ],
      max_tokens: 500,
    });

    const text = response.choices[0]?.message?.content ?? '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Kunde inte tolka AI-svaret' }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (err) {
    console.error('analyze-machine error:', err);
    return NextResponse.json({ error: 'Analys misslyckades' }, { status: 500 });
  }
}
