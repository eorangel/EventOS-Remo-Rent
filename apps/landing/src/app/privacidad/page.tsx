import Link from 'next/link';
import { siteConfig } from '@/lib/config';

export const metadata = {
  title: 'Aviso de privacidad',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-5">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-brand-700 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">Aviso de privacidad</h1>
        <p className="mt-2 text-sm text-slate-500">Última actualización: agosto 2026</p>
        <div className="prose prose-slate mt-8 max-w-none text-sm leading-relaxed text-slate-700">
          <p>
            {siteConfig.company} («nosotros») opera la plataforma EventOS. Este aviso describe cómo
            recopilamos, usamos y protegemos tus datos personales conforme a la legislación mexicana
            aplicable.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-slate-900">Datos que recopilamos</h2>
          <p>
            Nombre, correo electrónico, teléfono, datos de la empresa y información operativa que
            ingreses al usar el CRM (clientes, eventos, inventario, cobros).
          </p>
          <h2 className="mt-8 text-lg font-semibold text-slate-900">Uso de la información</h2>
          <p>
            Utilizamos tus datos para prestar el servicio, mejorar la plataforma, comunicarnos
            contigo y cumplir obligaciones legales. No vendemos tu información a terceros.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-slate-900">Contacto</h2>
          <p>
            Para ejercer tus derechos ARCO o dudas sobre privacidad, escríbenos a{' '}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-brand-700 hover:underline">
              {siteConfig.contactEmail}
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
