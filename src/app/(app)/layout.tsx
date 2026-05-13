import Sidebar from '@/components/layout/Sidebar';
import { AppInitializer } from '@/components/AppInitializer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <AppInitializer />
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
