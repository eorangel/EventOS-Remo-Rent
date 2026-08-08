'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    router.replace(user ? '/dashboard' : '/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-500">Cargando REMO...</p>
    </div>
  );
}
