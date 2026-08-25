'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Button, PageHeader } from '@/components/ui';
import { ContratoProveedorForm } from '@/components/ContratoProveedorForm';
import { apiFetch } from '@/lib/api';
import type { PlantillaContratoProveedor } from '@/lib/types';

function PlantillaContratoDetalleContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const emitidoId = searchParams.get('emitidoId') ?? undefined;
  const [data, setData] = useState<PlantillaContratoProveedor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    apiFetch<PlantillaContratoProveedor>(`/portal/contratos/${params.id}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <>
      <PageHeader
        title={data?.nombre ?? 'Plantilla de contrato'}
        description={
          data
            ? `${data.modo === 'EDITOR' ? `${data.secciones.length} cláusulas` : 'Archivo cargado'}`
            : 'Editar plantilla'
        }
        action={
          <Link href="/proveedor/contratos">
            <Button variant="secondary">← Contratos</Button>
          </Link>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : !data ? (
        <p className="text-sm text-red-600">Plantilla no encontrada</p>
      ) : (
        <ContratoProveedorForm
          mode="edit"
          plantillaId={data.id}
          initialData={data}
          initialEmitidoId={emitidoId}
        />
      )}
    </>
  );
}

export default function PlantillaContratoDetallePage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Cargando...</p>}>
      <PlantillaContratoDetalleContent />
    </Suspense>
  );
}
