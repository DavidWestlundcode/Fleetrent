import Anthropic from '@anthropic-ai/sdk';
import { NextResponse, type NextRequest } from 'next/server';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('din-')) {
    return NextResponse.json({ error: 'API-nyckel för AI saknas. Lägg till ANTHROPIC_API_KEY i .env.local.' }, { status: 503 });
  }

  try {
    const { nameplateImage, machineImage } = await request.json();

    const imageContent: Anthropic.ImageBlockParam[] = [];

    if (nameplateImage) {
      const [header, data] = nameplateImage.split(',');
      const mediaType = header.match(/data:(.*);base64/)?.[1] as 'image/jpeg' | 'image/png' | 'image/webp';
      imageContent.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType || 'image/jpeg', data },
      });
    }

    if (machineImage) {
      const [header, data] = machineImage.split(',');
      const mediaType = header.match(/data:(.*);base64/)?.[1] as 'image/jpeg' | 'image/png' | 'image/webp';
      imageContent.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType || 'image/jpeg', data },
      });
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            {
              type: 'text',
              text: `Analysera bilden/bilderna av denna maskin. Den första bilden (om den finns) är typskylten, den andra är maskinen.

Returnera ENBART ett JSON-objekt med dessa fält (inga andra ord):
{
  "brand": "fabrikat, t.ex. Toyota",
  "model": "modellbeteckning, t.ex. 8FBN25",
  "name": "föreslaget maskinnamn, t.ex. Toyota Motviktstruck 2.5T",
  "serialNumber": "serienummer eller tom sträng",
  "year": 2018,
  "category": "ett av: motviktstruck, skjutstativtruck, plocktruck, led_truck, teleskoptruck, hjullastare, gravmaskin, truck, traktor, annan",
  "fuelType": "ett av: diesel, el, bensin, gas, hybrid, manuell",
  "capacity": "t.ex. 2500 kg eller tom sträng",
  "notes": "övrig relevant info från typskylten"
}

Om du inte kan läsa ett värde, lämna det som tom sträng eller 0 för år. Gissa aldrig serienummer.`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
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
