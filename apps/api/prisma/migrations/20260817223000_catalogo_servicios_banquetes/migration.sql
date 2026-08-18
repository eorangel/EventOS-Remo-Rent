-- CreateEnum
CREATE TYPE "SeccionPlatilloMenu" AS ENUM ('ENTRADA', 'SOPA', 'PLATO_FUERTE', 'GUARNICION', 'POSTRE', 'BEBIDA', 'OTRO');

-- CreateEnum
CREATE TYPE "ModalidadPrecioMenu" AS ENUM ('POR_PERSONA', 'POR_EVENTO');

-- CreateTable
CREATE TABLE "MenuBanqueteProveedor" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioPorPersona" DECIMAL(12,2),
    "precioPorEvento" DECIMAL(12,2),
    "minimoPersonas" INTEGER,
    "incluyeBebidas" BOOLEAN NOT NULL DEFAULT false,
    "incluyeMeseros" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuBanqueteProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatilloMenuBanquete" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "seccion" "SeccionPlatilloMenu" NOT NULL DEFAULT 'OTRO',
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlatilloMenuBanquete_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "CotizacionProveedorItem" ADD COLUMN     "menuBanqueteProveedorId" TEXT,
ADD COLUMN     "servicioProveedorId" TEXT,
ADD COLUMN     "modalidadPrecioMenu" "ModalidadPrecioMenu";

-- CreateIndex
CREATE INDEX "MenuBanqueteProveedor_proveedorId_idx" ON "MenuBanqueteProveedor"("proveedorId");

-- CreateIndex
CREATE INDEX "MenuBanqueteProveedor_activo_idx" ON "MenuBanqueteProveedor"("activo");

-- CreateIndex
CREATE INDEX "PlatilloMenuBanquete_menuId_idx" ON "PlatilloMenuBanquete"("menuId");

-- CreateIndex
CREATE INDEX "CotizacionProveedorItem_menuBanqueteProveedorId_idx" ON "CotizacionProveedorItem"("menuBanqueteProveedorId");

-- CreateIndex
CREATE INDEX "CotizacionProveedorItem_servicioProveedorId_idx" ON "CotizacionProveedorItem"("servicioProveedorId");

-- AddForeignKey
ALTER TABLE "MenuBanqueteProveedor" ADD CONSTRAINT "MenuBanqueteProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatilloMenuBanquete" ADD CONSTRAINT "PlatilloMenuBanquete_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenuBanqueteProveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionProveedorItem" ADD CONSTRAINT "CotizacionProveedorItem_menuBanqueteProveedorId_fkey" FOREIGN KEY ("menuBanqueteProveedorId") REFERENCES "MenuBanqueteProveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotizacionProveedorItem" ADD CONSTRAINT "CotizacionProveedorItem_servicioProveedorId_fkey" FOREIGN KEY ("servicioProveedorId") REFERENCES "ServicioProveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
