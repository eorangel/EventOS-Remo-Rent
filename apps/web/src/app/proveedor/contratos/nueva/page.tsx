'use client';

import Link from 'next/link';
import { Button, PageHeader } from '@/components/ui';
import { ContratoProveedorForm } from '@/components/ContratoProveedorForm';

export default function NuevaPlantillaContratoPage() {
  return (
    <>
      <PageHeader
        title="Nueva plantilla de contrato"
        description="Edita cláusulas y personaliza el contrato con vista previa en tiempo real"
        action={
          <Link href="/proveedor/contratos">
            <Button variant="secondary">← Contratos</Button>
          </Link>
        }
      />
      <ContratoProveedorForm mode="create" />
    </>
  );
}
