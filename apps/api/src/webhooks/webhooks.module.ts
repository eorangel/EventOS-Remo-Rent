import { Module } from '@nestjs/common';
import { PasarelaModule } from '../pasarela/pasarela.module';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [PasarelaModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
