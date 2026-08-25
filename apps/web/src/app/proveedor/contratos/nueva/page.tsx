'use client';

import Link from 'next/link';
import { Button, PageHeader } from '@/components/ui';
import { ContratoProveedorForm } from '@/components/ContratoProveedorForm';

export default function NuevaPlantillaContratoPage() {
  return (
    <>
      <PageHeader
        title="Nueva plantilla de contrato"
        description="Arma cláusulas personalizadas o carga un archivo existente"
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
