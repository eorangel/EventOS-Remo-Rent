'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { ApiError } from '@/lib/api';
import type { CotizacionPublicaResponse } from '@/lib/types';

function getApiUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && window.location.hostname === 'app.remoconecta.com') {
    return 'https://api.remoconecta.com';
  }
  return 'http://localhost:3001';
}

export default function CotizacionPublicaPage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<CotizacionPublicaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = params.token;
    if (!token) return;

    fetch(`${getApiUrl()}/api/cotizaciones/publico/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          let message = 'No se pudo cargar la cotización';
          try {
            const body = await res.json();
            message = body.message ?? message;
            if (Array.isArray(message)) message = message.join(', ');
          } catch {
            /* ignore */
          }
          throw new ApiError(message, res.status);
        }
        return res.json() as Promise<CotizacionPublicaResponse>;
      })
      .then(setData)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la cotización');
      })
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <p className="text-sm text-slate-600">Cargando cotización...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <Card className="max-w-md text-center">
          <h1 className="text-lg font-semibold text-slate-900">Cotización no disponible</h1>
          <p className="mt-2 text-sm text-slate-600">
            {error ?? 'El enlace puede haber expirado o la cotización aún no fue compartida.'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-4xl items-center justify-between gap-3 px-4 print:hidden">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-teal-700">Cotización</p>
          <h1 className="text-lg font-semibold text-slate-900">
            {data.titulo} · {data.folio}
          </h1>
          <p className="text-sm text-slate-600">{data.proveedorNombre}</p>
        </div>
        <Button type="button" onClick={() => window.print()}>
          Imprimir / PDF
        </Button>
      </div>

      <div className="mx-auto max-w-4xl px-4 print:hidden">
        <Card className="overflow-hidden p-0">
          <iframe
            title={data.titulo}
            srcDoc={data.html}
            className="min-h-[900px] w-full border-0 bg-white"
          />
        </Card>
      </div>

      <div
        className="hidden print:block"
        dangerouslySetInnerHTML={{ __html: data.html }}
      />
    </div>
  );
}
