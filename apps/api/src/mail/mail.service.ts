import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Mail.Attachment[];
};

type ResendSendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private config: ConfigService) {}

  private resendApiKey(): string | null {
    return this.config.get<string>('RESEND_API_KEY')?.trim() || null;
  }

  private getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;

    const host = this.config.get<string>('SMTP_HOST')?.trim();
    if (!host) return null;

    const port = Number(this.config.get('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER')?.trim();
    const pass = this.config.get<string>('SMTP_PASS')?.trim();

    if (!user || !pass) {
      throw new ServiceUnavailableException(
        'SMTP_USER y SMTP_PASS deben estar configurados en Railway',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: { user, pass },
      connectionTimeout: 20_000,
      greetingTimeout: 20_000,
      socketTimeout: 30_000,
      tls: {
        minVersion: 'TLSv1.2',
      },
    });

    return this.transporter;
  }

  isConfigured() {
    if (this.resendApiKey()) return true;

    const host = this.config.get<string>('SMTP_HOST')?.trim();
    const user = this.config.get<string>('SMTP_USER')?.trim();
    const pass = this.config.get<string>('SMTP_PASS')?.trim();
    return Boolean(host && user && pass);
  }

  private formatFromAddress() {
    const from =
      this.config.get<string>('RESEND_FROM')?.trim() ||
      this.config.get<string>('SMTP_FROM')?.trim() ||
      this.config.get<string>('SMTP_USER')?.trim() ||
      'no-reply@eventosremorent.local';

    if (from.includes('<') && from.includes('>')) return from;

    const user =
      this.config.get<string>('SMTP_USER')?.trim() ||
      this.config.get<string>('RESEND_FROM')?.trim();
    if (user && !from.includes('@')) {
      return `"${from}" <${user}>`;
    }

    return from;
  }

  private attachmentToBase64(content: Mail.Attachment['content']): string | null {
    if (content == null) return null;
    if (Buffer.isBuffer(content)) return content.toString('base64');
    if (typeof content === 'string') return content;
    return null;
  }

  private async sendViaResend(input: SendMailInput) {
    const apiKey = this.resendApiKey();
    if (!apiKey) {
      throw new ServiceUnavailableException('RESEND_API_KEY no está configurado');
    }

    const from = this.formatFromAddress();
    if (!from.includes('@')) {
      throw new BadRequestException(
        'Configura RESEND_FROM o SMTP_FROM con un remitente válido (ej. "Remo&Rent <onboarding@resend.dev>")',
      );
    }

    const payload: Record<string, unknown> = {
      from,
      to: [input.to.trim()],
      subject: input.subject,
      html: input.html,
    };

    if (input.text) payload.text = input.text;
    if (input.replyTo) payload.reply_to = input.replyTo;

    if (input.attachments?.length) {
      payload.attachments = input.attachments
        .map((attachment) => {
          const content = this.attachmentToBase64(attachment.content);
          if (!content || !attachment.filename) return null;
          return {
            filename: attachment.filename,
            content,
          };
        })
        .filter(Boolean);
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data: ResendSendResponse = {};
    try {
      data = (await response.json()) as ResendSendResponse;
    } catch {
      /* ignore */
    }

    if (!response.ok) {
      const detail = data.message ?? `HTTP ${response.status}`;
      this.logger.error(`Error Resend al enviar a ${input.to}: ${detail}`);

      if (/domain|verify|not verified|invalid from/i.test(detail)) {
        throw new BadRequestException(
          `Remitente no verificado en Resend. Verifica el dominio o usa onboarding@resend.dev para pruebas. Detalle: ${detail}`,
        );
      }

      throw new ServiceUnavailableException(`No se pudo enviar el correo: ${detail}`);
    }

    return {
      ok: true,
      simulated: false,
      messageId: data.id ?? `resend-${Date.now()}`,
    };
  }

  async sendMail(input: SendMailInput) {
    const to = input.to.trim();
    if (!to || !to.includes('@')) {
      throw new BadRequestException('Indica un correo destinatario válido');
    }

    if (this.resendApiKey()) {
      return this.sendViaResend(input);
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      this.logger.warn(`Correo no configurado — simulando envío a ${to}: ${input.subject}`);
      return {
        ok: true,
        simulated: true,
        messageId: `simulated-${Date.now()}`,
      };
    }

    try {
      const info = await transporter.sendMail({
        from: this.formatFromAddress(),
        to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
        attachments: input.attachments,
      });

      return {
        ok: true,
        simulated: false,
        messageId: info.messageId,
      };
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error SMTP al enviar a ${to}: ${detail}`);

      if (/invalid login|authentication failed|535|534/i.test(detail)) {
        throw new BadRequestException(
          'Credenciales SMTP incorrectas. Verifica SMTP_USER y la contraseña de aplicación de Gmail.',
        );
      }

      if (/timeout|ETIMEDOUT|ECONNREFUSED|ENETUNREACH/i.test(detail)) {
        throw new ServiceUnavailableException(
          'Railway bloquea SMTP saliente (puertos 587/465). Configura RESEND_API_KEY en el servicio API — ver docs en Resend.com (plan gratis).',
        );
      }

      if (/self-signed|certificate|TLS|SSL/i.test(detail)) {
        throw new ServiceUnavailableException(
          `Error de conexión segura con el servidor SMTP: ${detail}`,
        );
      }

      throw new ServiceUnavailableException(`No se pudo enviar el correo: ${detail}`);
    }
  }
}
