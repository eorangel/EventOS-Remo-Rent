'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { registroUrl, siteConfig } from '@/lib/config';
import { RemoLogo } from '@/components/RemoLogo';

const navItems = [
  { href: '#solucion', label: 'Solución' },
  { href: '#funciones', label: 'Funciones' },
  { href: '#precios', label: 'Precios' },
  { href: '#faq', label: 'FAQ' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="section-shell flex items-center justify-between gap-2 py-2.5 sm:gap-4 sm:py-3 md:py-3.5">
          <Link href="/" className="min-w-0 max-w-[calc(100%-3rem)] shrink">
            <RemoLogo variant="header" priority />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition hover:text-brand-700"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href={`${siteConfig.appUrl}/login`}
              className="hidden text-sm font-medium text-slate-700 hover:text-brand-700 sm:inline"
            >
              Iniciar sesión
            </a>
            <Link
              href={registroUrl({ tipo: 'prueba' })}
              className="hidden rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700 sm:inline-flex"
            >
              Empieza gratis
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
              aria-label="Abrir menú"
              aria-expanded={open}
            >
              <span className="text-xl leading-none">☰</span>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-black/40 md:hidden"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-200 ease-out md:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <RemoLogo variant="compact" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-xl text-slate-600 hover:bg-slate-100"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="space-y-3 border-t border-slate-200 p-4">
          <a
            href={`${siteConfig.appUrl}/login`}
            onClick={() => setOpen(false)}
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-800"
          >
            Iniciar sesión
          </a>
          <Link
            href={registroUrl({ tipo: 'prueba' })}
            onClick={() => setOpen(false)}
            className="btn-primary block w-full text-center"
          >
            Empieza gratis
          </Link>
          <Link
            href={registroUrl({ tipo: 'demo' })}
            onClick={() => setOpen(false)}
            className="block w-full rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-center text-sm font-semibold text-brand-800"
          >
            Solicitar demostración
          </Link>
        </div>
      </div>
    </>
  );
}
