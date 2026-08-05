-- CreateTable
CREATE TABLE "CotizacionProveedor" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "clienteProveedorId" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "titulo" TEXT,
    "estado" "EstadoCotizacion" NOT NULL DEFAULT 'BORRADOR',
    "fechaEvento" TIMESTAMP(3),
    "lugarEntrega" TEXT,
    "costoEnvio" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "descuentoPorcentaje" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "descuentoMonto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "ivaPorcentaje" DECIMAL(5,2) NOT NULL DEFAULT 16,
    "ivaIncluido" BOOLEAN NOT NULL DEFAULT false,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "montoIva" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notas" TEXT,
    "validoHasta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CotizacionProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotizacionProveedorItem" (
    "id" TEXT NOT NULL,
    "cotizacionProveedorId" TEXT NOT NULL,
    "productoProveedorId" TEXT,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "CotizacionProveedorItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CotizacionProveedor_proveedorId_idx" ON "CotizacionProveedor"("proveedorId");

-- CreateIndex
CREATE INDEX "CotizacionProveedor_clienteProveedorId_idx" ON "CotizacionProveedor"("clienteProveedorId");

-- CreateIndex
CREATE INDEX "CotizacionProveedor_estado_idx" ON "CotizacionProveedor"("estado");

-- CreateIndex
CREATE INDEX "CotizacionProveedor_createdAt_idx" ON "CotizacionProveedor"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CotizacionProveedor_proveedorId_folio_key" ON "CotizacionProveedor"("proveedorId", "folio");

-- CreateIndex
CREATE INDEX "CotizacionProveedorItem_cotizacionProveedorId_idx" ON "CotizacionProveedorItem"("cotizacionProveedorId");

-- CreateIndex
CREATE INDEX "CotizacionProveedorItem_productoProveedorId_idx" ON "CotizacionProveedorItem"("productoProveedorId");

-- AddForeignKey
ALTER TABLE "CotizacionProveedor" ADD CONSTRAINT "CotizacionProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionProveedor" ADD CONSTRAINT "CotizacionProveedor_clienteProveedorId_fkey" FOREIGN KEY ("clienteProveedorId") REFERENCES "ClienteProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionProveedorItem" ADD CONSTRAINT "CotizacionProveedorItem_cotizacionProveedorId_fkey" FOREIGN KEY ("cotizacionProveedorId") REFERENCES "CotizacionProveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionProveedorItem" ADD CONSTRAINT "CotizacionProveedorItem_productoProveedorId_fkey" FOREIGN KEY ("productoProveedorId") REFERENCES "ProductoProveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
