import Sidebar from '@/components/layout/Sidebar';
import { AppInitializer } from '@/components/AppInitializer';
import { MobileNavProvider, MobileOverlay } from '@/components/layout/MobileNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <AppInitializer />
      <MobileOverlay />
      <div className="flex h-full">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </MobileNavProvider>
  );
}
