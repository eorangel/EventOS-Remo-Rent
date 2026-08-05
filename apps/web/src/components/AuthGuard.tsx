'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/api';
import { isProveedorUser } from '@/lib/auth-helpers';
import type { Usuario } from '@/lib/types';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getStoredUser<Usuario>();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (isProveedorUser(user.rol)) {
      router.replace('/proveedor/dashboard');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }

  return <>{children}</>;
}
