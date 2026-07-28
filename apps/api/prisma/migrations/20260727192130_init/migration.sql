-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'COMERCIAL', 'OPERATIVO', 'COMPRAS', 'FINANZAS');

-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('BORRADOR', 'COTIZACION', 'CONFIRMADO', 'EN_LOGISTICA', 'EN_EJECUCION', 'COMPLETADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "empresa" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaEvento" TIMESTAMP(3) NOT NULL,
    "fechaMontaje" TIMESTAMP(3),
    "fechaDesmontaje" TIMESTAMP(3),
    "lugar" TEXT,
    "estado" "EstadoEvento" NOT NULL DEFAULT 'BORRADOR',
    "notas" TEXT,
    "clienteId" TEXT NOT NULL,
    "creadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Evento_clienteId_idx" ON "Evento"("clienteId");

-- CreateIndex
CREATE INDEX "Evento_estado_idx" ON "Evento"("estado");

-- CreateIndex
CREATE INDEX "Evento_fechaEvento_idx" ON "Evento"("fechaEvento");

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
