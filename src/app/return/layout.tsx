import { AppInitializer } from '@/components/AppInitializer';

export default function ReturnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppInitializer />
      {children}
    </>
  );
}
