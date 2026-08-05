'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken, getStoredUser } from '@/lib/api';
import { ROL_LABELS } from '@/lib/labels';
import type { Usuario } from '@/lib/types';

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
            ? 'border-teal-300 bg-teal-50 text-teal-900 shadow-sm'
            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${
            active ? 'bg-teal-600 text-white' : 'bg-white text-slate-500 shadow-sm'
          }`}
        >
          {item.icon}
        </span>
        <div>
          <span className="block">{item.label}</span>
          <span className="block text-[10px] font-normal uppercase tracking-wide text-slate-400">
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
          ? 'bg-teal-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5">
          <Link href="/proveedor/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-base font-bold text-white">
              P
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Portal proveedor</p>
              <p className="text-xs text-slate-500">{user?.proveedorNombre ?? 'Remo&Rent'}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        <div className="border-t border-slate-200 px-3 py-4">
          <NavLink
            item={configNavItem}
            active={pathname.startsWith(configNavItem.href)}
            variant="config"
          />
        </div>

        <div className="border-t border-slate-200 px-4 py-4">
          {user && (
            <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-sm font-medium text-slate-900">{user.nombre}</p>
              <p className="text-xs text-slate-500">{ROL_LABELS[user.rol]}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
