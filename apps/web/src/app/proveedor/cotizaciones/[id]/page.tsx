'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button, PageHeader } from '@/components/ui';
import { CotizacionProveedorForm } from '@/components/CotizacionProveedorForm';
import { apiFetch } from '@/lib/api';
import type { CotizacionProveedor } from '@/lib/types';

export default function CotizacionProveedorDetallePage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<CotizacionProveedor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    apiFetch<CotizacionProveedor>(`/portal/cotizaciones/${params.id}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <>
      <PageHeader
        title={data?.titulo ?? data?.folio ?? 'Cotización'}
        description={data ? `${data.folio} — ${data.clienteProveedor?.nombre ?? 'Cliente'}` : 'Detalle de cotización'}
        action={
          <Link href="/proveedor/cotizaciones">
            <Button variant="secondary">← Cotizaciones</Button>
          </Link>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : !data ? (
        <p className="text-sm text-red-600">Cotización no encontrada</p>
      ) : (
        <CotizacionProveedorForm mode="edit" cotizacionId={data.id} initialData={data} />
      )}
    </>
  );
}
