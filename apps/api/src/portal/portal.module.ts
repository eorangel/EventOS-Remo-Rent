import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PortalController } from './portal.controller';
import { CotizacionesPublicasController } from './cotizaciones-publicas.controller';
import { PortalService } from './portal.service';
import { BriefingService } from './briefing.service';
import { BriefingCron } from './briefing.cron';
import { CopilotoService } from './copiloto.service';
import { ProveedoresModule } from '../proveedores/proveedores.module';

@Module({
  imports: [ProveedoresModule, ScheduleModule],
  controllers: [PortalController, CotizacionesPublicasController],
  providers: [PortalService, BriefingService, BriefingCron, CopilotoService],
})
export class PortalModule {}