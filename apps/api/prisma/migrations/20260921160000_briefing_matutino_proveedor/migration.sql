-- AlterTable
ALTER TABLE "PerfilEmpresaProveedor" ADD COLUMN "briefingActivo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "PerfilEmpresaProveedor" ADD COLUMN "briefingHora" TEXT NOT NULL DEFAULT '07:00';
ALTER TABLE "PerfilEmpresaProveedor" ADD COLUMN "briefingEmail" TEXT;
ALTER TABLE "PerfilEmpresaProveedor" ADD COLUMN "briefingUltimoEnvio" TIMESTAMP(3);
