-- CreateEnum
CREATE TYPE "EstadoVerificacionProveedor" AS ENUM ('BORRADOR', 'EN_REVISION', 'VERIFICADO');

-- CreateEnum
CREATE TYPE "OrigenCapturaProveedor" AS ENUM ('INTERNO', 'TELEFONO', 'VISITA', 'WEB');

-- CreateEnum
CREATE TYPE "UnidadMedidaProducto" AS ENUM ('PIEZA', 'METRO', 'METRO2', 'PAQUETE', 'SERVICIO');

-- AlterTable
ALTER TABLE "Proveedor" ADD COLUMN     "ciudad" TEXT,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "entidadFederativa" TEXT,
ADD COLUMN     "estadoVerificacion" "EstadoVerificacionProveedor" NOT NULL DEFAULT 'BORRADOR',
ADD COLUMN     "eventosSimultaneosMax" INTEGER,
ADD COLUMN     "latitud" DECIMAL(10,7),
ADD COLUMN     "longitud" DECIMAL(10,7),
ADD COLUMN     "origenCaptura" "OrigenCapturaProveedor" NOT NULL DEFAULT 'INTERNO',
ADD COLUMN     "radioCoberturaKm" INTEGER,
ADD COLUMN     "razonSocial" TEXT,
ADD COLUMN     "rfc" TEXT,
ADD COLUMN     "sitioWeb" TEXT,
ADD COLUMN     "unidadesMaxEntrega" INTEGER;

-- CreateTable
CREATE TABLE "ProductoProveedor" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT,
    "descripcion" TEXT,
    "cantidadDisponible" INTEGER NOT NULL DEFAULT 0,
    "precioReferencia" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unidadMedida" "UnidadMedidaProducto" NOT NULL DEFAULT 'PIEZA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductoProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoProductoProveedor" (
    "id" TEXT NOT NULL,
    "productoProveedorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FotoProductoProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoberturaProveedor" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "ciudad" TEXT,
    "notas" TEXT,

    CONSTRAINT "CoberturaProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioProveedor" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioReferencia" DECIMAL(12,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicioProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductoProveedor_proveedorId_idx" ON "ProductoProveedor"("proveedorId");

-- CreateIndex
CREATE INDEX "ProductoProveedor_categoria_idx" ON "ProductoProveedor"("categoria");

-- CreateIndex
CREATE INDEX "ProductoProveedor_activo_idx" ON "ProductoProveedor"("activo");

-- CreateIndex
CREATE INDEX "FotoProductoProveedor_productoProveedorId_idx" ON "FotoProductoProveedor"("productoProveedorId");

-- CreateIndex
CREATE INDEX "CoberturaProveedor_proveedorId_idx" ON "CoberturaProveedor"("proveedorId");

-- CreateIndex
CREATE INDEX "CoberturaProveedor_entidad_idx" ON "CoberturaProveedor"("entidad");

-- CreateIndex
CREATE INDEX "ServicioProveedor_proveedorId_idx" ON "ServicioProveedor"("proveedorId");

-- CreateIndex
CREATE INDEX "Proveedor_entidadFederativa_idx" ON "Proveedor"("entidadFederativa");

-- CreateIndex
CREATE INDEX "Proveedor_ciudad_idx" ON "Proveedor"("ciudad");

-- CreateIndex
CREATE INDEX "Proveedor_estadoVerificacion_idx" ON "Proveedor"("estadoVerificacion");

-- AddForeignKey
ALTER TABLE "ProductoProveedor" ADD CONSTRAINT "ProductoProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoProductoProveedor" ADD CONSTRAINT "FotoProductoProveedor_productoProveedorId_fkey" FOREIGN KEY ("productoProveedorId") REFERENCES "ProductoProveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoberturaProveedor" ADD CONSTRAINT "CoberturaProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicioProveedor" ADD CONSTRAINT "ServicioProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
