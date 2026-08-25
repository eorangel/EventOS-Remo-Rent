-- CreateTable
CREATE TABLE "ContratoEmitidoProveedor" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "plantillaContratoId" TEXT NOT NULL,
    "cotizacionProveedorId" TEXT,
    "folio" TEXT NOT NULL,
    "clienteNombre" TEXT NOT NULL,
    "clienteEmpresa" TEXT,
    "clienteEmail" TEXT,
    "clienteTelefono" TEXT,
    "fechaEvento" TIMESTAMP(3),
    "lugarEvento" TEXT,
    "montoTotal" DECIMAL(12,2),
    "servicioNombre" TEXT,
    "enviadoEn" TIMESTAMP(3),
    "enviadoA" TEXT,
    "asuntoEnvio" TEXT,
    "mensajeEnvio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContratoEmitidoProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContratoEmitidoProveedor_cotizacionProveedorId_key" ON "ContratoEmitidoProveedor"("cotizacionProveedorId");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoEmitidoProveedor_proveedorId_folio_key" ON "ContratoEmitidoProveedor"("proveedorId", "folio");

-- CreateIndex
CREATE INDEX "ContratoEmitidoProveedor_proveedorId_idx" ON "ContratoEmitidoProveedor"("proveedorId");

-- CreateIndex
CREATE INDEX "ContratoEmitidoProveedor_plantillaContratoId_idx" ON "ContratoEmitidoProveedor"("plantillaContratoId");

-- CreateIndex
CREATE INDEX "ContratoEmitidoProveedor_createdAt_idx" ON "ContratoEmitidoProveedor"("createdAt");

-- AddForeignKey
ALTER TABLE "ContratoEmitidoProveedor" ADD CONSTRAINT "ContratoEmitidoProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoEmitidoProveedor" ADD CONSTRAINT "ContratoEmitidoProveedor_plantillaContratoId_fkey" FOREIGN KEY ("plantillaContratoId") REFERENCES "PlantillaContratoProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoEmitidoProveedor" ADD CONSTRAINT "ContratoEmitidoProveedor_cotizacionProveedorId_fkey" FOREIGN KEY ("cotizacionProveedorId") REFERENCES "CotizacionProveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
