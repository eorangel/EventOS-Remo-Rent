import { Injectable, NotFoundException } from '@nestjs/common';
import { TipoDocumento } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/pricing';
import { CreateDocumentoDto, GenerarDocumentoDto } from './dto/documento.dto';

const documentoInclude = {
  evento: {
    include: { cliente: { select: { id: true, nombre: true, empresa: true } } },
  },
  cotizacion: { select: { id: true, folio: true, total: true } },
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}

function formatFecha(date: Date) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
  }).format(date);
}

function wrapHtml(titulo: string, body: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>${titulo}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; color: #1e293b; line-height: 1.5; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 2rem; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f8fafc; }
    .total { font-weight: 700; font-size: 1.125rem; text-align: right; margin-top: 1rem; }
    .footer { margin-top: 3rem; font-size: 0.75rem; color: #94a3b8; }
  </style>
</head>
<body>
${body}
<div class="footer">Generado por EventOS — Remo&Rent</div>
</body>
</html>`;
}

@Injectable()
export class DocumentosService {
  constructor(private prisma: PrismaService) {}

  findAll(filters?: { eventoId?: string; tipo?: string }) {
    return this.prisma.documento.findMany({
      where: {
        ...(filters?.eventoId ? { eventoId: filters.eventoId } : {}),
        ...(filters?.tipo ? { tipo: filters.tipo as never } : {}),
      },
      include: documentoInclude,
      orderBy: { generadoEn: 'desc' },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.documento.findUnique({
      where: { id },
      include: documentoInclude,
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return doc;
  }

  create(dto: CreateDocumentoDto) {
    return this.prisma.documento.create({
      data: dto,
      include: documentoInclude,
    });
  }

  private async generarFolio(tipo: TipoDocumento): Promise<string> {
    const year = new Date().getFullYear();
    const prefix =
      tipo === 'COTIZACION'
        ? 'DOC-COT'
        : tipo === 'CONTRATO'
          ? 'DOC-CON'
          : tipo === 'RECIBO'
            ? 'DOC-REC'
            : tipo === 'ACTA_ENTREGA'
              ? 'DOC-ACT'
              : 'DOC';
    const count = await this.prisma.documento.count({
      where: { folio: { startsWith: `${prefix}-${year}-` } },
    });
    return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  async generar(dto: GenerarDocumentoDto) {
    const evento = await this.prisma.evento.findUnique({
      where: { id: dto.eventoId },
      include: { cliente: true },
    });
    if (!evento) throw new NotFoundException('Evento no encontrado');

    const folio = await this.generarFolio(dto.tipo);
    let titulo = '';
    let contenido = '';
    let cotizacionId: string | undefined = dto.cotizacionId;

    if (dto.tipo === TipoDocumento.COTIZACION) {
      const cotizacion = dto.cotizacionId
        ? await this.prisma.cotizacion.findUnique({
            where: { id: dto.cotizacionId },
            include: { items: true },
          })
        : await this.prisma.cotizacion.findFirst({
            where: { eventoId: dto.eventoId },
            orderBy: { createdAt: 'desc' },
            include: { items: true },
          });
      if (!cotizacion) throw new NotFoundException('Cotización no encontrada');
      cotizacionId = cotizacion.id;
      titulo = `Cotización ${cotizacion.folio}`;
      const filas = cotizacion.items
        .map(
          (item) =>
            `<tr><td>${item.descripcion}</td><td>${item.cantidad}</td><td>${formatMoney(toNumber(item.precioUnitario))}</td><td>${formatMoney(toNumber(item.subtotal))}</td></tr>`,
        )
        .join('');
      contenido = wrapHtml(
        titulo,
        `<h1>${titulo}</h1>
<div class="meta">Cliente: ${evento.cliente.nombre}${evento.cliente.empresa ? ` — ${evento.cliente.empresa}` : ''}<br/>Evento: ${evento.titulo}<br/>Fecha del evento: ${formatFecha(evento.fechaEvento)}<br/>Folio documento: ${folio}</div>
<table><thead><tr><th>Descripción</th><th>Cant.</th><th>P. unit.</th><th>Subtotal</th></tr></thead><tbody>${filas}</tbody></table>
<p class="total">Total: ${formatMoney(toNumber(cotizacion.total))}</p>`,
      );
    } else if (dto.tipo === TipoDocumento.CONTRATO) {
      titulo = `Contrato — ${evento.titulo}`;
      contenido = wrapHtml(
        titulo,
        `<h1>Contrato de servicios</h1>
<div class="meta">Folio: ${folio}<br/>Fecha: ${formatFecha(new Date())}</div>
<p><strong>Remo&Rent</strong> (el proveedor) y <strong>${evento.cliente.nombre}</strong>${evento.cliente.empresa ? ` (${evento.cliente.empresa})` : ''} (el cliente) acuerdan la prestación de servicios de renta de mobiliario y coordinación para el evento <strong>${evento.titulo}</strong>, programado para el ${formatFecha(evento.fechaEvento)}${evento.lugar ? ` en ${evento.lugar}` : ''}.</p>
<p>El cliente se compromete a cubrir los pagos conforme al calendario acordado. El proveedor garantiza la entrega, montaje y desmontaje del mobiliario contratado.</p>
<p style="margin-top:3rem">___________________________<br/>Remo&Rent</p>
<p style="margin-top:2rem">___________________________<br/>${evento.cliente.nombre}</p>`,
      );
    } else if (dto.tipo === TipoDocumento.RECIBO) {
      const movimiento = dto.movimientoId
        ? await this.prisma.movimientoFinanciero.findUnique({
            where: { id: dto.movimientoId },
          })
        : await this.prisma.movimientoFinanciero.findFirst({
            where: { eventoId: dto.eventoId },
            orderBy: { fecha: 'desc' },
          });
      if (!movimiento) throw new NotFoundException('Movimiento no encontrado');
      titulo = `Recibo de pago — ${evento.titulo}`;
      contenido = wrapHtml(
        titulo,
        `<h1>Recibo de pago</h1>
<div class="meta">Folio: ${folio}<br/>Fecha: ${formatFecha(movimiento.fecha)}</div>
<p>Recibimos de <strong>${evento.cliente.nombre}</strong> la cantidad de <strong>${formatMoney(toNumber(movimiento.monto))}</strong> por concepto de <strong>${movimiento.concepto}</strong>, correspondiente al evento <strong>${evento.titulo}</strong>.</p>
<p>Método de pago: ${movimiento.metodoPago.replace('_', ' ')}${movimiento.referencia ? `<br/>Referencia: ${movimiento.referencia}` : ''}</p>`,
      );
    } else if (dto.tipo === TipoDocumento.ACTA_ENTREGA) {
      titulo = `Acta de entrega — ${evento.titulo}`;
      contenido = wrapHtml(
        titulo,
        `<h1>Acta de entrega</h1>
<div class="meta">Folio: ${folio}<br/>Fecha: ${formatFecha(new Date())}<br/>Lugar: ${evento.lugar ?? 'Por definir'}</div>
<p>Se hace constar la entrega del mobiliario y materiales acordados para el evento <strong>${evento.titulo}</strong>, a satisfacción del cliente <strong>${evento.cliente.nombre}</strong>.</p>
<p>El cliente confirma la recepción en buen estado y acepta las condiciones de uso durante el evento.</p>
<p style="margin-top:3rem">___________________________<br/>Entrega — Remo&Rent</p>
<p style="margin-top:2rem">___________________________<br/>Recibe — ${evento.cliente.nombre}</p>`,
      );
    } else {
      titulo = `Documento — ${evento.titulo}`;
      contenido = wrapHtml(
        titulo,
        `<h1>${titulo}</h1><div class="meta">Folio: ${folio}</div><p>Documento generado para el evento ${evento.titulo}.</p>`,
      );
    }

    return this.prisma.documento.create({
      data: {
        eventoId: dto.eventoId,
        cotizacionId,
        tipo: dto.tipo,
        titulo,
        folio,
        contenido,
      },
      include: documentoInclude,
    });
  }
}
