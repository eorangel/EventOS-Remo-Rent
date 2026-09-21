import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuthUser, requireProveedorUser } from '../common/utils/user-context';
import { PortalService } from './portal.service';
import {
  buildBriefingContent,
  hoyEnMexico,
  horaActualMexico,
  type BriefingContent,
} from './briefing.utils';

@Injectable()
export class BriefingService {
  private readonly logger = new Logger(BriefingService.name);

  constructor(
    private prisma: PrismaService,
    private portalService: PortalService,
    private mail: MailService,
    private config: ConfigService,
  ) {}

  private appBaseUrl() {
    return (
      this.config.get<string>('WEB_PUBLIC_URL')?.trim().replace(/\/$/, '') ||
      'https://app.remoconecta.com'
    );
  }

  async previewBriefing(user: AuthUser, fecha?: string) {
    const proveedorId = requireProveedorUser(user);
    const day = fecha?.slice(0, 10) ?? hoyEnMexico();
    const content = await this.buildForProveedor(proveedorId, day, user.nombre);
    const { perfil, emailDestino } = await this.resolveBriefingDestino(proveedorId);
    return {
      ...content,
      briefingActivo: perfil?.briefingActivo ?? true,
      briefingHora: perfil?.briefingHora ?? '07:00',
      briefingEmail: emailDestino,
      briefingUltimoEnvio: perfil?.briefingUltimoEnvio?.toISOString() ?? null,
    };
  }

  async enviarBriefingAhora(user: AuthUser, fecha?: string) {
    const proveedorId = requireProveedorUser(user);
    const { emailDestino } = await this.resolveBriefingDestino(proveedorId);
    const to = emailDestino;

    const day = fecha?.slice(0, 10) ?? hoyEnMexico();
    const content = await this.buildForProveedor(proveedorId, day, user.nombre);
    await this.sendBriefingEmail(proveedorId, to, content);

    await this.prisma.perfilEmpresaProveedor.upsert({
      where: { proveedorId },
      create: {
        proveedorId,
        briefingUltimoEnvio: new Date(),
      },
      update: {
        briefingUltimoEnvio: new Date(),
      },
    });

    return {
      ok: true,
      enviadoA: to,
      fecha: day,
      subject: content.subject,
    };
  }

  async getWhatsAppMensaje(user: AuthUser, fecha?: string) {
    const proveedorId = requireProveedorUser(user);
    const day = fecha?.slice(0, 10) ?? hoyEnMexico();
    const content = await this.buildForProveedor(proveedorId, day, user.nombre);
    return { mensaje: content.texto, fecha: day };
  }

  async runScheduledBriefings(horaMeta?: string) {
    const hora = horaMeta ?? horaActualMexico();
    const fecha = hoyEnMexico();

    const perfiles = await this.prisma.perfilEmpresaProveedor.findMany({
      where: {
        briefingActivo: true,
        briefingHora: hora,
      },
      include: { proveedor: true },
    });

    let enviados = 0;
    for (const perfil of perfiles) {
      const email =
        perfil.briefingEmail?.trim() || perfil.proveedor.email?.trim() || '';
      if (!email) continue;

      const yaEnviadoHoy =
        perfil.briefingUltimoEnvio &&
        new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(
          perfil.briefingUltimoEnvio,
        ) === fecha;

      if (yaEnviadoHoy) continue;

      try {
        const content = await this.buildForProveedor(
          perfil.proveedorId,
          fecha,
          perfil.proveedor.contacto ?? perfil.proveedor.nombre,
        );
        await this.sendBriefingEmail(perfil.proveedorId, email, content);
        await this.prisma.perfilEmpresaProveedor.update({
          where: { proveedorId: perfil.proveedorId },
          data: { briefingUltimoEnvio: new Date() },
        });
        enviados += 1;
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Briefing fallido para proveedor ${perfil.proveedorId}: ${detail}`,
        );
      }
    }

    if (enviados > 0) {
      this.logger.log(`Briefing matutino: ${enviados} correo(s) enviado(s) a las ${hora}`);
    }

    return { hora, fecha, enviados, candidatos: perfiles.length };
  }

  private async resolveBriefingDestino(proveedorId: string) {
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id: proveedorId },
      include: { perfilEmpresa: true },
    });
    if (!proveedor) throw new BadRequestException('Proveedor no encontrado');

    const emailDestino =
      proveedor.perfilEmpresa?.briefingEmail?.trim() || proveedor.email?.trim() || '';
    if (!emailDestino) {
      throw new BadRequestException(
        'Configura un correo destinatario en Resumen matutino o en Correo de contacto (Identidad)',
      );
    }

    return { perfil: proveedor.perfilEmpresa, emailDestino };
  }

  private async buildForProveedor(
    proveedorId: string,
    fecha: string,
    destinatarioNombre: string,
  ): Promise<BriefingContent> {
    const proveedor = await this.prisma.proveedor.findUnique({ where: { id: proveedorId } });
    if (!proveedor) throw new BadRequestException('Proveedor no encontrado');

    const agenda = await this.portalService.buildAgendaForProveedor(proveedorId, fecha);
    return buildBriefingContent({
      agenda,
      empresaNombre: proveedor.nombre,
      destinatarioNombre,
      appBaseUrl: this.appBaseUrl(),
    });
  }

  private async sendBriefingEmail(proveedorId: string, to: string, content: BriefingContent) {
    if (!this.mail.isConfigured()) {
      throw new ServiceUnavailableException(
        'El servicio de correo no está configurado. Configura RESEND_API_KEY en Railway.',
      );
    }

    await this.mail.sendMail({
      to,
      subject: content.subject,
      html: content.html,
      text: content.texto,
    });

    this.logger.log(`Briefing enviado a ${to} (proveedor ${proveedorId})`);
  }
}
