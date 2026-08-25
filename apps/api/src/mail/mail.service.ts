import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type Transporter from 'nodemailer/lib/mailer';

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
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

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });

    return this.transporter;
  }

  isConfigured() {
    return Boolean(this.config.get<string>('SMTP_HOST')?.trim());
  }

  async sendMail(input: SendMailInput) {
    const to = input.to.trim();
    if (!to) {
      throw new ServiceUnavailableException('Indica un correo destinatario válido');
    }

    const from =
      this.config.get<string>('SMTP_FROM')?.trim() ||
      this.config.get<string>('SMTP_USER')?.trim() ||
      'no-reply@eventosremorent.local';

    const transporter = this.getTransporter();
    if (!transporter) {
      this.logger.warn(`SMTP no configurado — simulando envío a ${to}: ${input.subject}`);
      return {
        ok: true,
        simulated: true,
        messageId: `simulated-${Date.now()}`,
      };
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });

    return {
      ok: true,
      simulated: false,
      messageId: info.messageId,
    };
  }
}
