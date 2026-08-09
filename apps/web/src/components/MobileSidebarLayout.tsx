'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RemoLogo } from '@/components/RemoLogo';

type MobileSidebarLayoutProps = {
  homeHref: string;
  mobileTitle: string;
  sidebarHeader: React.ReactNode;
  sidebarNav: React.ReactNode;
  sidebarExtra?: React.ReactNode;
  sidebarFooter: React.ReactNode;
  children: React.ReactNode;
};

export function MobileSidebarLayout({
  homeHref,
  mobileTitle,
  sidebarHeader,
  sidebarNav,
  sidebarExtra,
  sidebarFooter,
  children,
}: MobileSidebarLayoutProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[min(85vw,288px)] flex-col border-r border-brand-900 bg-brand-950 transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-60 lg:max-w-none lg:shrink-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-brand-900 px-4 py-3 lg:hidden">
          <Link href={homeHref} onClick={() => setOpen(false)}>
            <RemoLogo variant="compact" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-lg text-slate-300 hover:bg-brand-900"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {sidebarHeader}
        {sidebarNav}
        {sidebarExtra}
        {sidebarFooter}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            <span className="text-xl leading-none">☰</span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{mobileTitle}</p>
          </div>
          <Link href={homeHref} className="shrink-0">
            <RemoLogo variant="mark" />
          </Link>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
