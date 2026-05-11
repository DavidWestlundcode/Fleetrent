'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { createClient } from '@/lib/supabase/client';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login';
      } else {
        setReady(true);
      }
    });
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
