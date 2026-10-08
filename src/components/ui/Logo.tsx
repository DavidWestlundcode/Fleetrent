import Image from 'next/image';

// logo.png is 1536×1024 (3:2). Passing the real rendered size (not the source size) lets
// next/image pick a ~2× srcset instead of the 1920w/3840w variants it fetched before, and
// it's no longer `priority` everywhere — only the header logo is above the fold.
// Pass decorative when the logo sits next to the visible "FleetOS" wordmark, so screen
// readers don't hear the name twice.
export function Logo({ size = 32, priority = false, decorative = false }: { size?: number; priority?: boolean; decorative?: boolean }) {
  const width = Math.round(size * 1.5);
  return (
    <Image
      src="/logo.png"
      alt={decorative ? '' : 'FleetOS'}
      width={width}
      height={size}
      style={{ height: size, width: 'auto' }}
      priority={priority}
    />
  );
}
