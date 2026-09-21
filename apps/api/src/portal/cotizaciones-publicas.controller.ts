import { Controller, Get, Param } from '@nestjs/common';
import { PortalService } from './portal.service';

@Controller('cotizaciones')
export class CotizacionesPublicasController {
  constructor(private portalService: PortalService) {}

  @Get('publico/:token')
  getCotizacionPublica(@Param('token') token: string) {
    return this.portalService.getCotizacionPublica(token);
  }
}
