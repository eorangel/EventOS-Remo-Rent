import Link from 'next/link';
import { siteConfig } from '@/lib/config';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="section-shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-base font-bold text-white shadow-md shadow-brand-600/30">
            E
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">{siteConfig.name}</p>
            <p className="text-xs text-slate-500">{siteConfig.company}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            { href: '#solucion', label: 'Solución' },
            { href: '#funciones', label: 'Funciones' },
            { href: '#precios', label: 'Precios' },
            { href: '#faq', label: 'FAQ' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-brand-700"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`${siteConfig.appUrl}/login`}
            className="hidden text-sm font-medium text-slate-700 hover:text-brand-700 sm:inline"
          >
            Iniciar sesión
          </a>
          <a
            href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent('Quiero empezar gratis — EventOS')}`}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700"
          >
            Empieza gratis
          </a>
        </div>
      </div>
    </header>
  );
}
