import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';
import { PasarelaService } from './pasarela.service';

@Module({
  providers: [MercadoPagoService, PasarelaService],
  exports: [PasarelaService, MercadoPagoService],
})
export class PasarelaModule {}
