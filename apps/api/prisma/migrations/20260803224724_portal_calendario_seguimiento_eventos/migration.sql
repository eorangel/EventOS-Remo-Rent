-- CreateEnum
CREATE TYPE "EstadoEventoProveedor" AS ENUM ('COTIZACION', 'CONFIRMADO', 'EN_EJECUCION', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoSeguimientoCliente" AS ENUM ('LLAMADA', 'REUNION', 'WHATSAPP', 'CORREO', 'VISITA', 'NOTA', 'RECORDATORIO');

-- CreateEnum
CREATE TYPE "EstadoSeguimientoCliente" AS ENUM ('PENDIENTE', 'COMPLETADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "EventoClienteProveedor" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "clienteProveedorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaEvento" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "lugar" TEXT,
    "estado" "EstadoEventoProveedor" NOT NULL DEFAULT 'COTIZACION',
    "montoEstimado" DECIMAL(12,2),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoClienteProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeguimientoCliente" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "clienteProveedorId" TEXT NOT NULL,
    "tipo" "TipoSeguimientoCliente" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaProgramada" TIMESTAMP(3) NOT NULL,
    "completadoEn" TIMESTAMP(3),
    "estado" "EstadoSeguimientoCliente" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeguimientoCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventoClienteProveedor_proveedorId_idx" ON "EventoClienteProveedor"("proveedorId");

-- CreateIndex
CREATE INDEX "EventoClienteProveedor_clienteProveedorId_idx" ON "EventoClienteProveedor"("clienteProveedorId");

-- CreateIndex
CREATE INDEX "EventoClienteProveedor_fechaEvento_idx" ON "EventoClienteProveedor"("fechaEvento");

-- CreateIndex
CREATE INDEX "EventoClienteProveedor_estado_idx" ON "EventoClienteProveedor"("estado");

-- CreateIndex
CREATE INDEX "SeguimientoCliente_proveedorId_idx" ON "SeguimientoCliente"("proveedorId");

-- CreateIndex
CREATE INDEX "SeguimientoCliente_clienteProveedorId_idx" ON "SeguimientoCliente"("clienteProveedorId");

-- CreateIndex
CREATE INDEX "SeguimientoCliente_fechaProgramada_idx" ON "SeguimientoCliente"("fechaProgramada");

-- CreateIndex
CREATE INDEX "SeguimientoCliente_estado_idx" ON "SeguimientoCliente"("estado");

-- AddForeignKey
ALTER TABLE "EventoClienteProveedor" ADD CONSTRAINT "EventoClienteProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoClienteProveedor" ADD CONSTRAINT "EventoClienteProveedor_clienteProveedorId_fkey" FOREIGN KEY ("clienteProveedorId") REFERENCES "ClienteProveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguimientoCliente" ADD CONSTRAINT "SeguimientoCliente_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguimientoCliente" ADD CONSTRAINT "SeguimientoCliente_clienteProveedorId_fkey" FOREIGN KEY ("clienteProveedorId") REFERENCES "ClienteProveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
