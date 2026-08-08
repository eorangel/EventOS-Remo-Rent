'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken, getStoredUser } from '@/lib/api';
import { ROL_LABELS } from '@/lib/labels';
import type { Usuario } from '@/lib/types';
import { RemoLogo } from '@/components/RemoLogo';

const mainNavItems = [
  { href: '/proveedor/dashboard', label: 'Inicio', icon: '◫' },
  { href: '/proveedor/calendario', label: 'Calendario', icon: '▦' },
  { href: '/proveedor/clientes', label: 'Clientes', icon: '◎' },
  { href: '/proveedor/cotizaciones', label: 'Cotizaciones', icon: '▤' },
  { href: '/proveedor/reportes', label: 'Reportes', icon: '◧' },
  { href: '/proveedor/cobros', label: 'Cobros', icon: '$' },
  { href: '/proveedor/catalogo', label: 'Catálogo', icon: '▣' },
];

const configNavItem = {
  href: '/proveedor/configuracion',
  label: 'Configuración',
  icon: '⚙',
};

function NavLink({
  item,
  active,
  variant = 'default',
}: {
  item: { href: string; label: string; icon: string };
  active: boolean;
  variant?: 'default' | 'config';
}) {
  if (variant === 'config') {
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
          active
            ? 'border-brand-500/40 bg-brand-600/20 text-white shadow-sm'
            : 'border-brand-800 bg-brand-900/50 text-slate-300 hover:border-brand-700 hover:bg-brand-900 hover:text-white'
        }`}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${
            active ? 'bg-brand-600 text-white' : 'bg-brand-950 text-brand-300'
          }`}
        >
          {item.icon}
        </span>
        <div>
          <span className="block">{item.label}</span>
          <span className="block text-[10px] font-normal uppercase tracking-wide text-brand-300/70">
            Empresa y perfil
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
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
}

export function ProveedorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser<Usuario>();

  function logout() {
    clearToken();
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-60 shrink-0 flex-col border-r border-brand-900 bg-brand-950">
        <div className="border-b border-brand-900 px-5 py-5">
          <Link href="/proveedor/dashboard">
            <RemoLogo variant="compact" />
          </Link>
          <p className="mt-3 truncate text-xs text-brand-300">
            {user?.proveedorNombre ?? 'Portal proveedor'}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {mainNavItems.map((item) => (
            <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>

        <div className="border-t border-brand-900 px-3 py-4">
          <NavLink
            item={configNavItem}
            active={pathname.startsWith(configNavItem.href)}
            variant="config"
          />
        </div>

        <div className="border-t border-brand-900 px-4 py-4">
          {user && (
            <div className="mb-3 rounded-lg bg-brand-900/80 px-3 py-2">
              <p className="text-sm font-medium text-white">{user.nombre}</p>
              <p className="text-xs text-brand-300">{ROL_LABELS[user.rol]}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full rounded-lg border border-brand-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-brand-900"
          >
            Salir
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
