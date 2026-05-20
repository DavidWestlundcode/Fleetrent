export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fleetosGrad" x1="30" y1="20" x2="70" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F7FFF" />
          <stop offset="55%" stopColor="#6B52F5" />
          <stop offset="100%" stopColor="#8B2FE8" />
        </linearGradient>
      </defs>

      {/* Dark navy top bar of the F */}
      <path
        d="M18 22 C18 14 24 10 32 10 L88 10 C98 10 104 18 100 28 L92 40 C88 47 80 50 70 48 L28 48 L28 22 Z"
        fill="#111827"
        opacity="0.95"
      />

      {/* Blue-purple gradient F shape */}
      <path
        d="M28 54 L28 95 C28 100 24 104 19 104 C14 104 10 100 10 95 L10 38 C10 32 14 28 20 28 L76 28 C86 28 92 36 88 46 L82 56 C78 63 70 66 60 64 L28 64 Z"
        fill="url(#fleetosGrad)"
      />

      {/* Bar chart element 1 (shortest) */}
      <rect x="62" y="82" width="10" height="22" rx="3" fill="url(#fleetosGrad)" opacity="0.9" />
      {/* Bar chart element 2 (medium) */}
      <rect x="76" y="72" width="10" height="32" rx="3" fill="#5B8FFF" opacity="0.85" />
      {/* Bar chart element 3 (tallest) */}
      <rect x="90" y="60" width="10" height="44" rx="3" fill="#6B7FFF" opacity="0.8" />
    </svg>
  );
}
