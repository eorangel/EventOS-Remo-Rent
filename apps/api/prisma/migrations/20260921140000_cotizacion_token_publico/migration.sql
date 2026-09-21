-- AlterTable
ALTER TABLE "CotizacionProveedor" ADD COLUMN "tokenPublico" TEXT;

UPDATE "CotizacionProveedor"
SET "tokenPublico" = 'cot_' || replace(gen_random_uuid()::text, '-', '')
WHERE "tokenPublico" IS NULL;

ALTER TABLE "CotizacionProveedor" ALTER COLUMN "tokenPublico" SET NOT NULL;

CREATE UNIQUE INDEX "CotizacionProveedor_tokenPublico_key" ON "CotizacionProveedor"("tokenPublico");
