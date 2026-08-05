'use client';

import { ProveedorAuthGuard } from '@/components/ProveedorAuthGuard';
import { ProveedorShell } from '@/components/ProveedorShell';

export default function ProveedorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorAuthGuard>
      <ProveedorShell>{children}</ProveedorShell>
    </ProveedorAuthGuard>
  );
}
