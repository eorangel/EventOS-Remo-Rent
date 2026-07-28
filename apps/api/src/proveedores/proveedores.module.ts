import { Module } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresController } from './proveedores.controller';
import { CatalogoProveedorService } from './catalogo-proveedor.service';
import { CatalogoProveedorController } from './catalogo-proveedor.controller';

@Module({
  controllers: [ProveedoresController, CatalogoProveedorController],
  providers: [ProveedoresService, CatalogoProveedorService],
  exports: [ProveedoresService, CatalogoProveedorService],
})
export class ProveedoresModule {}
