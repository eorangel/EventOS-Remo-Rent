-- CreateEnum
CREATE TYPE "TipoServicioContrato" AS ENUM ('GENERAL', 'RENTA_MOBILIARIO', 'SERVICIO', 'BANQUETE');

-- CreateEnum
CREATE TYPE "ModoPlantillaContrato" AS ENUM ('EDITOR', 'ARCHIVO');

-- CreateEnum
CREATE TYPE "EstadoPlantillaContrato" AS ENUM ('BORRADOR', 'ACTIVA', 'ARCHIVADA');

-- CreateTable
CREATE TABLE "PlantillaContratoProveedor" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoServicio" "TipoServicioContrato" NOT NULL DEFAULT 'GENERAL',
    "servicioProveedorId" TEXT,
    "menuBanqueteProveedorId" TEXT,
    "modo" "ModoPlantillaContrato" NOT NULL DEFAULT 'EDITOR',
    "estado" "EstadoPlantillaContrato" NOT NULL DEFAULT 'BORRADOR',
    "secciones" JSONB,
    "archivoNombre" TEXT,
    "archivoMime" TEXT,
    "archivoContenido" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantillaContratoProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlantillaContratoProveedor_proveedorId_idx" ON "PlantillaContratoProveedor"("proveedorId");

-- CreateIndex
CREATE INDEX "PlantillaContratoProveedor_tipoServicio_idx" ON "PlantillaContratoProveedor"("tipoServicio");

-- CreateIndex
CREATE INDEX "PlantillaContratoProveedor_estado_idx" ON "PlantillaContratoProveedor"("estado");

-- AddForeignKey
ALTER TABLE "PlantillaContratoProveedor" ADD CONSTRAINT "PlantillaContratoProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantillaContratoProveedor" ADD CONSTRAINT "PlantillaContratoProveedor_servicioProveedorId_fkey" FOREIGN KEY ("servicioProveedorId") REFERENCES "ServicioProveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantillaContratoProveedor" ADD CONSTRAINT "PlantillaContratoProveedor_menuBanqueteProveedorId_fkey" FOREIGN KEY ("menuBanqueteProveedorId") REFERENCES "MenuBanqueteProveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
