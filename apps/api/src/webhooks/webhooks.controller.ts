import { Controller, Get, Post, Query, Body, Logger } from '@nestjs/common';
import { PasarelaService } from '../pasarela/pasarela.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private pasarelaService: PasarelaService) {}

  @Post('mercadopago')
  async mercadoPago(
    @Query('topic') topic?: string,
    @Query('id') queryId?: string,
    @Body() body?: { type?: string; data?: { id?: string }; action?: string },
  ) {
    const paymentId =
      body?.data?.id ??
      (topic === 'payment' || body?.type === 'payment' ? queryId : undefined);

    if (!paymentId) {
      this.logger.warn('Webhook MP sin payment id', { topic, queryId, body });
      return { ok: true, skipped: true };
    }

    try {
      const result = await this.pasarelaService.procesarWebhook(String(paymentId));
      return { ok: true, result };
    } catch (err) {
      this.logger.error('Error procesando webhook MP', err);
      return { ok: false };
    }
  }

  @Get('mercadopago')
  mercadoPagoPing() {
    return { ok: true, service: 'EventOS Mercado Pago webhook' };
  }
}
