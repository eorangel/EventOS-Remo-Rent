import Link from 'next/link';
import { siteConfig } from '@/lib/config';

export const metadata = {
  title: 'Términos y condiciones',
};

export default function TerminosPage() {
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
        <h1 className="text-3xl font-bold text-slate-900">Términos y condiciones</h1>
        <p className="mt-2 text-sm text-slate-500">Última actualización: agosto 2026</p>
        <div className="prose prose-slate mt-8 max-w-none text-sm leading-relaxed text-slate-700">
          <p>
            Al usar EventOS, aceptas estos términos entre tu empresa y {siteConfig.company}. Si no
            estás de acuerdo, no utilices la plataforma.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-slate-900">Servicio</h2>
          <p>
            EventOS es un software de gestión (SaaS) para proveedores de eventos. El alcance de
            funciones depende del plan contratado (Básico o Pro).
          </p>
          <h2 className="mt-8 text-lg font-semibold text-slate-900">Prueba gratuita y facturación</h2>
          <p>
            La prueba de 30 días no requiere permanencia. Tras el periodo de prueba, la
            suscripción se renueva mensualmente salvo cancelación previa al siguiente cobro.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-slate-900">Cancelación</h2>
          <p>
            Puedes cancelar en cualquier momento. El acceso continúa hasta el final del periodo
            pagado o de prueba vigente.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-slate-900">Contacto</h2>
          <p>
            Dudas sobre estos términos:{' '}
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
