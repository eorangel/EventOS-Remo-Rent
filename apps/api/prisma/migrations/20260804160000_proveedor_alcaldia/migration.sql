-- AlterTable
ALTER TABLE "Proveedor" ADD COLUMN "alcaldia" TEXT;

-- CreateIndex
CREATE INDEX "Proveedor_alcaldia_idx" ON "Proveedor"("alcaldia");
