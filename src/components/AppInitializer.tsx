'use client';
import { useEffect } from 'react';
import { useStore } from '@/store';

export function AppInitializer() {
  const { initialize, loading, initialized } = useStore();

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (initialized && !loading) return null;

  return (
    <div className="fixed inset-0 bg-[#0B1120]/95 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-9 h-9 border-[3px] border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium tracking-wide">Laddar FleetOS…</p>
      </div>
    </div>
  );
}
