import { AppInitializer } from '@/components/AppInitializer';

export default function QrLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppInitializer />
      {children}
    </>
  );
}
