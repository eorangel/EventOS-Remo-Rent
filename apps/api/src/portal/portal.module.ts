import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { ProveedoresModule } from '../proveedores/proveedores.module';

@Module({
  imports: [ProveedoresModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}