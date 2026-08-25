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

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private config: ConfigService) {}

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
    const host = this.config.get<string>('SMTP_HOST')?.trim();
    const user = this.config.get<string>('SMTP_USER')?.trim();
    const pass = this.config.get<string>('SMTP_PASS')?.trim();
    return Boolean(host && user && pass);
  }

  private formatFromAddress() {
    const from =
      this.config.get<string>('SMTP_FROM')?.trim() ||
      this.config.get<string>('SMTP_USER')?.trim() ||
      'no-reply@eventosremorent.local';

    if (from.includes('<') && from.includes('>')) return from;

    const user = this.config.get<string>('SMTP_USER')?.trim();
    if (user && !from.includes('@')) {
      return `"${from}" <${user}>`;
    }

    return from;
  }

  async sendMail(input: SendMailInput) {
    const to = input.to.trim();
    if (!to || !to.includes('@')) {
      throw new BadRequestException('Indica un correo destinatario válido');
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      this.logger.warn(`SMTP no configurado — simulando envío a ${to}: ${input.subject}`);
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

      if (/self-signed|certificate|TLS|SSL/i.test(detail)) {
        throw new ServiceUnavailableException(
          `Error de conexión segura con el servidor SMTP: ${detail}`,
        );
      }

      throw new ServiceUnavailableException(`No se pudo enviar el correo: ${detail}`);
    }
  }
}
