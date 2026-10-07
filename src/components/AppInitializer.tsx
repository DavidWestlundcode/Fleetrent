'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store';
import { TopLoadingBar } from '@/components/ui/TopLoadingBar';

export function AppInitializer() {
  const { initialize, refreshData, loading, initialized } = useStore();
  const pathname = usePathname();
  const isFirstPath = useRef(true);

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Baseline freshness for plain in-app navigation, under whatever the realtime feed already
  // caught — skips the very first path (initialize() just handled that).
  useEffect(() => {
    if (isFirstPath.current) { isFirstPath.current = false; return; }
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (initialized && !loading) return <TopLoadingBar />;

  return (
    <>
      <TopLoadingBar />
      <div className="fixed inset-0 bg-[#0B1120]/95 z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 border-[3px] border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium tracking-wide">Laddar FleetOS…</p>
        </div>
      </div>
    </>
  );
}
