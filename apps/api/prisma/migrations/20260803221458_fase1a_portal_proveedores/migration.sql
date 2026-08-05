-- CreateEnum
CREATE TYPE "EstadoOrdenCobro" AS ENUM ('BORRADOR', 'PENDIENTE', 'PAGADO', 'VENCIDO', 'CANCELADO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RolUsuario" ADD VALUE 'ADMIN_PROVEEDOR';
ALTER TYPE "RolUsuario" ADD VALUE 'OPERADOR_PROVEEDOR';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "proveedorId" TEXT;

-- CreateTable
CREATE TABLE "ClienteProveedor" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "empresa" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClienteProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenCobro" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "clienteProveedorId" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoOrdenCobro" NOT NULL DEFAULT 'PENDIENTE',
    "metodoPago" "MetodoPago" NOT NULL DEFAULT 'TRANSFERENCIA',
    "referencia" TEXT,
    "fechaVencimiento" TIMESTAMP(3),
    "pagadoEn" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdenCobro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClienteProveedor_proveedorId_idx" ON "ClienteProveedor"("proveedorId");

-- CreateIndex
CREATE INDEX "ClienteProveedor_nombre_idx" ON "ClienteProveedor"("nombre");

-- CreateIndex
CREATE INDEX "OrdenCobro_proveedorId_idx" ON "OrdenCobro"("proveedorId");

-- CreateIndex
CREATE INDEX "OrdenCobro_clienteProveedorId_idx" ON "OrdenCobro"("clienteProveedorId");

-- CreateIndex
CREATE INDEX "OrdenCobro_estado_idx" ON "OrdenCobro"("estado");

-- CreateIndex
CREATE INDEX "OrdenCobro_createdAt_idx" ON "OrdenCobro"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrdenCobro_proveedorId_folio_key" ON "OrdenCobro"("proveedorId", "folio");

-- CreateIndex
CREATE INDEX "Usuario_proveedorId_idx" ON "Usuario"("proveedorId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteProveedor" ADD CONSTRAINT "ClienteProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenCobro" ADD CONSTRAINT "OrdenCobro_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenCobro" ADD CONSTRAINT "OrdenCobro_clienteProveedorId_fkey" FOREIGN KEY ("clienteProveedorId") REFERENCES "ClienteProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
