import Image from 'next/image';

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="FleetOS"
      width={1536}
      height={1024}
      style={{ height: size, width: 'auto' }}
      priority
    />
  );
}
