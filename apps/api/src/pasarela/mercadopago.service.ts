import { Injectable, Logger } from '@nestjs/common';

type PreferenceItem = {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
};

type CreatePreferenceParams = {
  accessToken: string;
  items: PreferenceItem[];
  externalReference: string;
  notificationUrl: string;
  backUrls: {
    success: string;
    failure: string;
    pending: string;
  };
  payerEmail?: string;
};

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly baseUrl = 'https://api.mercadopago.com';

  async createPreference(params: CreatePreferenceParams) {
    const body = {
      items: params.items,
      external_reference: params.externalReference,
      notification_url: params.notificationUrl,
      back_urls: params.backUrls,
      auto_return: 'approved',
      ...(params.payerEmail ? { payer: { email: params.payerEmail } } : {}),
    };

    const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      this.logger.error('Mercado Pago preference error', data);
      const message =
        typeof data.message === 'string'
          ? data.message
          : 'No se pudo crear la preferencia de pago';
      throw new Error(message);
    }

    return {
      id: String(data.id),
      initPoint: String(data.init_point ?? data.sandbox_init_point ?? ''),
      sandboxInitPoint: data.sandbox_init_point ? String(data.sandbox_init_point) : null,
    };
  }

  async getPayment(accessToken: string, paymentId: string) {
    const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      this.logger.error('Mercado Pago payment fetch error', data);
      throw new Error('No se pudo consultar el pago');
    }

    return {
      id: String(data.id),
      status: String(data.status),
      externalReference: data.external_reference ? String(data.external_reference) : null,
      transactionAmount: Number(data.transaction_amount ?? 0),
    };
  }
}
