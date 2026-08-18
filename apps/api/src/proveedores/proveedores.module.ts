import { Module } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { CatalogoProveedorService } from './catalogo-proveedor.service';
import { CatalogoBanqueteService } from './catalogo-banquete.service';
import { CatalogoProveedorController } from './catalogo-proveedor.controller';

@Module({
  controllers: [ProveedoresController, CatalogoProveedorController],
  providers: [ProveedoresService, CatalogoProveedorService, CatalogoBanqueteService],
  exports: [ProveedoresService, CatalogoProveedorService, CatalogoBanqueteService],
})
export class ProveedoresModule {}
