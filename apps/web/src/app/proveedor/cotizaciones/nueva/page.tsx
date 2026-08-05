'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, PageHeader } from '@/components/ui';
import { CotizacionProveedorForm } from '@/components/CotizacionProveedorForm';

export default function NuevaCotizacionProveedorPage() {
  const searchParams = useSearchParams();
  const clienteId = searchParams.get('clienteId') ?? undefined;

  return (
    <>
      <PageHeader
        title="Nueva cotización"
        description="Selecciona productos, ajusta envío, IVA y descuento — lista en 2 minutos"
        action={
          <Link href="/proveedor/cotizaciones">
            <Button variant="secondary">← Cotizaciones</Button>
          </Link>
        }
      />
      <CotizacionProveedorForm mode="create" initialClienteId={clienteId} />
    </>
  );
}
