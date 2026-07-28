-- CreateEnum
CREATE TYPE "TipoMovimientoFinanciero" AS ENUM ('ANTICIPO', 'PAGO', 'REEMBOLSO', 'GASTO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoMovimientoFinanciero" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('COTIZACION', 'CONTRATO', 'RECIBO', 'ACTA_ENTREGA', 'OTRO');

-- CreateTable
CREATE TABLE "MovimientoFinanciero" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "tipo" "TipoMovimientoFinanciero" NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL DEFAULT 'TRANSFERENCIA',
    "estado" "EstadoMovimientoFinanciero" NOT NULL DEFAULT 'CONFIRMADO',
    "referencia" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovimientoFinanciero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "cotizacionId" TEXT,
    "tipo" "TipoDocumento" NOT NULL,
    "titulo" TEXT NOT NULL,
    "folio" TEXT,
    "contenido" TEXT,
    "generadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MovimientoFinanciero_eventoId_idx" ON "MovimientoFinanciero"("eventoId");

-- CreateIndex
CREATE INDEX "MovimientoFinanciero_tipo_idx" ON "MovimientoFinanciero"("tipo");

-- CreateIndex
CREATE INDEX "MovimientoFinanciero_estado_idx" ON "MovimientoFinanciero"("estado");

-- CreateIndex
CREATE INDEX "MovimientoFinanciero_fecha_idx" ON "MovimientoFinanciero"("fecha");

-- CreateIndex
CREATE INDEX "Documento_eventoId_idx" ON "Documento"("eventoId");

-- CreateIndex
CREATE INDEX "Documento_tipo_idx" ON "Documento"("tipo");

-- CreateIndex
CREATE INDEX "Documento_cotizacionId_idx" ON "Documento"("cotizacionId");

-- AddForeignKey
ALTER TABLE "MovimientoFinanciero" ADD CONSTRAINT "MovimientoFinanciero_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "Cotizacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
