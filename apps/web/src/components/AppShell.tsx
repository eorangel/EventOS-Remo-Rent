'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken, getStoredUser } from '@/lib/api';
import { ROL_LABELS } from '@/lib/labels';
import type { Usuario } from '@/lib/types';
import { MobileSidebarLayout } from '@/components/MobileSidebarLayout';
import { RemoLogo } from '@/components/RemoLogo';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: '◫' },
  { href: '/proveedores', label: 'Proveedores', icon: '◉' },
  { href: '/eventos', label: 'Eventos', icon: '★' },
  { href: '/suscripciones', label: 'Suscripciones', icon: '◈' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser<Usuario>();

  function logout() {
    clearToken();
    router.push('/login');
  }

  return (
    <MobileSidebarLayout
      homeHref="/dashboard"
      mobileTitle="REMO · Admin"
      sidebarHeader={
        <div className="hidden border-b border-brand-900 px-5 py-5 lg:block">
          <Link href="/dashboard">
            <RemoLogo variant="compact" />
          </Link>
          <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-brand-300/80">
            Panel administrador
          </p>
        </div>
      }
      sidebarNav={
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-brand-900 hover:text-white'
                }`}
              >
                <span className="text-base opacity-80">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      }
      sidebarFooter={
        <div className="border-t border-brand-900 px-4 py-4">
          {user ? (
            <div className="mb-3 rounded-lg bg-brand-900/80 px-3 py-2">
              <p className="truncate text-sm font-medium text-white">{user.nombre}</p>
              <p className="text-xs text-brand-300">{ROL_LABELS[user.rol]}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg border border-brand-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-brand-900"
          >
            Salir
          </button>
        </div>
      }
    >
      {children}
    </MobileSidebarLayout>
  );
}
