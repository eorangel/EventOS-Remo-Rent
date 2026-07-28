import { Module } from '@nestjs/common';
import { SubarrendosService } from './subarrendos.service';
import { SubarrendosController } from './subarrendos.controller';

@Module({
  controllers: [SubarrendosController],
  providers: [SubarrendosService],
  exports: [SubarrendosService],
})
export class SubarrendosModule {}
