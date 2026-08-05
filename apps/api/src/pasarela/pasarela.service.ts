import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EstadoOrdenCobro,
  MetodoPago,
  RolUsuario,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/pricing';
import { AuthUser, requireProveedorUser } from '../common/utils/user-context';
import { UpdatePasarelaProveedorDto } from './dto/pasarela.dto';
import { MercadoPagoService } from './mercadopago.service';

@Injectable()
export class PasarelaService {
  constructor(
    private prisma: PrismaService,
    private mp: MercadoPagoService,
    private config: ConfigService,
  ) {}

  async getConfig(user: AuthUser) {
    const proveedorId = requireProveedorUser(user);
    const config = await this.prisma.configPasarelaProveedor.findUnique({
      where: { proveedorId },
    });
    const envToken = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    const tokenConfigured = !!(config?.mercadoPagoAccessToken || envToken);

    return {
      pasarela: 'MERCADO_PAGO' as const,
      activo: config?.activo ?? false,
      tokenConfigured,
      usaTokenPlataforma: !config?.mercadoPagoAccessToken && !!envToken,
      publicKey: config?.mercadoPagoPublicKey ?? this.config.get('MERCADOPAGO_PUBLIC_KEY') ?? null,
      webhookUrl: this.webhookUrl(),
    };
  }

  async updateConfig(user: AuthUser, dto: UpdatePasarelaProveedorDto) {
    const proveedorId = requireProveedorUser(user);
    if (user.rol !== RolUsuario.ADMIN_PROVEEDOR) {
      throw new BadRequestException('Solo el admin del proveedor puede configurar la pasarela');
    }

    return this.prisma.configPasarelaProveedor.upsert({
      where: { proveedorId },
      create: {
        proveedorId,
        mercadoPagoAccessToken: dto.mercadoPagoAccessToken,
        mercadoPagoPublicKey: dto.mercadoPagoPublicKey,
        activo: dto.activo ?? true,
      },
      update: {
        ...(dto.mercadoPagoAccessToken !== undefined
          ? { mercadoPagoAccessToken: dto.mercadoPagoAccessToken || null }
          : {}),
        ...(dto.mercadoPagoPublicKey !== undefined
          ? { mercadoPagoPublicKey: dto.mercadoPagoPublicKey || null }
          : {}),
        ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
      },
      select: {
        id: true,
        activo: true,
        mercadoPagoPublicKey: true,
        updatedAt: true,
      },
    });
  }

  async generarLinkPago(user: AuthUser, ordenId: string) {
    const proveedorId = requireProveedorUser(user);
    const orden = await this.prisma.ordenCobro.findFirst({
      where: { id: ordenId, proveedorId },
      include: {
        clienteProveedor: true,
        proveedor: { select: { nombre: true } },
      },
    });
    if (!orden) throw new NotFoundException('Orden de cobro no encontrada');
    if (orden.estado === EstadoOrdenCobro.PAGADO) {
      throw new BadRequestException('Esta orden ya está pagada');
    }
    if (orden.estado === EstadoOrdenCobro.CANCELADO) {
      throw new BadRequestException('Esta orden está cancelada');
    }

    const accessToken = await this.resolveAccessToken(proveedorId);
    const monto = toNumber(orden.monto);
    const webBase = this.config.get('WEB_PUBLIC_URL') ?? 'http://localhost:3000';
    const apiBase = this.config.get('API_PUBLIC_URL') ?? `http://localhost:${this.config.get('API_PORT') ?? 3001}`;

    const preference = await this.mp.createPreference({
      accessToken,
      externalReference: orden.id,
      notificationUrl: `${apiBase}/api/webhooks/mercadopago`,
      backUrls: {
        success: `${webBase}/pagar/${orden.tokenPago}?status=success`,
        failure: `${webBase}/pagar/${orden.tokenPago}?status=failure`,
        pending: `${webBase}/pagar/${orden.tokenPago}?status=pending`,
      },
      payerEmail: orden.clienteProveedor.email ?? undefined,
      items: [
        {
          title: `${orden.folio} — ${orden.concepto}`.slice(0, 256),
          quantity: 1,
          unit_price: monto,
          currency_id: 'MXN',
        },
      ],
    });

    const linkPago = preference.initPoint;
    const updated = await this.prisma.ordenCobro.update({
      where: { id: orden.id },
      data: {
        linkPago,
        mpPreferenceId: preference.id,
        linkPagoGeneradoEn: new Date(),
        metodoPago: MetodoPago.TARJETA,
      },
      include: { clienteProveedor: true },
    });

    return {
      ...this.mapOrdenPublic(updated),
      linkPublico: `${webBase}/pagar/${orden.tokenPago}`,
    };
  }

