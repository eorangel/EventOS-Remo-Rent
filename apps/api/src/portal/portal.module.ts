import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { CotizacionesPublicasController } from './cotizaciones-publicas.controller';
import { PortalService } from './portal.service';
import { ProveedoresModule } from '../proveedores/proveedores.module';

@Module({
  imports: [ProveedoresModule],
  controllers: [PortalController, CotizacionesPublicasController],
  providers: [PortalService],
})
export class PortalModule {}