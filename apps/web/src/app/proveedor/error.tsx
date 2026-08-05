'use client';

import { useEffect } from 'react';
import { Button, Card } from '@/components/ui';

export default function ProveedorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal proveedor:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <Card className="max-w-md border-red-200 bg-white">
        <h2 className="text-lg font-semibold text-slate-900">No se pudo cargar la página</h2>
        <p className="mt-2 text-sm text-slate-600">
          Ocurrió un error al mostrar esta sección del portal. Suele resolverse recargando la
          página.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="mt-2 break-all text-xs text-red-600">{error.message}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Button type="button" onClick={() => reset()}>
            Reintentar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.location.assign('/proveedor/dashboard')}
          >
            Ir al inicio
          </Button>
        </div>
      </Card>
    </div>
  );
}
