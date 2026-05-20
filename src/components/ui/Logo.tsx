'use client';
import { useId } from 'react';

export function Logo({ size = 32 }: { size?: number }) {
  const uid = useId();
  const gId = `fg${uid.replace(/:/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gId} x1="76" y1="44" x2="18" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3D5EFF" />
          <stop offset="55%" stopColor="#6633EE" />
          <stop offset="100%" stopColor="#8B22EE" />
        </linearGradient>
      </defs>

      {/* Dark navy top arm — rectangle with semicircular right cap */}
      <path d="M 12,8 H 74 A 15,15 0 0 1 74,38 H 12 Z" fill="#1B2444" />

      {/* Blue-to-purple gradient F: middle arm + vertical stem */}
      <path
        d="M 12,46 H 72 A 14,14 0 0 1 72,74 H 27 V 104 Q 27,112 19.5,112 Q 12,112 12,104 Z"
        fill={`url(#${gId})`}
      />

      {/* Bar charts in negative space below middle arm */}
      <rect x="40" y="92" width="9" height="12" rx="2.5" fill="#6B55EE" />
      <rect x="53" y="85" width="9" height="19" rx="2.5" fill="#5B65FF" />
      <rect x="66" y="78" width="9" height="26" rx="2.5" fill="#4D7CFF" />
    </svg>
  );
}
