import Link from 'next/link';
import { Suspense } from 'react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { RegistroForm } from '@/components/RegistroForm';
import { RemoLogo } from '@/components/RemoLogo';

export const metadata = {
  title: 'Registro',
  description: 'Solicita tu prueba gratis o una demostración de REMO.',
};

export default function RegistroPage() {
  return (
    <>
      <Header />
      <main className="section-pad bg-gradient-to-b from-slate-50 to-white">
        <div className="section-shell">
          <div className="mb-10 flex flex-col items-center text-center">
            <RemoLogo variant="full" priority />
            <p className="mt-6 max-w-lg text-sm text-slate-600">
              Sin pago en línea por ahora. Revisamos tu solicitud y te damos acceso al CRM para que
              empieces a operar con REMO.
            </p>
          </div>

          <Suspense fallback={<div className="card mx-auto max-w-xl p-8 text-center">Cargando…</div>}>
            <RegistroForm />
          </Suspense>

          <p className="mt-8 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/" className="font-medium text-brand-700 hover:underline">
              Volver a la landing
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