  async sincronizarPago(user: AuthUser, ordenId: string) {
    const proveedorId = requireProveedorUser(user);
    const orden = await this.prisma.ordenCobro.findFirst({
      where: { id: ordenId, proveedorId },
    });
    if (!orden) throw new NotFoundException('Orden de cobro no encontrada');
    if (!orden.mpPaymentId) {
      return this.mapOrdenPublic(
        await this.prisma.ordenCobro.findUniqueOrThrow({
          where: { id: orden.id },
          include: { clienteProveedor: true },
        }),
      );
    }

    const accessToken = await this.resolveAccessToken(proveedorId);
    const payment = await this.mp.getPayment(accessToken, orden.mpPaymentId);
    return this.applyPaymentStatus(orden.id, payment.id, payment.status, payment.transactionAmount);
  }

  async getOrdenPublica(tokenPago: string) {
    const orden = await this.prisma.ordenCobro.findUnique({
      where: { tokenPago },
      include: {
        clienteProveedor: { select: { nombre: true, empresa: true } },
        proveedor: { select: { nombre: true } },
      },
    });
    if (!orden) throw new NotFoundException('Link de pago no válido');

    return {
      folio: orden.folio,
      concepto: orden.concepto,
      monto: toNumber(orden.monto),
      estado: orden.estado,
      proveedorNombre: orden.proveedor.nombre,
      clienteNombre: orden.clienteProveedor.nombre,
      linkPago: orden.linkPago,
      tokenPago: orden.tokenPago,
      pagadoEn: orden.pagadoEn,
    };
  }

  async procesarWebhook(paymentId: string) {
    const ordenGuess = await this.prisma.ordenCobro.findFirst({
      where: { mpPaymentId: paymentId },
    });

    let accessToken: string;
    if (ordenGuess) {
      accessToken = await this.resolveAccessToken(ordenGuess.proveedorId);
    } else {
      accessToken = this.requireEnvToken();
    }

    const payment = await this.mp.getPayment(accessToken, paymentId);
    if (!payment.externalReference) {
      throw new BadRequestException('Pago sin referencia externa');
    }

    return this.applyPaymentStatus(
      payment.externalReference,
      payment.id,
      payment.status,
      payment.transactionAmount,
    );
  }

  private async applyPaymentStatus(
    ordenId: string,
    mpPaymentId: string,
    status: string,
    amount: number,
  ) {
    const orden = await this.prisma.ordenCobro.findUnique({
      where: { id: ordenId },
      include: { clienteProveedor: true },
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');

    if (status === 'approved') {
      const updated = await this.prisma.ordenCobro.update({
        where: { id: ordenId },
        data: {
          estado: EstadoOrdenCobro.PAGADO,
          mpPaymentId,
          referencia: `MP-${mpPaymentId}`,
          pagadoEn: new Date(),
          metodoPago: MetodoPago.TARJETA,
        },
        include: { clienteProveedor: true },
      });
      return this.mapOrdenPublic(updated);
    }

    const updated = await this.prisma.ordenCobro.update({
      where: { id: ordenId },
      data: { mpPaymentId },
      include: { clienteProveedor: true },
    });

    return {
      ...this.mapOrdenPublic(updated),
      mpStatus: status,
      mpAmount: amount,
    };
  }

  private async resolveAccessToken(proveedorId: string) {
    const config = await this.prisma.configPasarelaProveedor.findUnique({
      where: { proveedorId },
    });

    if (config?.activo && config.mercadoPagoAccessToken) {
      return config.mercadoPagoAccessToken;
    }

    return this.requireEnvToken();
  }

  private requireEnvToken() {
    const token = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    if (!token) {
      throw new BadRequestException(
        'Pasarela no configurada. Agregue MERCADOPAGO_ACCESS_TOKEN en el servidor o configure su token en Pasarela.',
      );
    }
    return token;
  }

  private webhookUrl() {
    const apiBase = this.config.get('API_PUBLIC_URL') ?? `http://localhost:${this.config.get('API_PORT') ?? 3001}`;
    return `${apiBase}/api/webhooks/mercadopago`;
  }

  private mapOrdenPublic<T extends { monto: unknown; clienteProveedor: { nombre: string } }>(row: T) {
    return {
      ...row,
      monto: toNumber(row.monto as never),
    };
  }
}
