-- CreateEnum
CREATE TYPE "TipoProveedor" AS ENUM ('PROPIO', 'SUBARRENDO');

-- CreateEnum
CREATE TYPE "EstadoCotizacion" AS ENUM ('BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT,
    "descripcion" TEXT,
    "cantidadTotal" INTEGER NOT NULL DEFAULT 0,
    "costoUnitario" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "precioRenta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "tipo" "TipoProveedor" NOT NULL DEFAULT 'SUBARRENDO',
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cotizacion" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "estado" "EstadoCotizacion" NOT NULL DEFAULT 'BORRADOR',
    "margenGlobal" DECIMAL(5,2) NOT NULL DEFAULT 30,
    "subtotalCosto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subtotalVenta" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "utilidad" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notas" TEXT,
    "validoHasta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotizacionItem" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "productoId" TEXT,
    "proveedorId" TEXT,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "costoUnitario" DECIMAL(12,2) NOT NULL,
    "margenPorcentaje" DECIMAL(5,2) NOT NULL DEFAULT 30,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "esSubarrendo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CotizacionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_key" ON "Producto"("codigo");

-- CreateIndex
CREATE INDEX "Producto_categoria_idx" ON "Producto"("categoria");

-- CreateIndex
CREATE INDEX "Producto_activo_idx" ON "Producto"("activo");

-- CreateIndex
CREATE INDEX "Proveedor_tipo_idx" ON "Proveedor"("tipo");

-- CreateIndex
CREATE INDEX "Proveedor_activo_idx" ON "Proveedor"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "Cotizacion_folio_key" ON "Cotizacion"("folio");

-- CreateIndex
CREATE INDEX "Cotizacion_eventoId_idx" ON "Cotizacion"("eventoId");

-- CreateIndex
CREATE INDEX "Cotizacion_estado_idx" ON "Cotizacion"("estado");

-- CreateIndex
CREATE INDEX "CotizacionItem_cotizacionId_idx" ON "CotizacionItem"("cotizacionId");

-- CreateIndex
CREATE INDEX "CotizacionItem_productoId_idx" ON "CotizacionItem"("productoId");

-- AddForeignKey
ALTER TABLE "Cotizacion" ADD CONSTRAINT "Cotizacion_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionItem" ADD CONSTRAINT "CotizacionItem_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "Cotizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionItem" ADD CONSTRAINT "CotizacionItem_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionItem" ADD CONSTRAINT "CotizacionItem_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
