'use client';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store';

// A brief, visible cue that refreshData() just pulled fresh data on a page switch — same idea
// as the loading bar on YouTube/GitHub. Deliberately NOT a real page reload (that would make
// in-app navigation slower and throw away scroll position/JS state); this only signals that a
// background refetch happened, the way the browser's own reload spinner does in Serviceprotokoll.
export function TopLoadingBar() {
  const refreshing = useStore((s) => s.refreshing);
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (refreshing) {
      if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
      setVisible(true);
      setWidth(0);
      // Next tick so the 0 → 70% change is an actual transition, not a jump.
      const raf = requestAnimationFrame(() => setWidth(70));
      return () => cancelAnimationFrame(raf);
    }

    // Finish the bar, then fade it out.
    setWidth(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 250);
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [refreshing]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2.5px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-blue-500 transition-[width,opacity] ease-out"
        style={{
          width: `${width}%`,
          opacity: refreshing ? 1 : 0,
          transitionDuration: refreshing ? '400ms' : '250ms',
        }}
      />
    </div>
  );
}
