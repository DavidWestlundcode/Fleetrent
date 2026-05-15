'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface MobileNavCtx {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const MobileNavContext = createContext<MobileNavCtx>({ isOpen: false, open: () => {}, close: () => {} });

export const useMobileNav = () => useContext(MobileNavContext);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <MobileNavContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function MobileOverlay() {
  const { isOpen, close } = useMobileNav();
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 md:hidden"
      onClick={close}
    />
  );
}
