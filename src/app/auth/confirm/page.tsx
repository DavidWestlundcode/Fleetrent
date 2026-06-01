'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';

function ConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = (searchParams.get('type') ?? 'recovery') as 'recovery' | 'invite' | 'magiclink';

    if (!token_hash) {
      router.push('/login?error=link_invalid');
      return;
    }

    const supabase = createClient();
    supabase.auth.verifyOtp({ token_hash, type }).then(({ error }) => {
      if (error) {
        router.push('/login?error=link_invalid');
      } else {
        router.push('/auth/reset-password');
      }
    });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Logo size={32} />
          <span className="font-bold text-slate-900 text-lg">FleetOS</span>
        </div>
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Verifierar länken...</p>
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmInner />
    </Suspense>
  );
}
