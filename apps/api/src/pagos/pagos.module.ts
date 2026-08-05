import { Module } from '@nestjs/common';
import { PasarelaModule } from '../pasarela/pasarela.module';
import { PagosPublicosController } from './pagos-publicos.controller';

@Module({
  imports: [PasarelaModule],
  controllers: [PagosPublicosController],
})
export class PagosModule {}
