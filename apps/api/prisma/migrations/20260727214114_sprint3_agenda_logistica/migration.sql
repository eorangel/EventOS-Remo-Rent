-- CreateEnum
CREATE TYPE "TipoActividad" AS ENUM ('MONTAJE', 'EVENTO', 'DESMONTAJE', 'ENTREGA', 'RECOLECCION');

-- CreateEnum
CREATE TYPE "EstadoLogistica" AS ENUM ('PENDIENTE', 'PROGRAMADA', 'EN_RUTA', 'COMPLETADA');

-- CreateEnum
CREATE TYPE "EstadoSubarrendo" AS ENUM ('IDENTIFICADO', 'SOLICITADO', 'CONFIRMADO', 'RECIBIDO', 'DEVUELTO');

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "capacidad" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActividadAgenda" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "tipo" "TipoActividad" NOT NULL,
    "titulo" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "lugar" TEXT,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActividadAgenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logistica" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "vehiculoId" TEXT,
    "conductor" TEXT,
    "equipo" TEXT,
    "fechaSalida" TIMESTAMP(3),
    "fechaRegreso" TIMESTAMP(3),
    "ruta" TEXT,
    "estado" "EstadoLogistica" NOT NULL DEFAULT 'PENDIENTE',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Logistica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogisticaChecklistItem" (
    "id" TEXT NOT NULL,
    "logisticaId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LogisticaChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subarrendo" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "cotizacionItemId" TEXT,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "costo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estado" "EstadoSubarrendo" NOT NULL DEFAULT 'IDENTIFICADO',
    "fechaEntrega" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subarrendo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_placa_key" ON "Vehiculo"("placa");

-- CreateIndex
CREATE INDEX "ActividadAgenda_eventoId_idx" ON "ActividadAgenda"("eventoId");

-- CreateIndex
CREATE INDEX "ActividadAgenda_fechaInicio_idx" ON "ActividadAgenda"("fechaInicio");

-- CreateIndex
CREATE UNIQUE INDEX "Logistica_eventoId_key" ON "Logistica"("eventoId");

-- CreateIndex
CREATE INDEX "Logistica_estado_idx" ON "Logistica"("estado");

-- CreateIndex
CREATE INDEX "LogisticaChecklistItem_logisticaId_idx" ON "LogisticaChecklistItem"("logisticaId");

-- CreateIndex
CREATE INDEX "Subarrendo_eventoId_idx" ON "Subarrendo"("eventoId");

-- CreateIndex
CREATE INDEX "Subarrendo_estado_idx" ON "Subarrendo"("estado");

-- AddForeignKey
ALTER TABLE "ActividadAgenda" ADD CONSTRAINT "ActividadAgenda_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logistica" ADD CONSTRAINT "Logistica_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logistica" ADD CONSTRAINT "Logistica_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticaChecklistItem" ADD CONSTRAINT "LogisticaChecklistItem_logisticaId_fkey" FOREIGN KEY ("logisticaId") REFERENCES "Logistica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subarrendo" ADD CONSTRAINT "Subarrendo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subarrendo" ADD CONSTRAINT "Subarrendo_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
