-- CreateEnum
CREATE TYPE "PasarelaPagoProveedor" AS ENUM ('MERCADO_PAGO');

-- AlterTable OrdenCobro - add columns with backfill for tokenPago
ALTER TABLE "OrdenCobro" ADD COLUMN "linkPago" TEXT;
ALTER TABLE "OrdenCobro" ADD COLUMN "mpPreferenceId" TEXT;
ALTER TABLE "OrdenCobro" ADD COLUMN "mpPaymentId" TEXT;
ALTER TABLE "OrdenCobro" ADD COLUMN "linkPagoGeneradoEn" TIMESTAMP(3);
ALTER TABLE "OrdenCobro" ADD COLUMN "tokenPago" TEXT;

UPDATE "OrdenCobro" SET "tokenPago" = 'tok_' || replace(id, '-', '') WHERE "tokenPago" IS NULL;

ALTER TABLE "OrdenCobro" ALTER COLUMN "tokenPago" SET NOT NULL;

-- CreateTable
CREATE TABLE "ConfigPasarelaProveedor" (
    "id" TEXT NOT NULL,
    "proveedorId" TEXT NOT NULL,
    "pasarela" "PasarelaPagoProveedor" NOT NULL DEFAULT 'MERCADO_PAGO',
    "mercadoPagoAccessToken" TEXT,
    "mercadoPagoPublicKey" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigPasarelaProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrdenCobro_tokenPago_key" ON "OrdenCobro"("tokenPago");
CREATE INDEX "OrdenCobro_tokenPago_idx" ON "OrdenCobro"("tokenPago");
CREATE UNIQUE INDEX "ConfigPasarelaProveedor_proveedorId_key" ON "ConfigPasarelaProveedor"("proveedorId");

-- AddForeignKey
ALTER TABLE "ConfigPasarelaProveedor" ADD CONSTRAINT "ConfigPasarelaProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
