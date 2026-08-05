'use client';



import Link from 'next/link';

import { usePathname, useRouter } from 'next/navigation';

import { clearToken, getStoredUser } from '@/lib/api';

import { ROL_LABELS } from '@/lib/labels';

import type { Usuario } from '@/lib/types';



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

    <div className="flex min-h-screen bg-slate-100">

      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">

        <div className="border-b border-slate-200 px-5 py-5">

          <Link href="/dashboard" className="flex items-center gap-3">

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-base font-bold text-white">

              E

            </span>

            <div>

              <p className="text-sm font-bold text-slate-900">EventOS</p>

              <p className="text-xs text-slate-500">Remo&Rent · Admin</p>

            </div>

          </Link>

        </div>



        <nav className="flex-1 space-y-1 px-3 py-4">

          {navItems.map((item) => {

            const active = pathname.startsWith(item.href);

            return (

              <Link

                key={item.href}

                href={item.href}

                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${

                  active

                    ? 'bg-brand-600 text-white shadow-sm'

                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'

                }`}

              >

                <span className="text-base opacity-80">{item.icon}</span>

                {item.label}

              </Link>

            );

          })}

        </nav>



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


