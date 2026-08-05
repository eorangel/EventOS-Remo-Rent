-- CreateTable
CREATE TABLE "PerfilEmpresaProveedor" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "regimenFiscal" TEXT,
    "codigoPostal" TEXT,
    "horario" JSONB,
    "redesSociales" JSONB,
    "politicasRenta" TEXT,
    "condicionesCancelacion" TEXT,
    "ivaIncluido" BOOLEAN NOT NULL DEFAULT false,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfilEmpresaProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PerfilEmpresaProveedor_proveedorId_key" ON "PerfilEmpresaProveedor"("proveedorId");

-- AddForeignKey
ALTER TABLE "PerfilEmpresaProveedor" ADD CONSTRAINT "PerfilEmpresaProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
