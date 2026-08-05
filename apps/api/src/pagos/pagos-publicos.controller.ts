import { Controller, Get, Param } from '@nestjs/common';
import { PasarelaService } from '../pasarela/pasarela.service';

@Controller('pagos')
export class PagosPublicosController {
  constructor(private pasarelaService: PasarelaService) {}

  @Get('publico/:token')
  getOrdenPublica(@Param('token') token: string) {
    return this.pasarelaService.getOrdenPublica(token);
  }
}
