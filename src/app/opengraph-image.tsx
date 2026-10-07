import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'FleetOS – uthyrningssystem för maskiner, truckar och liftar';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const logo = await readFile(join(process.cwd(), 'public/logo.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(160deg, #0B1A33 0%, #060D1A 60%)',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={84} height={56} alt="" />
          <div style={{ fontSize: 40, fontWeight: 700 }}>FleetOS</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 1000 }}>
            Uthyrningssystem för maskiner, truckar och liftar
          </div>
          <div style={{ fontSize: 30, color: '#94A3B8', marginTop: 28 }}>
            Order · Hyresavtal · QR-returer · Fakturaunderlag till Fortnox
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: '#60A5FA' }}>www.fleetos.se</div>
      </div>
    ),
    size,
  );
}
