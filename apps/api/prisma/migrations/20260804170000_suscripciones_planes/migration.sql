-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('PRUEBA', 'ACTIVA', 'SUSPENDIDA', 'CANCELADA', 'VENCIDA');

-- CreateEnum
CREATE TYPE "EstadoPagoSuscripcion" AS ENUM ('PENDIENTE', 'PAGADO', 'FALLIDO', 'REEMBOLSADO');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "precioMensual" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suscripcion" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "estado" "EstadoSuscripcion" NOT NULL DEFAULT 'PRUEBA',
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proximoCobro" TIMESTAMP(3),
    "metodoPago" "MetodoPago",
    "referenciaPago" TEXT,
    "canceladaEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoSuscripcion" (
    "id" TEXT NOT NULL,
    "suscripcionId" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "estado" "EstadoPagoSuscripcion" NOT NULL DEFAULT 'PAGADO',
    "metodoPago" "MetodoPago" NOT NULL,
    "referencia" TEXT,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFin" TIMESTAMP(3) NOT NULL,
    "pagadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagoSuscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_codigo_key" ON "Plan"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Suscripcion_proveedorId_key" ON "Suscripcion"("proveedorId");

-- CreateIndex
CREATE INDEX "Suscripcion_planId_idx" ON "Suscripcion"("planId");

-- CreateIndex
CREATE INDEX "Suscripcion_estado_idx" ON "Suscripcion"("estado");

-- CreateIndex
CREATE INDEX "Suscripcion_proximoCobro_idx" ON "Suscripcion"("proximoCobro");

-- CreateIndex
CREATE INDEX "PagoSuscripcion_suscripcionId_idx" ON "PagoSuscripcion"("suscripcionId");

-- CreateIndex
CREATE INDEX "PagoSuscripcion_pagadoEn_idx" ON "PagoSuscripcion"("pagadoEn");

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suscripcion" ADD CONSTRAINT "Suscripcion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoSuscripcion" ADD CONSTRAINT "PagoSuscripcion_suscripcionId_fkey" FOREIGN KEY ("suscripcionId") REFERENCES "Suscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
